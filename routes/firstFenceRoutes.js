import express from "express"
const router = express.Router()

let hitCount=0;
import {passFirstFence, allowStudentByGrade} from "../modules/Mules/accessModule.js"
const allowedUsers = ['syamashiro@iolani.org','jpapayoanou@iolani.org']

const typesAllowed=["G","V"]
const InDomainNotAllowed='In Domain Not Allowed'

router.use(async (req, res, next)=>{
    console.log('In First Fence')
    // console.log(req.user)
    console.log(hitCount++)

    let nextPage='nu'

    // if non user go to login
    // if user but not Iolani domain go to welcome with message
    // if user with Iolani domain then next()

    // console.log('User.email', req.user.email)
    // console.log('User', req.user)

    if(req.user){
        if(req.user.type && (typesAllowed.includes(req.user.type))){
        // console.log('Set to Next',req.user)
            if(passFirstFence (req.user)) // add additional access checks [passFirstFence])
            {
            //    const rspAllow =(req.user.grade!==null? await allowStudentByGrade(req.user.grade):false)

                    // console.log('rspAllow',rspAllow)
                    // if(rspAllow || allowedUsers.includes(req.user.email)){
                    //     nextPage='next'
                    // }
                    // else{
                    //     nextPage=InDomainNotAllowed
                    // }

                console.log('Pass First Fence')
                nextPage='next'
            }
            else{
                nextPage=InDomainNotAllowed
            }
        }
        else
        {
            nextPage='Not Allowed'
        }
    }

    // Only determines display
    console.log('firstfence nextPage',nextPage)
    if(nextPage==='next'){
        next()
    } else if(nextPage===InDomainNotAllowed) {
         console.log('--------------------- Domain User---------------------')
        res.render('welcome',{message:'Please contact Site Admin if you need access...'})
    } else if(nextPage==='Not Allowed') {
         console.log('--------------------- Non Domain User---------------------')
        res.render('welcome',{message:'Non Domain'})
    }
    else{
        console.log('--------------------- No User---------------------')
        res.render('welcome',{Glogin:false,Vlogin:true})
    }
})

export default router