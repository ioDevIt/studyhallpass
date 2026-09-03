 import { isValid,parseISO } from "date-fns";
 import { formatInTimeZone } from "date-fns-tz";
 import os from "os"
 import path from "path"
 import express from "express"
 const router = express.Router()

 import logger from "../modules/Mules/logger.js";
 import {readCopyOfLog} from  '../modules/Mules/loggerReads.js'
 
 import {setMenu} from '../modules/menuModule.js'
 import {setClassPage,selectNameForPass,getStudyHallsForThisStudentOnThisDate,addNewPass,viewToCompletePass,viewToEditPass
        ,closePass} from '../modules/studyHallModule.js'

import {insertLog,insertLogAsync,trace,traceObj} from '../modules/Mules/logsModule.js'
import {encrypt,decrypt,decryptData} from '../modules/Mules/cryptdecrypt.js'

const homeDir = os.homedir()
const projName ="openhouse"
const usMapPath=path.join(homeDir,'Projects',projName,"public","pdf",'USMaps.pdf');
// const usMapPath=path.join(homeDir,"public","pdf",'USMaps.pdf');


console.log('---------------------In Base---------------------')

router.use('/',(req,res,next)=>{
    console.log('--------------------- In Use / ---------------------')
    /**
     *  Add route access and security code
     */
    next()
})

router.get('/',(req,res)=>{
    console.log('--------------------- Get / ---------------------')
    setMenu(req,res)

    // console.log('User',req.user)
    // res.json(req.user)
})

router.get('/fac/:classid',(req,res)=>{
    console.log('--------------------- Get /fac ---------------------')
    setClassPage(req,res,req.params.classid)
})

router.get('/createPass',(req,res)=>{
    res.render('passTicket',{title:'',subtitle:'',userName:req.user.email})
})

router.get('/completePass/:pt_id',(req,res)=>{
    viewToCompletePass(req,res,req.params.pt_id)
})

router.get('/editPass/:pt_id',(req,res)=>{
    viewToEditPass(req,res,req.params.pt_id)
})

router.post('/getPassStudentList',(req,res)=>{
    console.log(req.body.search)
    selectNameForPass(req,res,req.body.search)
    // res.json(req.body)
})

router.post('/getSHPeriods',(req,res)=>{
    const thisDate= req.body.search
    const thisStudent = req.body.studentInfo
    console.log(req.body.search)
    getStudyHallsForThisStudentOnThisDate(req,res,{thisDate,thisStudent})
    // selectNameForPass(req,res,req.body.search)
    // res.json(req.body)
})

router.post('/newPass',(req,res)=>{
    console.log(req.body)
    addNewPass(req,res,req.body.packageData)
    // getStudyHallsForThisStudentOnThisDate(req,res,{thisDate,thisStudent})
    // selectNameForPass(req,res,req.body.search)
    // res.json(req.body)
})

router.post('/closePassTicket',(req,res)=>{
    console.log('----------------------')
    console.log(req.body)
    closePass(req,res,req.body.packageData)
    // getStudyHallsForThisStudentOnThisDate(req,res,{thisDate,thisStudent})
    // selectNameForPass(req,res,req.body.search)
    // res.json(req.body)
})








/**************** Test ******************/


router.get('/testreadlog',async (req,res)=>{

    // const getLogInfo = await readCopyOfLog("./logs/app.log")
    // console.log('getLogInfo',getLogInfo)

    readCopyOfLog("./logs/app.log").then((rsp)=>{
        logger.info('In testread',rsp)
        res.json({status:'logs',rsp})
    })
    .catch((err)=>{
        res.json({status:'Error',err})
    })
})

router.get('/map',(req,res)=>{
    logger.info({userId:req.user},"Getting Maps")
    // req.log.debug(req.user,"Check Id")
    // req.log.info(`Id=${req.user.id}`);
    res.sendFile(usMapPath)
})

/****************************************/

export default router