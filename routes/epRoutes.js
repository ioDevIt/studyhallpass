import express from 'express'
const router = express.Router()

import {deleteRBAC,addRBAC,editRBAC,getAllRBACByUserRoleIdAsync} from '../models/accessModel.js'

router.use((req,res,next)=>{

    next()
})

router.get('/vRBAC',(req,res)=>{
    res.render('userAcces')
})

router.post('/aedRBAC',(req,res)=>{
    console.log('In Post aedRBAC')
    console.log(req.body.search)    

    switch(req.body.search.action){
        case 'D':
            const idArray=req.body.search.id.split('-')
            deleteRBAC(req,idArray[0]).then((resp)=>{
                res.json({status:'Ok'})
            })
        return

        case 'A':
            const newName= req.body.search.new.newName
            const newRole = req.body.search.new.newRole

            console.log('Will Add ' + newName+ ' ' + newRole)

            addRBAC(req,{newName,newRole}).then((resp)=>{
                console.log('inserted data',resp)
                getAllRBACByUserRoleIdAsync(resp.insertId).then((returnResp)=>{
                    console.log('Returning',{status:'Ok',dataBack:returnResp})
                    res.json({status:'Ok',dataBack:returnResp})
                })
            })
        return

        case 'E':
            const editId=req.body.search.new.id.split('-')[0]
            const editRole = req.body.search.new.newRole

            editRBAC(req,editId,editRole).then((resp)=>{
                console.log('resp',resp)
                res.json({status:'Ok',dataBack:resp})
            })
        return

        default:
    }    
})

export default router;