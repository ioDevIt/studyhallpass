import express from 'express'
import 'dotenv/config'

import cookieParser from 'cookie-parser'
import {RedisStore} from "connect-redis"
import session from "express-session"
import {createClient} from "redis"
import { pinoHttp } from 'pino-http'

// import multer from "multer"

import passport from "passport"
import ejs from 'ejs'
import { fileURLToPath } from 'url'
import path from "path"

import uidSafe from "uid-safe"
import favicon from "serve-favicon"

import {ClassEnrollmentClearOutsCron,syncClassesCron,syncFacStudentsEnrollmentsCron} from "./modules/Mules/Crons/cronsModule.js"

import logger from './modules/Mules/logger.js'
import {trace} from "./modules/Mules/logsModule.js"



const app = express()

app.use(pinoHttp({logger}))


/****** sockets ********/
import {createServer} from 'node:http';
import {Server} from 'socket.io';
import {setSocketHandler} from "./modules/Mules/socketHandler.js"
const server = createServer(app);
export const io = new Server(server);
/******* end sockects ********/

const __dirname = path.dirname(fileURLToPath(import.meta.url))

app.use(favicon(path.join(__dirname,'public','favicon.ico')))
app.set('view engine','ejs')

// Initialize client.
let redisClient = createClient()
redisClient.connect().catch(console.error)

// Initialize store.
let redisStore = new RedisStore({
  client: redisClient,
  prefix: "foundry:",
})

const preObj={url:''}
let initURL=''

app.use(cookieParser())

// Initialize session storage.

// Change to only set session if no session or session expired

app.use((req,res,next)=>{
  initURL=(req.session===undefined?'':req.session.initialURL)
  console.log(req.session)
  console.log('initURL',initURL)
  next()
})


// https://www.google.com/search?q=express-session+resetting+session+every+request&oq=express-session+resetting+session+every+request&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIHCAEQIRigATIHCAIQIRiPAjIHCAMQIRiPAtIBCTE3MTQzajBqN6gCALACAA&sourceid=chrome&ie=UTF-8
app.use(
  session({
    store: redisStore,
    secure:false,
  
    resave: false, // required: force lightweight session keep alive (touch)
    saveUninitialized: false, // recommended: only save session when data exists
    secret: "keyboard cat",
    cookie:{maxAge:(60000*60*2)}
  }),
)

app.use((req,res,next)=>{
    const reqMethodLC = req.method.toLocaleLowerCase()

    if(reqMethodLC==="get"){        //  && (req.url!=='/favicon.ico')
        req.session.sessionGETID = uidSafe.sync(5)
    }

    if(reqMethodLC==='post'){
      // console.log('req.body.postid',req.body.postid)  **** needs to be implemented ***
    }

    next()
})

app.use(express.urlencoded({extended:true}))
app.use(express.json())

app.use((express.static(path.join(__dirname,'public'))))

import dotEnvMod from "./modules/Mules/dotenvModule.js"
import authRoutes from "./routes/authRoutes.js"
import passportServices from "./services/passport.js"
import baseRoutes from "./routes/baseRoutes.js"
import adminRoutes from "./routes/adminRoutes.js"
import nuRoutes from "./routes/mainNonUserRoutes.js"
import firstFenceRoutes from "./routes/firstFenceRoutes.js"
import accessRoutes from "./routes/accessRoutes.js"
import epRoutes from "./routes/epRoutes.js"

import updateDataRoutes from "./routes/updateDataRoutes.js"

/**********************************************************/
// import sampleRoutes from "./routes/sampleRoutes.js"
/**********************************************************/

// const dotEnv = dotEnvMod()

app.get('/test',(req,res)=>{
  req.log.info("Homepage requested");
  res.send('in test')
})


// Any Routes for non users, or no login needed
app.use('/',nuRoutes)

// If the initial URL is not and auth Route, Gather initial URL to redirect to
app.use((req,res,next)=>{
  preObj.url="New Val"

  if(req.session.initialURL === undefined){
      // console.log('setting req.session.initialURL ')
      trace("",['setting req.session.initialURL'],["green"])
      req.session.initialURL = req.originalUrl
  }else{
      trace("",['Not setting req.session.initialURL'],["red"])
  }  

  next()
})

app.use(passport.initialize());
app.use(passport.session());

passportServices(passport)
app.use('/auth',authRoutes)

app.get("/logout", function (req, res) {
  console.log("In Logout");
//   req.session = null;
  
  req.session.destroy((err)=>{
    if(err){
        console.error("Error destroying session:",err)
        res.status(500).send("Logout Failed")
    }

    res.clearCookie('connect.sid')
    // res.redirect('/login')
    res.render("logout", { Glogin: false,Vlogin:true, message: "You have been logged out" });
  });

});


app.get('/testBefore',(req,res)=>{
    console.log('user',req.user)

    res.send('Before')
})

// Needs CSRF before entering this point with POST
// app.use(csrfProtection);
// app.use((err, req, res, next) => {
//     if (err.code !== "EBADCSRFTOKEN") {
//       console.log("token = " + req.csrfToken());
//       res.locals.csrfToken = req.csrfToken();
//       return next(err);
//     } else {
//       res.send("xs");
//     }
//   });

// determines users ok to pass
app.use('/',firstFenceRoutes)

// if (app.get('env') === 'production') {
//   app.set('trust proxy', 1) // trust first proxy
//   sess.cookie.secure = true // serve secure cookies
// }

app.get('/testAfter', (req,res)=>{
    console.log('test After')
    res.send({w:'test After',u:req.user})
})

app.use('/access',accessRoutes)
app.use('/ep',epRoutes)
app.use('/updatedata',updateDataRoutes)

app.use('/',baseRoutes)
app.use('/admin',adminRoutes)

// app.use('/sample',sampleRoutes)

app.use((req,res)=>{
  console.log('No matching route')
  res.render('welcome',{message:"No Access"})
})

ClassEnrollmentClearOutsCron()
syncClassesCron()
syncFacStudentsEnrollmentsCron()

/****** sockets ********/
setSocketHandler(io)
server.listen(process.env.PORT,()=>{
    console.log(`Listening on PORT ${process.env.PORT}`)
})
/***********************/

/********** comment if using sockets ******/
// app.listen(process.env.PORT,()=>{
//     console.log(`Listening on PORT ${process.env.PORT}`)
//     logger.info({ port:process.env.PORT }, "Server started");
// })