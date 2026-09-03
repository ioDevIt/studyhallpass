import vapiBearerSSOModule from './VAPIBearerSSOModule.js';
// const studentScheduleSearchEP = /([a-zA-Z]{2,})\,\s([a-zA-Z]{2,})-(\d)/

const vapiBearerSSOModuleFn = vapiBearerSSOModule()

// scopes "relationships:read person_reference_number:read relationships:list students:list academics.student_daily_schedules:list academics.teacher_daily_schedules:list academics.permissions:list"
// scopes2 "students:read"
    const fetchVAPI=async (thisURL, thisScope)=>{
        const scopeObj={
            url:thisURL
            ,scope:thisScope
            ,withDataFn:'withDataFn'
        }

        console.log('scopeObj',scopeObj)
        // console.log(1/n)

        const scopeData = await vapiBearerSSOModuleFn.getBearerTokenAxiosSyncBack(scopeObj);
        const newData = scopeData.map((thisRec)=>{
            const {record_type,period_abbreviation,item_status,virtual_meeting_url,...returnData}=thisRec
            return returnData
        })

        return newData
    }

    const fetchVAPIAsync=(thisURL, thisScope)=>{
        const scopeObj={
            url:thisURL
            ,scope:thisScope
            ,withDataFn:'withDataFn'
        }

        vapiBearerSSOModuleFn.getBearerTokenAxiosSyncBack(scopeObj).then((scopeData)=>{
            const newData = scopeData.map((thisRec)=>{
                const {record_type,period_abbreviation,item_status,virtual_meeting_url,...returnData}=thisRec
                return returnData
            })
    
            return newData
        })
    }


export default {fetchVAPI,fetchVAPIAsync}