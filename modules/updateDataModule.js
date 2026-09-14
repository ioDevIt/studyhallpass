import {getClasses,getClassEnrollments,getStudents} from "../models/studyHallModel.js"
import {compareLists,createUIDNooks,uidNooks} from './Mules/UpdateFileData/compareToolsModule.js'
import {getAllUSClassesBySchoolYear,getAllCurrentSchoolYearUSClassSchedulesByFacId,getEnrolledStudentsByClassIntId
    ,getStudentsAPIInfoByID,getUSStudentsByAdvisors} from './Mules/VAPIReader.js'


export const updateClasses = async (req,res)=>{
    const currentStudyHallClasses =[]
    const classesUS = await getAllUSClassesBySchoolYear(2026)
    const classesUSSH = classesUS.filter((r)=>(r.class_id.substring(0,2)==='SH'))
    // .filter((r)=>(!r.class_id.includes('SH08')))
    const classUSSHDictionary = {}
    const classesUSSHPRimaryTeacherId = []

    classesUSSH.forEach((r)=>{
        if(!(r.id in classUSSHDictionary)){
            classUSSHDictionary[r.id]={id:r.id,class_id:r.class_id,description:r.description}
        }

        if(!(r.primary_teacher_id in classesUSSHPRimaryTeacherId)){classesUSSHPRimaryTeacherId.push(r.primary_teacher_id)}
    })

    const classSchedules = await getAllCurrentSchoolYearUSClassSchedulesByFacId(classesUSSHPRimaryTeacherId)
    const studyHallClasses = classSchedules
            // .filter((r)=>(!r.class_id.includes('SH08')))
            .filter((r)=>{
                if( (r.class_id.substring(0,2)==='SH') && (!currentStudyHallClasses.includes(r.internal_class_id))){
                    currentStudyHallClasses.push(r.internal_class_id)
                    return true
                }
                else{
                    return false
                }
            })
            .map((r)=>{
                    return {clint:r.internal_class_id,classid:r.class_id,fac_id:r.primary_teacher_id
                        ,term:r.grading_period.abbreviation.replace('US ',''),gradingPeriodId:r.grading_period.id,day:r.day.abbreviation
                        ,period:r.block.abbreviation.replace('P',''), room:r.room.abbreviation, roomId:r.room.id
                        ,name:classUSSHDictionary[r.internal_class_id].description
                    }
                })

    const dbClasses = await getClasses()
    const comparedInfo = compareLists(studyHallClasses,dbClasses,(r)=>r.clint,['term','period','room'])


    const currentUIDNooks = createUIDNooks(comparedInfo,'classes',(r)=>{return {clint:r.clint,classid:r.classid,name:r.name,period:r.period,term:r.term,room:r.room}}
            ,(r)=>r.id,(r)=>r)


    const uidNooksReturns = await uidNooks(currentUIDNooks)

    return {classesUS,classUSSHDictionary,classesUSSHPRimaryTeacherId
        ,classesUSSHPRimaryTeacherIdLen:classesUSSHPRimaryTeacherId.length,studyHallClasses,comparedInfo
        ,currentUIDNooks,uidNooksReturns
        }


        



    // {"clint":20345,"classid":"SH070004","fac_id":103023,"gradingPeriod":"ALL","gradingPeriodId":50,"day":"US E","period":"P1","room":"C-105","roomId":197}
    return {studyHallClasses,dbClasses}
}

