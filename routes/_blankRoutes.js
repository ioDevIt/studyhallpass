 import express from "express"
 const router = express.Router()

 import {insertLog} from "../modules/Mules/logsModule.js"

console.log('---------------------In Base---------------------')

router.use('/',(req,res,next)=>{
    /**
     *  Add route access and security code
     */
    next()
})

router.get('/',(req,res)=>{
        insertLog(`Log in`,`${JSON.stringify(profile.displayName)}`,profile._json.email.trim())
        .then(()=>{
            // console.log('****************************** Logged ************************************')

            const returnData ={user:req.user}
            res.render('welcome',{logout:true,message:JSON.stringify(returnData)})
        })
})

router.get('/',async (req,res)=>{
    const thisLogBack = await    insertLog(`Log in`,`${JSON.stringify(profile.displayName)}`,profile._json.email.trim())

    res.json(thisLogBack)
})


export default router