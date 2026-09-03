import dotenvMod from "../modules/Mules/dotenvModule.js"
import knex from 'knex'

const knexPgSetup = dotenvMod().knex
const knexPG = knex(knexPgSetup)


export  const getClasses=()=>{
        return knexPG('classes').select('*').where({is_active:true})
    }

export  const getClassEnrollments=()=>{
        return knexPG('class_enrollment').select('*').where({is_active:true})
    }

export  const getStudents=()=>{
        return knexPG('facstudents').select('*').where({is_active:true,type:'S'})
    }

export  const getClassesByClint=(clintArray)=>{
        return knexPG('classes').select('*').where({is_active:true}).whereIn('clint',clintArray)
    }

export  const getClassPageInfoByClassId=(thisClassId)=>{
        return knexPG('v_class_enrollment_pass_info').select('*').where('classid',thisClassId)
    }

export const getStudentForListSearch = (thisSearch)=>{
    return knexPG('facstudents').select('id','pname','fname','lname','grade').where({is_active:true,type:'S'}).andWhere((qry)=>{
        qry.where('lname','ilike',`%${thisSearch}%`)
        .orWhere('pname','ilike',`%${thisSearch}%`)
    })
}

export const getStudentByDBiD=(thisId)=>{
        return knexPG('facstudents').select('*').where({is_active:true,type:'S',id:thisId})
    }

export const getClassByStudentDBiDClint=(thisStudId,thisClint)=>{
    return knexPG('v_class_enrollment').select('*').where({stud_id:thisStudId,clint:thisClint})
}

export const insertNewPassTicket=(data)=>{
    return knexPG('pass_ticket').insert(data).returning(['id','requestor','requestor_signed'])
}

export const getPassTicketById=(thisId)=>{    
    return knexPG('v_class_enrollment_pass_info').select('fname','pname','lname','grade','pt_id','duration','at_date','at_time','on_period','report_to','reason','requestor','requestor_signed','out_dt','in_dt','receiver','receiver_signed','pt_status').where({pt_id:thisId})
}

export const closePassTicketById=(thisId,updateData)=>{    
// out_dt | in_dt | receiver | receiver_signed 
    return knexPG('pass_ticket').update(updateData).where({id:thisId}).returning(['id','out_dt','in_dt','receiver','receiver_signed'])
}