export const getEnrollments = async (useDB)=>{
    let theseClasses
    if(useDB){
        theseClasses = await getClasses()   // ok if updateClasses runs first, since the classes should be accurate
    }
    else{
        const theseAPIClasses =await getAllUSClassesBySchoolYear(2026)

        console.log(1/n) // need to map API Classes to db Classes
    }

    const usAdvisors=[123980,123569,104293,123756,130911,130451,104324,123839,128820,126749,123157,114177,123441,122617]
    const theseClassClints = theseClasses.map((r)=>r.clint)
    const classEnrollments = await getEnrolledStudentsByClassIntId(theseClassClints)

    const currentEnrolledStudentsSet=new Set()
    

    classEnrollments.forEach((r)=>{
        currentEnrolledStudentsSet.add(r.person_id)
        // if(!(currentEnrolledStudents.includes(r.person_id))){currentEnrolledStudents.push(r.person_id)}
    })

    const currentEnrolledStudents = [...currentEnrolledStudentsSet] // needs to come after the above to be set

    const usStudents = (await getUSStudentsByAdvisors(usAdvisors))
        .filter((r)=>{
            return (currentEnrolledStudents.includes(r.id))
        })
        .map((r)=>{
        return {pid:r.id,fname:r.first_name,lname:r.last_name,pname:r.preferred_name,email:r.email_1,grade:r.grade_level}
    })

    
    let studentInfoReference = []
    const studentInfoReferenceDictionary ={}
    const studentInfoDictionary = {}

    const batchSize = 200
    for(let i=0;i<currentEnrolledStudents.length;i+= batchSize)
    {
        const thisArray = currentEnrolledStudents.slice(i,i+batchSize)
        studentInfoReference = studentInfoReference.concat(await getStudentsAPIInfoByID(thisArray.join(';')))  //currentEnrolledStudents.join(';'))
    }

    usStudents.forEach((r)=>{
        studentInfoDictionary[r.pid]=r
    })

    const classDictionary={}
    const studentDictionary ={} // by pid
    const classEnrollmentDictionary={}  // by clint


    studentInfoReference.forEach((r)=>{
        studentInfoReferenceDictionary[r.pid]=r

        if(r.pid in studentInfoDictionary){
            studentInfoReferenceDictionary[r.pid].fname= studentInfoDictionary[r.pid].fname
            studentInfoReferenceDictionary[r.pid].lname= studentInfoDictionary[r.pid].lname
            studentInfoReferenceDictionary[r.pid].pname= studentInfoDictionary[r.pid].pname
            studentInfoReferenceDictionary[r.pid].email= studentInfoDictionary[r.pid].email
            studentInfoReferenceDictionary[r.pid].grade= studentInfoDictionary[r.pid].grade
        }
    })

    // return currentEnrolledStudentsSet

    theseClasses.forEach((r)=>{
        if(!(r.clint in classDictionary)){classDictionary[r.clint]={}}

        classDictionary[r.clint].classid=r.classid
        classDictionary[r.clint].name=r.name
    })

    classEnrollments.forEach((r)=>{
        if(!(r.person_id in studentDictionary)){
            
            studentDictionary[r.person_id]={
            pid:r.person_id,sid:studentInfoReferenceDictionary[r.person_id].sid,grade:studentInfoReferenceDictionary[r.person_id].grade
            ,pname:studentInfoReferenceDictionary[r.person_id].pname
            ,fname:studentInfoReferenceDictionary[r.person_id].fname
            ,lname:studentInfoReferenceDictionary[r.person_id].lname
            ,email:studentInfoReferenceDictionary[r.person_id].email}}

        if(!(r.internal_class_id in classEnrollmentDictionary)){classEnrollmentDictionary[r.internal_class_id]={clint:r.internal_class_id
            ,enrollments:[]}
            }

        const thisClassId = (r.internal_class_id in classDictionary?classDictionary[r.internal_class_id].classid:'???')
        classEnrollmentDictionary[r.internal_class_id].enrollments.push({pid:r.person_id,classid:thisClassId,sid:studentInfoReferenceDictionary[r.person_id].sid})
    })

    return {studentDictionary,classEnrollmentDictionary,studentInfoReference}
}


export const updateFacStudents = async (theseFacStudentsAPI)=>{  // Only do Students
    const theseStudentsDB = await getStudents()
    const compareTheseFacStudentsAPI = theseFacStudentsAPI.map((r)=>{
        r.grade=''+r.grade

        return r
    })

    const comparedInfo = compareLists(theseFacStudentsAPI,theseStudentsDB,(r)=>r.pid,['sid','fname','lname','pname','grade'])
    const currentUIDNooks = createUIDNooks(comparedInfo,'facstudents',(r)=>{return {pid:r.pid,sid:r.sid,fname:r.fname,pname:r.pname,lname:r.lname,grade:r.grade,type:'S'}}
            ,(r)=>r.id,(r)=>r)

    const uidNooksReturns = await uidNooks(currentUIDNooks)

    return {theseFacStudentsAPI,theseStudentsDB,comparedInfo,currentUIDNooks,uidNooksReturns}
}


export const updateEnrollments = async (theseEnrollmentsAPI)=>{  // Only do Students
    const theseEnrollmentsDB = await getClassEnrollments()
    const partialData = theseEnrollmentsAPI

    const comparedInfo = compareLists(partialData,theseEnrollmentsDB,(r)=>(`${r.classid}_${r.sid}`),[])  // see if empty array issues
 
    const currentUIDNooks = createUIDNooks(comparedInfo,'class_enrollment',(r)=>{return {classid:r.classid,sid:r.sid}}
            ,(r)=>r.id,(r)=>r)

    const uidNooksReturns = await uidNooks(currentUIDNooks)
    return {comparedInfo,currentUIDNooks,uidNooksReturns}
}