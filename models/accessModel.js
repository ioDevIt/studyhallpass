import knex from "knex";
import dotnetMod from "../modules/Mules/dotenvModule.js"

const DOTNET = dotnetMod()
const knexPg = knex(DOTNET.knex)

export const getAllRBAC= async ()=>{
    const thisData = await knexPg('v_rbac')
    return thisData
}

export const getAllRBACByGeneralRoleIdAndUser= async (generalRoleId,userid)=>{
    const thisData = await knexPg('v_rbac').select('*').where({uid:userid,general_type:generalRoleId})
    return thisData
}

export const getAllRBACByUser= async (userid)=>{
    const thisData = await knexPg('v_rbac').select('*')
    .where({'uid':userid})
    return thisData
}

export const getAllRBACByUserRoleIdAsync= (userRoleId)=>{
    return knexPg('v_rbac').select('*').where({id:userRoleId})
}

export const getAllRoleTypes = async () =>{
    const thisData = await knexPg('roles').select('*').where({is_active:true})
    return thisData
}

export const getAllUsersRoles = async () =>{
    return await knexPg('users_roles').where({is_active:true})
}

export const deleteRBAC= async (req,rbacId)=>{
    const thisData = await knexPg('users_roles').update({is_active:false}).where({id:rbacId})
    return thisData
}

export const addRBAC= async (req,newInfo)=>{
    const insertId = await knexPg('users_roles').insert({uid:newInfo.newName, roleid: newInfo.newRole,bywho:req.user.id}).returning('id')
    
    console.log('insertId',{insertId:insertId[0].id,uid:newInfo.newName, roleid: newInfo.newRole})
    return {insertId:insertId[0].id,uid:newInfo.newName, roleid: newInfo.newRole}
}

export const editRBAC= async (req,rbacId,newRole)=>{
    const thisData = await knexPg('users_roles').update({roleid:newRole}).where({id:rbacId}).returning(['id','uid','roleid'])

    const returnData={id:thisData[0].id ,roleid:thisData[0].roleid, username:thisData[0].uid } 
    return returnData
}

export const allowThisGradeAccess = async (thisGrade)=>{
    const thisData = await knexPg('access_grade').select('*').where({grade:thisGrade})
    return thisData[0].is_allow
}

export const getGradeAccessDB = ()=>{
    return knexPg('access_grade').select('grade','is_allow').where({is_active:true})
}

export const setGradeAccessDB = (thisGrade, thisValue)=>{
    return knexPg('access_grade').returning(['grade','is_allow']).update({is_allow:thisValue}).where({grade:thisGrade})
}