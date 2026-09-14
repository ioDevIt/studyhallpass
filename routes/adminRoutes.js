 import express from "express"
 const router = express.Router()

router.get('/',(req,res)=>{
    res.render('adminCTL',{title:"Admin",subtitle:"Controls"})
})


router.post('/syncdata',(req,res)=>{


    res.json({status:'Ok'})
})





 export default router