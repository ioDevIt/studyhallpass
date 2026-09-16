 import { isValid,parseISO } from "date-fns";
 import { formatInTimeZone } from "date-fns-tz";
 import os from "os"
 import path from "path"
 import express from "express"
 const router = express.Router()

 import logger from "../modules/Mules/logger.js";

 import {getAllCurrentSchoolYearUSClasses,getAllCurrentSchoolYearUSClassSchedules,getAllClassesByClint} from "../modules/Mules/VAPIReader.js"
 
import {insertLog,insertLogAsync,trace,traceObj} from '../modules/Mules/logsModule.js'
import {encrypt,decrypt,decryptData} from '../modules/Mules/cryptdecrypt.js'

import {updateClasses,getEnrollments,updateFacStudentsEnrollments, updateFacStudents,updateEnrollments} from '../modules/updateDataModule.js'

import {testData,testEnrollmentsData} from '../modules/updateDataTest.js'



const homeDir = os.homedir()
const projName ="studyhallfromscratch"

const isProd=false
const mainPath = (isProd?homeDir:path.join(homeDir,'Projects',projName))
// const usMapPath=path.join(mainPath,"public","pdf",'USMaps.pdf');


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
    // getOpenHouseStudents(req,res)

    console.log('User',req.user)
    res.json(req.user)
})


/************* Production POST **********************/
router.post('/updateClasses', async (req,res)=>{
    const studyHallClasses= await updateClasses(req,res)

    res.json({studyHallClasses}) // studyHallClasses,len:studyHallClasses.length,s
})

router.post('/updateEnrollments', async (req,res)=>{
    const updateFacStudentsEnrollmentsRsp = await updateFacStudentsEnrollments()
    res.json(updateFacStudentsEnrollmentsRsp)
    return

    const enrollmentsObj= {studentInfoReference:testData,classEnrollmentDictionary:testEnrollmentsData}  // await getEnrollments(true)
    const updateFacStudentsReturns = await updateFacStudents(enrollmentsObj.studentInfoReference)

    let enrollmentsArray =[]

    for(const[key,value] of Object.entries(enrollmentsObj.classEnrollmentDictionary)){ // same ast enroolementsObj to test
        enrollmentsArray=enrollmentsArray.concat(value.enrollments)
    }

    const updateEnrollmentReturns = await updateEnrollments(enrollmentsArray)

    res.json(updateEnrollmentReturns)
})


/**************  Test GET *****************************/

router.get('/updateClasses', async (req,res)=>{
    const studyHallClasses= await updateClasses(req,res)

    res.json({studyHallClasses}) // studyHallClasses,len:studyHallClasses.length,s
})

router.get('/updateEnrollments', async (req,res)=>{
    // res.json(testEnrollmentsData)
    // return

    const updateFacStudentsEnrollmentsRsp = await updateFacStudentsEnrollments()
    res.json(updateFacStudentsEnrollmentsRsp)
    return


    const enrollmentsObj= {studentInfoReference:testData,classEnrollmentDictionary:testEnrollmentsData}  // await getEnrollments(true)

    const updateFacStudentsReturns = await updateFacStudents(enrollmentsObj.studentInfoReference)

    let enrollmentsArray =[]

    for(const[key,value] of Object.entries(enrollmentsObj.classEnrollmentDictionary)){ // same ast enroolementsObj to test
        enrollmentsArray=enrollmentsArray.concat(value.enrollments)
    }

    const updateEnrollmentReturns = await updateEnrollments(enrollmentsArray)

    res.json(updateEnrollmentReturns)
    return

    // const updateFacStudentsReturns = await updateFacStudents(enrollmentsObj.studentInfoReference)

    res.json(updateFacStudentsReturns)
    return


    res.json({enrollmentsObj,updateFacStudentsReturns}) // studyHallClasses,len:studyHallClasses.length,s
})

export default router