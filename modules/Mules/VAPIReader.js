// import dotEnvMod from "../modules/dotenvModule.js"
import vapiFetchModule from "./VAPIFetch.js"
import { formatInTimeZone } from "date-fns-tz"

import {veraEnrollmentMap} from "./VAPIReaderTools.js"



const fetchForReaderRaw = (thisURL,thisScope)=>{
        return vapiFetchModule.fetchVAPI(thisURL,thisScope)
    }

const fetchForReader = async (thisURL,thisScope,filterBy,mapData)=>{
        if(filterBy!==null && filterBy!==undefined && mapData!==null && mapData!==undefined){
            console.log('mapData',mapData)
            console.log('Filter & Map')
            return   (await vapiFetchModule.fetchVAPI(thisURL,thisScope)).filter(filterBy).map(mapData)
        } else if(filterBy!==null && filterBy!==undefined){
            console.log('No Map')
            return   (await vapiFetchModule.fetchVAPI(thisURL,thisScope)).filter(filterBy)
        } else if(mapData!==null && mapData!==undefined){
            console.log('No Filter')
            return   (await vapiFetchModule.fetchVAPI(thisURL,thisScope)).map(mapData)
        } 

        console.log('No Filter No Map')    
        return vapiFetchModule.fetchVAPI(thisURL,thisScope)
    }


/**************************** Fetches ******************************/


export  const getClassPermissionsByPersonIdSchoolYear=async (thisPersonId,thisSchoolYear)=>{    
        const thisURL = `https://api.veracross.com/iolani/v3/academics/permissions?school_level=4&person_id=${thisPersonId}&school_year=${thisSchoolYear}`
        const apiData=await vapiFetchModule.fetchVAPI(thisURL,"academics.permissions:list")
        return apiData

        if(studentDapiDataata.length==1){
            return studentData[0]
        }

        return {grade_level:null}; // Fix Here
    }

export  const getAllCurrentSchoolYearUSClasses=async ()=>{
        const thisSchoolYear = 2026
        const thisURL = `https://api.veracross.com/iolani/v3/academics/classes?school_level=4&school_year=${thisSchoolYear}`
        
        return vapiFetchModule.fetchVAPI(thisURL,"academics.classes:list")
    }

export  const getAllCurrentSchoolYearUSClassSchedules=async ()=>{
        const thisSchoolYear = 2026
        const thisURL = `https://api.veracross.com/iolani/v3/academics/class_schedules?school_level=4&day_id=14;15&school_year=${thisSchoolYear}`
        
        return vapiFetchModule.fetchVAPI(thisURL,"academics.class_schedules:list")
    }

export  const getAllCurrentSchoolYearUSClassSchedulesByFacId=async (facIdsArray)=>{
        const thisSchoolYear = 2026
        const thisURL = `https://api.veracross.com/iolani/v3/academics/class_schedules?school_level=4&day_id=14;15&school_year=${thisSchoolYear}&primary_teacher_id=${facIdsArray.join(';')}`
        
        return vapiFetchModule.fetchVAPI(thisURL,"academics.class_schedules:list")
    }

export  const getEnrolledStudentsByClassIntId=async (theseClassIntIdArray)=>{   
        const thisURL = `https://api.veracross.com/iolani/v3/academics/enrollments?currently_enrolled=true&internal_class_id=${theseClassIntIdArray.join(';')}`
        const thisScope = "academics.enrollments:list"

        return await fetchForReader(thisURL,thisScope)
    }


export  const getEnrolledStudentsByClassIntId_Map=async (thisClassIntId,filterBy,mapData=veraEnrollmentMap)=>{   
        const thisURL = `https://api.veracross.com/iolani/v3/academics/enrollments?currently_enrolled=true&internal_class_id=${thisClassIntId}`
        const thisScope = "academics.enrollments:list"

        return await fetchForReader(thisURL,thisScope,filterBy,mapData)        
    }

export  const getStudentsAPIInfoByID=async (thesePIDs,filterBy,mapData)=>{   
        const thisURL = `https://api.veracross.com/iolani/v3/person_reference_number?type=2546&person_id=${thesePIDs}`
        const thisScope = "person_reference_number:list"

        const thisDataSet = await fetchForReader(thisURL,thisScope)

        return thisDataSet.map((r)=>{
            const thisDataArray = r.value.split('|')

            return {pid:r.person_id,sid:thisDataArray[0],email:thisDataArray[1]}}
        )
    }

export  const getUSStudentsByAdvisors=async (advisorIdsArray,filterBy)=>{   
        const thisURL = `https://api.veracross.com/iolani/v3/students?advisor_id=${advisorIdsArray.join(';')}`
        const thisScope = "students:list"

        return await fetchForReader(thisURL,thisScope)        
    }

export  const getAllUSClassesBySchoolYear=async (thisSchoolYear)=>{    
        const thisURL = `https://api.veracross.com/iolani/v3/academics/classes?school_level=4&school_year=${thisSchoolYear}`
        
        return vapiFetchModule.fetchVAPI(thisURL,"academics.classes:list")
    }

export  const getAllClassesByClint=async (theseClint)=>{    
        const thisURL = `https://api.veracross.com/iolani/v3/academics/classes?id=${theseClint}`
        
        return vapiFetchModule.fetchVAPI(thisURL,"academics.classes:list")
    }

export  const getTodaysAttendance=async (thesePids)=>{
        const thisDate = formatInTimeZone(new Date(), "Pacific/Honolulu", "yyyy-MM-dd") //  '2023-09-06'
        const thisURL = `https://api.veracross.com/iolani/v3/master_attendance?attendance_date=${thisDate}&person_id=${thesePids}`     
        const apiData=await vapiFetchModule.fetchVAPI(thisURL,"master_attendance:list")
        
        console.log('thisDate',thisDate)
        return apiData
    }

export  const getStudentDailySchedule=async (thisDate,pid)=>{    
        const thisURL = `https://api.veracross.com/iolani/v3/academics/student_daily_schedules?calendar_date=${thisDate}&person_id=${pid}`
        
        return vapiFetchModule.fetchVAPI(thisURL,"academics.student_daily_schedules:list")
    }


