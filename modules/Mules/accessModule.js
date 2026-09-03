import {getAllRBACByGeneralRoleIdAndUser,getAllRBACByUser,getAllRBAC,getAllRoleTypes,allowThisGradeAccess,getGradeAccessDB,setGradeAccessDB} from '../../models/accessModel.js'
import { sortBy } from '../../tools/tools.js'

const VRolesStaffParent =['Staff1','Parent','Staff']
const accessPasses=['syamashiro@iolani.org','sweaver@iolani.org','laraishiraishi@iolani.org','lhadlock@iolani.org','zzz2601@iolani.org']

const passVRolesStaffParent=(thisUserInfo)=>{
    const passFilter = VRolesStaffParent.filter((r)=>{
        return (thisUserInfo.VOnly.Roles.includes(r))
    })

    return (!passFilter.length===0)
}

export const getUserRoles=async (thisUID)=>{
    const thisInfo = getAllRBACByUser(thisUID)
    console.log('thisInfo',thisInfo)
    return thisInfo
}

const passGeneralRolesByDB = async (thisGeneralRoleId, thisUser)=>{
    return await getAllRBACByGeneralRoleIdAndUser(thisGeneralRoleId, thisUser.id)
}

export const passStatic = (thisPassString) =>{
    return (accessPasses.includes(thisPassString))
}

export const passFirstFence=(thisUserInfo)=>{
        // console.log('thisUserInfo',thisUserInfo)
    // Uncomment the one to use
        return (thisUserInfo.Roles.includes('Parent') || ['mmorioka@iolani.org','skimball@iolani.org'].includes(thisUserInfo.email))  //  || thisUserInfo.id ===129863
        // return (thisUserInfo.Roles.includes("ADMIN"))
        // return thisUserInfo.Roles.includes('ADMIN') // static check   || passStatic(thisUserInfo.email)
        // return passStatic(thisUserInfo.email)  // static check
        // return passGeneralRolesByDB('ADMIN',thisUserInfo.id)
        // return passVRolesStaffParent(thisUserInfo)

        // return true  //  let everyone through        
        return false  // don't let anyone through
    }

export const getAllRoles = async (thisSearchType)=>{
    const allRBAC = await getAllRBAC()
    let theseRBACs;    

    if(thisSearchType!==undefined){
        console.log('thisSearchType',thisSearchType)
        theseRBACs=allRBAC.filter((r)=>{
            if('generalRoles' in thisSearchType){
                if(thisSearchType.generalRoles.includes(r['general_type'])){
                    return true
                }
            }

            if('roles' in thisSearchType){
                console.log("r['roleid']",r['roleid'])
                if(thisSearchType.roles.includes(r['roleid'])){
                    return true
                }
            }

            if('userid' in thisSearchType){
                console.log("r['uid']",r['uid'])
                if(thisSearchType.userid.includes(r['uid'])){
                    return true
                }
            }

            return false
        })
    }
    else{
        theseRBACs=allRBAC
    }

    const returnData ={generalRoles:[],roles:[],list:theseRBACs}

    allRBAC.forEach((r)=>{
        if(!(returnData.generalRoles.includes(r.general_type))){
            returnData.generalRoles.push(r.general_type)
        }

        if(!(returnData.roles.includes(r.roleid))){
            returnData.roles.push(r.roleid)
        }
    })

    return returnData
}

export const getAllRoleTypesForDisplay= async ()=>{
    const thisData = await getAllRoleTypes()
    const passRoleTypesObj = {}

    thisData.forEach((r)=>{
        if(!(r.roleid in passRoleTypesObj)){
            const {url_entry,is_active,bywho,createddatetime,...passOn}=r
            passRoleTypesObj[r.roleid]=passOn
        }
    })

    return passRoleTypesObj
}

export const allowStudentByGrade = async (thisGrade)=>{
    console.log('thisGrade',thisGrade)
    const thisGradeAccess = await allowThisGradeAccess(thisGrade)

    console.log('thisGradeAccess',thisGradeAccess)

    return thisGradeAccess
}

export const getGradeAccess = (req,res)=>{
    getGradeAccessDB().then((rsp)=>{
        const data=[...rsp]        
        sortBy(data,(r)=>{return (r.grade*1)})

        res.render('accessByGrade',{title:'Grade Level Access',postid:req.session.sessionGETID,data:data})
    })
    .catch((err)=>{
        res.json(err)
    })
}

export const setGradeAccess = (res,grade,value)=>{
    setGradeAccessDB(grade,value).then((rsp)=>{
        console.log('rsp',rsp)
        res.json(rsp[0])
    })
    .catch((err)=>{
        res.json(err)
    })
}

export const getClassesAccess = async (user )=>{

}