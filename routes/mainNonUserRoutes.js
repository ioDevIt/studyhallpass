import express from "express"
const router = express.Router()

router.get('/welcome',(req,res)=>{
    res.render('welcome',{Glogin:false, Vlogin:true,message:"Login?"})
})

router.get('/nu',(req,res)=>{
    console.log("router  /nu")
    res.render('welcomeNonUser')
    return
})

export default router