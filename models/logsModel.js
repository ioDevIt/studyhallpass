import dotenvMod from "../modules/Mules/dotenvModule.js"
import knex from 'knex'

const knexPgSetup = dotenvMod().knex
const knexPG = knex(knexPgSetup)

export const addLog=(action,value,bywho)=>{
    // Example
    // const confirmationLog={action:'Confirmed Emergency Contact',value:thisDataSet.confirmText,bywho:req.user.preferred_username}
        return knexPG('logs').insert({action,value,bywho}).returning('id')
    }

export  const getLogs=(fromDate,toDate)=>{
        if(fromDate===undefined && toDate === undefined){ return knexPG('logs').orderBy('id','desc')}
        if(fromDate!==undefined && toDate === undefined){ return knexPG('logs').where('createddatetime','>',fromDate.toString()).orderBy('id','desc')} 

        return knexPG('logs').select('*').orderBy('id','desc')
    }

export  const getLogsConfirmedNoChange=(fromDate,toDate)=>{
        if(fromDate===undefined && toDate === undefined){ return knexPG('logs').where({action:"Confirmed No Change Emergency Contact"}).orderBy('id','desc')}
        if(fromDate!==undefined && toDate === undefined){ return knexPG('logs').where('createddatetime','>',fromDate.toString()).andWhere({action:"Confirmed No Change Emergency Contact"}).orderBy('id','desc')} 

        return knexPG('logs').select('*').where({action:"Confirmed No Change Emergency Contact"}).orderBy('id','desc')
    }

export const insertLogsBatch=(uidData)=>{
    return knexPG.transaction(async (trx) => {
            const returningIds={
                insert:(uidData.insert)?[]:undefined
            }

            if(uidData.insert){
                for(const row of uidData.insert){
                    console.log('uidData.insert',uidData.insert)
                    console.log('row',row)
                    returningIds.insert.push(await trx(uidData.table).insert(row).returning('id'))
                }
            }

            return returningIds
        });
}