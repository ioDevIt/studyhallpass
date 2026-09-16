import {CronJob} from 'cron'

import {clearOuts} from '../../../models/studyHallModel.js'
import {updateClasses,updateFacStudentsEnrollments} from '../../updateDataModule.js'

export const ClassEnrollmentClearOutsCron = () =>{
    console.log('Starting ClassEnrollmentClearOuts')

    const ClearOutsCron = new CronJob(
        '0 2 8 * * *',
        async function(){
            const clearedRSP = await clearOuts()    
            
            console.log('Cleared Outs')

            const thisDate = new Date()
            console.log(`${thisDate.getFullYear()}-${thisDate.getMonth()+1}-${thisDate.getDate()} ${thisDate.getHours()}:${thisDate.getMinutes()}:${thisDate.getSeconds()}`)
                        },
                null, // maybe later log in DB
                true,
                'HST'
                )
}

export const syncClassesCron = () =>{
    console.log('Starting syncClassesCron')

    const ClearOutsCron = new CronJob(
        '0 14 8 * * *',
        async function(){
            const updatedClasses = await updateClasses()    
            
            console.log('updated classes')

            const thisDate = new Date()
            console.log(`${thisDate.getFullYear()}-${thisDate.getMonth()+1}-${thisDate.getDate()} ${thisDate.getHours()}:${thisDate.getMinutes()}:${thisDate.getSeconds()}`)
                        },
                null, // maybe later log in DB
                true,
                'HST'
                )
}

export const syncFacStudentsEnrollmentsCron = () =>{
    console.log('Starting syncFacStudentsEnrollmentsCron')

    const ClearOutsCron = new CronJob(
        '0 15 11 * * *',
        async function(){
            const updatedClasses = await updateFacStudentsEnrollments()    
            
            console.log('fac student enrollments')

            const thisDate = new Date()
            console.log(`${thisDate.getFullYear()}-${thisDate.getMonth()+1}-${thisDate.getDate()} ${thisDate.getHours()}:${thisDate.getMinutes()}:${thisDate.getSeconds()}`)
                        },
                null, // maybe later log in DB
                true,
                'HST'
                )
}