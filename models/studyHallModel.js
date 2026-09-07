import dotenvMod from "../modules/Mules/dotenvModule.js"
import knex from 'knex'
import {format,parse} from "date-fns";

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
    return knexPG('pass_ticket').select('*').where({id:thisId})
}

export const deletePassTicket=(userid,passid)=>{
    return knexPG('pass_ticket').update({is_active:false}).where({id:passid,requestor:userid,status:'New'}).returning(['id'])
}

export const getPassTicketViewInfoById=(thisId)=>{    
    return knexPG('v_class_enrollment_pass_info').select('stud_id','fname','pname','lname','grade','pt_id','clint','classid','duration','at_date','at_time','on_period','report_to','reason','requestor','requestor_signed','out_dt','in_dt','receiver','receiver_signed','pt_status').where({pt_id:thisId})
}

export const closePassTicketById=(thisId,updateData)=>{    
// out_dt | in_dt | receiver | receiver_signed 
    return knexPG('pass_ticket').update(updateData).where({id:thisId}).returning(['id','out_dt','in_dt','receiver','receiver_signed'])
}

export const getOpenPassTickets=(isOnlyToday=true,whereObjArray=[])=>{    
// out_dt | in_dt | receiver | receiver_signed 
    const todayCompare = format(new Date(),'yyyy-MM-dd')
    const todayCompareOp = (isOnlyToday?'=':'>=')

    const thisSQLKnex = knexPG('v_class_enrollment_pass_info').select('clint','classid','name','period','term','room','sid','pid','fname','pname','lname','pt_id','duration','at_date','at_time','on_period','report_to','reason','requestor','requestor_signed','pt_status','need_review','pt_bywho','pt_createddatetime')
        .whereNotNull('pt_bywho')
        .where('at_date',todayCompareOp,todayCompare)

    whereObjArray.forEach((r)=>{
        console.log('r',r)
        if(r.type==='whereIn'){
            thisSQLKnex[r.type](r.field,r.value)
        }else{
            thisSQLKnex[r.type](r.value)
        }

    })

    return thisSQLKnex
}