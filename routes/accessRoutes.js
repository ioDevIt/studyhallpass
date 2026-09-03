import express from 'express'
const router = express.Router()

import {getAllRoles,getAllRoleTypesForDisplay,getGradeAccess,setGradeAccess} from '../modules/Mules/accessModule.js'

router.use((req,res,next)=>{
    if(req.user.Roles.includes('ADMIN')){
        next()
    }
    else{
        res.render('welcome',{message:`Please contact Site Admin if you need access to ${req.originalUrl} ...`})
    }    
})

router.get('/',async (req,res)=>{
    console.log('in Access')
    const data= await getAllRoles()
    const roleTypesObj = await getAllRoleTypesForDisplay()
    const roleTypes = Object.keys(roleTypesObj)

    console.log('roleTypesObj',roleTypesObj)

    res.render('accessList',{data,roleTypesObj,roleTypes,csrfToken:req.session.sessionGETID})
})

router.get('/user/:userid',async (req,res)=>{
    const data= await getAllRoles({userid:req.params.userid})
    const roleTypesObj = await getAllRoleTypesForDisplay()
    const roleTypes = Object.keys(roleTypesObj)

    res.render('accessList',{data,roleTypesObj,roleTypes,csrfToken:req.session.sessionGETID})
})

router.get('/roles/:thisRole',async (req,res)=>{
    const data= await getAllRoles({roles:req.params.thisRole})
    const roleTypesObj = await getAllRoleTypesForDisplay()
    const roleTypes = Object.keys(roleTypesObj)

    res.render('accessList',{data,roleTypesObj,roleTypes,csrfToken:req.session.sessionGETID})
})

router.get('/generalroles/:thisRole',async (req,res)=>{
    const data= await getAllRoles({generalRoles:req.params.thisRole})
    const roleTypesObj = await getAllRoleTypesForDisplay()
    const roleTypes = Object.keys(roleTypesObj)

    console.log('data',data)

    res.render('accessList',{data,roleTypesObj,roleTypes,csrfToken:req.session.sessionGETID})
})

// router.get('/viewGradeAccessList',(req,res)=>{
//     getGradeAccess(req,res)
// })

// router.post('/setgradeaccess',(req,res)=>{
//     console.log(req.body)
//     const data=req.body.data
//     setGradeAccess(res,data.grade,data.value)

//     // res.json({value:true})
// })

export default router