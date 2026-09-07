import {format,parse,isValid,parseISO} from "date-fns";
import {getClassPageInfoByClassId,getStudentForListSearch,getStudentByDBiD,getClassByStudentDBiDClint
    ,insertNewPassTicket,getPassTicketViewInfoById,closePassTicketById,getPassTicketById
    ,getOpenPassTickets,deletePassTicket} from  '../models/studyHallModel.js'
import {getStudentDailySchedule} from './Mules/VAPIReader.js'
import {compareLists,createUIDNooks,uidNooks} from './Mules/UpdateFileData/compareToolsModule.js'
import {insertLogsBatch} from '../models/logsModel.js'
import {sendEmail,newPassEmailTemplate,updatedPassEmailTemplate,sendEmailTest} from './Mules/mailModule.js'

export const setClassPage = (req,res,thisClassId)=>{
    getClassPageInfoByClassId(thisClassId).then((rsp)=>{
        const classInfo = {}

        rsp.forEach((r,i)=>{
            if(i===0){
                classInfo.classid = r.classid
                classInfo.name = r.name
                classInfo.term =r.term
                classInfo.room = r.room
                classInfo.students={}
            }

            if(!(r.sid in classInfo.students)){
                
                classInfo.students[r.sid]={sid:r.sid,fname:r.fname,lname:r.lname,pname:r.pname,grade:r.grade
                ,ce_status:r.ce_status,out_time:r.out_time,in_time:r.in_time,outreason:r.outreason,positionx:r.positionx,positiony:r.positiony
                ,passes:[]}
                
                // classInfo.students.push(studentInfo[r.sid])
            }

            if(r.pt_bywho){
                const thisPass={duration:r.duration,at_date:r.at_date,at_time:r.at_time,on_period:r.on_period,report_to:r.report_to
                    ,reason:r.reason,requestor:r.requestor,pt_status:r.pt_status,out_dt:r.out_dt,in_dt:r.in_dt,reciever:r.reciever
                    ,need_review:r.need_review,pt_bywho:r.pt_bywho
                }

                classInfo.students[r.sid].passes.push(thisPass)
            }
        })

        res.json({rsp,classInfo})
    }) 
    .catch((err)=>{
        console.log('err',err)
    })
}

export const selectNameForPass=(req,res,thisSearch)=>{
    getStudentForListSearch(thisSearch).then((rsp)=>{
        res.json(rsp)
    })
    .catch((err)=>{
        console.log('err',err)
        res.json(err)
    })
}

export const getStudyHallsForThisStudentOnThisDate=(req,res,thisSearch)=>{
    // get student pid
    // get student daily schedule

    getStudentByDBiD(thisSearch.thisStudent.id).then((rsp)=>{
        if(rsp.length!==1){
            res.json({status:'Not Ok',message:'dsakfiho38'})
            return
        }

        getStudentDailySchedule(thisSearch.thisDate,rsp[0].pid).then((thisDailyScheduleRSP)=>{
            const theseSH = thisDailyScheduleRSP
                            .filter((r)=>(r.item_description.includes('Study Hall') || r.item_description.includes('Academic Resource Period')))
                            .map((r)=>{
                                    return {
                                        period:r.period.replace('Period','').replace('(US)','').trim()
                                        ,start:r.start_time
                                        ,end:r.end_time
                                        ,className:r.item_description
                                        ,fac:r.teacher
                                        ,clint:r.record_id
                                        }
                                })


            res.json(theseSH)
        })
        .catch((thisDailyScheduleErr)=>{
            console.log('thisDailyScheduleErr',thisDailyScheduleErr)
        })
    })
    .catch((err)=>{
        console.log('err',err)
        res.json(err)
    })
}

export const addNewPass=(req,res,passData)=>{
    const nameArray = passData.name.split('-')

    if(nameArray.length===2){
        const thisStudRecId=nameArray[1].trim()
            getClassByStudentDBiDClint(thisStudRecId,passData.atClintRecId).then((rsp)=>{
                if(rsp.length===1){
                    const thisRec=rsp[0]
                    const toInsert={
                        classid:thisRec.classid
                        ,sid:thisRec.sid
                        ,duration:(passData.duration==='A'?passData.duration:'P')
                        ,at_date:passData.onDate
                        ,at_time:(passData.duration!=='A'?passData.duration:null)
                        ,on_period:passData.atPeriod
                        ,report_to:passData.reportTo
                        ,reason:passData.reason
                        ,requestor:req.user.email
                        ,status:'New'
                        ,bywho:req.user.email
                    }

                    insertNewPassTicket(toInsert).then((insertRsp)=>{
                        console.log('insertRsp',insertRsp)
                        const thisInsertId=(insertRsp.length===1?insertRsp[0].id:'Unknown')
                        const thisMessage= newPassEmailTemplate(thisInsertId,passData.reportTo,passData.onDate,passData.atPeriod
                            ,passData.duration,req.user.email)
                        console.log('thisMessage',thisMessage)

                        const thisEmailObj = {to:req.user.email,from:req.user.email,subject:`Study Hall Pass #${thisInsertId}`,html:thisMessage}
                        sendEmail(thisEmailObj)
                        // sendEmail({to:'syamashiro@iolani.org',subject:'Test 2',text:'Hello 2'}) 
                        res.json({rsp,passData,toInsert,insertRsp})
                    })
                    .catch((err)=>{
                        res.json({status:'Not Ok',message:'rl4p04392eefeookqae94jae',err})
                    })
                }
                else{
                    res.json({status:'Not Ok',message:'rl4p04392qae94jae'})
                }                
            })
    }
    else
    {
        res.json({status:'Not Ok',message:'kajefoa3aefa'})
    }

}


export const viewPassReadOnly=(req,res,thisPassId)=>{
    getPassTicketViewInfoById(thisPassId).then((thisPassTicketRsp)=>{
        if(thisPassTicketRsp.length===1){
            console.log(thisPassTicketRsp[0])
            const {...thisDataSet} = thisPassTicketRsp[0]

            thisDataSet.nameDisplay = `${thisDataSet.lname}, ${thisDataSet.pname} [${thisDataSet.grade}] - ${thisDataSet.stud_id}`
            thisDataSet.displayAtDate= (isValid(thisDataSet.at_date)?format(thisDataSet.at_date,'yyyy-MM-dd'):'')
            thisDataSet.displayAtTime= (isValid(thisDataSet.at_time)?format(parse(thisDataSet.at_time,'HH:mm:ss',new Date()),'HH:mm'):'')
            thisDataSet.requestorDisplay = thisDataSet.requestor.replace('@iolani.org','')
            thisDataSet.requestorSignedDisplay=(isValid(thisDataSet.requestor_signed)?format(thisDataSet.requestor_signed,"MM/dd/yyyy hh:mm:ss a"):'')

            console.log('thisDataSet.displayAtTime',thisDataSet.displayAtTime)

            console.log('(thisDataSet.status===New)',thisDataSet.status,(thisDataSet.status==='New'))
                thisDataSet.reportedAtTimeDisplay = format(thisDataSet.in_dt,"hh:mm")
                thisDataSet.departedAtTimeDisplay = format(thisDataSet.out_dt,"hh:mm")
                thisDataSet.receiverDisplay = (thisDataSet.receiver?thisDataSet.receiver.replace('@iolani.org',''):'')
                thisDataSet.receiverSignedDisplay=format(thisDataSet.receiver_signed,"MM/dd/yyyy hh:mm:ss a")
                res.render('passTicketCompletedViewOnly',{status:'Ok',title:'',subtitle:'(Closed)',userName:req.user.email,data:thisDataSet})
    

            

    // res.render('passTickeComplete',{title:'',subtitle:'',userName:req.user.email})
        }
        else{
            res.json({status:'Not Ok',message:'dfeij233'})  
        }
    })
}

export const viewToCompletePass=(req,res,thisPassId)=>{
    getPassTicketViewInfoById(thisPassId).then((thisPassTicketRsp)=>{
        if(thisPassTicketRsp.length===1){
            console.log(thisPassTicketRsp[0])
            const {...thisDataSet} = thisPassTicketRsp[0]

            thisDataSet.nameDisplay = `${thisDataSet.lname}, ${thisDataSet.pname} [${thisDataSet.grade}] - ${thisDataSet.stud_id}`
            thisDataSet.displayAtDate= (isValid(thisDataSet.at_date)?format(thisDataSet.at_date,'yyyy-MM-dd'):'')
            thisDataSet.displayAtTime= (isValid(thisDataSet.at_time)?format(parse(thisDataSet.at_time,'HH:mm:ss',new Date()),'HH:mm'):'')
            thisDataSet.requestorDisplay = thisDataSet.requestor.replace('@iolani.org','')
            thisDataSet.requestorSignedDisplay=(isValid(thisDataSet.requestor_signed)?format(thisDataSet.requestor_signed,"MM/dd/yyyy hh:mm:ss a"):'')

            console.log('thisDataSet.displayAtTime',thisDataSet.displayAtTime)

            console.log('(thisDataSet.status===New)',thisDataSet.status,(thisDataSet.status==='New'))
            if(thisDataSet.pt_status==='New'){
                res.render('passTicketComplete',{status:'Ok',title:'',subtitle:'',userName:req.user.email,data:thisDataSet})
            } else {

                thisDataSet.reportedAtTimeDisplay = format(thisDataSet.in_dt,"hh:mm")
                thisDataSet.departedAtTimeDisplay = format(thisDataSet.out_dt,"hh:mm")
                thisDataSet.receiverDisplay = (thisDataSet.receiver?thisDataSet.receiver.replace('@iolani.org',''):'')
                thisDataSet.receiverSignedDisplay=format(thisDataSet.receiver_signed,"MM/dd/yyyy hh:mm:ss a")
                res.render('passTicketCompletedViewOnly',{status:'Ok',title:'',subtitle:'(Closed)',userName:req.user.email,data:thisDataSet})
            }

            

    // res.render('passTickeComplete',{title:'',subtitle:'',userName:req.user.email})
        }
        else{
            res.json({status:'Not Ok',message:'dfeij233'})  
        }
    })
}


export const viewToEditPass=(req,res,thisPassId)=>{
    getPassTicketViewInfoById(thisPassId).then((thisPassTicketRsp)=>{
        if(thisPassTicketRsp.length===1){
            console.log(thisPassTicketRsp[0])
            const {...thisDataSet} = thisPassTicketRsp[0]            
       
            thisDataSet.nameDisplay = `${thisDataSet.lname}, ${thisDataSet.pname} [${thisDataSet.grade}] - ${thisDataSet.stud_id}`
            thisDataSet.displayAtDate= (isValid(thisDataSet.at_date)?format(thisDataSet.at_date,'yyyy-MM-dd'):'')
            thisDataSet.displayAtTime= (isValid(thisDataSet.at_time)?format(parse(thisDataSet.at_time,'HH:mm:ss',new Date()),'HH:mm'):'')
            thisDataSet.requestorDisplay = thisDataSet.requestor.replace('@iolani.org','')
            thisDataSet.requestorSignedDisplay=(isValid(thisDataSet.requestor_signed)?format(thisDataSet.requestor_signed,"MM/dd/yyyy hh:mm:ss a"):'')

            console.log('thisDataSet.displayAtTime',thisDataSet.displayAtTime)

            if(thisDataSet.status==='New'){
                res.render('passTicketEdit',{status:'Ok',title:'',subtitle:'',userName:req.user.email,data:thisDataSet})
            } else {

                thisDataSet.reportedAtTimeDisplay = format(thisDataSet.in_dt,"hh:mm")
                thisDataSet.departedAtTimeDisplay = format(thisDataSet.out_dt,"hh:mm")
                thisDataSet.receiverDisplay = (thisDataSet.receiver?thisDataSet.receiver.replace('@iolani.org',''):'')
                thisDataSet.receiverSignedDisplay=format(thisDataSet.receiver_signed,"MM/dd/yyyy hh:mm:ss a")
                res.render('passTicketEdit',{status:'Ok',title:'',subtitle:'',userName:req.user.email,data:thisDataSet})
            }

            

    // res.render('passTickeComplete',{title:'',subtitle:'',userName:req.user.email})
        }
        else{
            res.json({status:'Not Ok',message:'dfeij233'})  
        }
    })
}

export const closePass=(req,res,passData)=>{
    const today = new Date()
    const passId = passData.passId
    const reportedAtTimeWithDate = parse(passData.reportedAtTime,"HH:mm",today)
    const departedAtTimeWithDate = parse(passData.departedAtTime,"HH:mm",today)

    const toUpdate={
        out_dt:departedAtTimeWithDate
        ,in_dt:reportedAtTimeWithDate
        ,receiver:req.user.email
        ,receiver_signed:new Date()
        ,status:'Cmp'
    }

    if(passId){
            closePassTicketById(passId,toUpdate).then((returnRsp)=>{
                if(returnRsp.length===1){
                    const receiver_signed_display = format(returnRsp[0].receiver_signed,"MM/dd/yyyy hh:mm:ss a")
                    
                    res.json({status:'Ok',sig:returnRsp[0].receiver.replace('@iolani.org',''),sigDT:receiver_signed_display})
                }else{
                    res.json({status:'Not Ok',message:'iekajfeio3odf0eoaef'})                    
                }
            })
    } else{
        res.json({status:'Not Ok',message:'AEAE03odf0eoaef'})
    }
}

export const updatePass = async(req,res,passData)=>{

    // res.json({passData})
    // return

    const nameArray = passData.name.split('-')

    if(nameArray.length===2){
    const thisStudRecId=nameArray[1].trim()
    const today = new Date()

    console.log('thisStudRecId',thisStudRecId)
    // console.log('passData.passId',passData.passId)
    getPassTicketById(passData.passId).then((currentPassRsp)=>{
        if(currentPassRsp.length===1){
            console.log('currentPassRsp',currentPassRsp)
             const thisCurrentTickePass = currentPassRsp[0]
             getClassByStudentDBiDClint(thisStudRecId,passData.atClintRecId).then((newClassIdRsp)=>{
                if(newClassIdRsp.length===1){
                    const thisRec=newClassIdRsp[0]
                    const compareAObj=[{
                        id:passData.passId
                        ,classid:thisRec.classid
                        ,sid:thisRec.sid
                        ,duration:(passData.duration==='A'?passData.duration:'P')
                        ,at_date:parseISO(passData.onDate,"yyyy-MM-dd")
                        ,at_time:(passData.duration!=='A'?passData.duration:null)
                        ,on_period:passData.atPeriod
                        ,report_to:passData.reportTo
                        ,reason:passData.reason
                        // ,requestor:req.user.email
                        // ,status:'New'
                        // ,bywho:req.user.email
                    }]

                    const comparedResult = compareLists(compareAObj,currentPassRsp,(r)=>r.id,['classid','duration','at_date','at_time','on_period','report_to','reason'])
                    const createUIDNooksResult = createUIDNooks(comparedResult,'pass_ticket',null,null,(r)=>{r.updatedatetime=new Date(); return r},['id','bywho','updatedatetime'])

                    console.log('comparedResult',comparedResult)
                    const toLogs = comparedResult.reason.map((r)=>{return {key:'pass_ticket',keyint:passData.passId,action:`${r.field}`,value:`${r.display}`,bywho:req.user.email}})
                    // [{action:'TestAction',value:'TestValue',bywho:req.user.email}]
                    // insertLogsBatch({table:'logs',insert:toLogs})

                    uidNooks(createUIDNooksResult).then((uidNooksRsp)=>{
                        insertLogsBatch({table:'logs',insert:toLogs})

                        const thisMessage= updatedPassEmailTemplate(passData.passId,passData.reportTo,passData.onDate,passData.atPeriod
                            ,passData.duration,req.user.email)
                        console.log('thisMessage',thisMessage)

                        const thisEmailObj = {to:req.user.email,from:req.user.email,subject:`Study Hall Pass #${passData.passId} Updated`,html:thisMessage}
                        sendEmail(thisEmailObj)


                        const returnDisplay={bywho:uidNooksRsp.update[0][0].bywho,updatedatetime:uidNooksRsp.update[0][0].updatedatetime,updatedatetimeDisplay:format(uidNooksRsp.update[0][0].updatedatetime,'MM/dd/yyyy HH:mm:ss a')}
                        res.json({passData,thisCurrentTickePass,compareAObj,comparedResult,uidNooksRsp,returnDisplay})
                    })
                    .catch((err)=>{
                        res.json({status:'Not Ok',message:'dedkjoiejjfei'})    
                    })

                    
                    // res.json({passData,thisCurrentTickePass,compareAObj,comparedResult})

                }
                else{
                     res.json({status:'Not Ok',message:'dytaania94o4900aj'})    
                }
            })
        }else{
            res.json({status:'Not Ok',message:'iejke93ndeio'})        
        }
    })
    .catch((err)=>{
        res.json({status:'Not Ok',message:'pao49a3e9fkg49oiund'})
    })

    }
    else{
        res.json({status:'Not Ok',message:'egdiang49r9pzoei'})
    }
}


export const deletePass=(req,res,deletePassObj)=>{
    // deletePassObj.thisPassId
    deletePassTicket(req.user.email,deletePassObj.thisPassId).then((rsp)=>{ // can't be completed
        if(rsp.length===1){
            console.log('rspreturning',rsp)
            res.json({status:'Ok',message:rsp[0].id})
        }
        else{
            res.json({status:'Not Ok',message:`No Record l=${rsp.length} i=${2}`})
        }

    })
    .catch((err)=>{
        res.json((err))
    })

}


const passListDisplayFormat=(currentUserEmail,thisDataSet)=>{
    // r.displayDate = format(r.at_date,"MM/dd/yyyy")
    // return r

    const displayPassList = thisDataSet.map((r)=>{
        r.displayDate = format(r.at_date,"MM/dd/yyyy")
        console.log('r.duration',r.duration)

        if(r.duration==='A'){
            r.displayDuration = r.duration
        }
        else{
            const durationDate = parse(r.at_time,"HH:mm:ss",new Date())
            console.log('durationDate',durationDate)
            r.displayDuration =format(durationDate,"h:mm a")
        }
       
        r.allowEdit=(r.requestor===currentUserEmail && r.pt_status ==='New')
        r.allowDelete=(r.requestor===currentUserEmail)

        return r
    })

    return displayPassList
}

export const getOpenPasses=(req,res,subtitle,isOnlyToday,whereObjArray)=>{
    getOpenPassTickets(isOnlyToday,whereObjArray).orderBy('at_date','period').then((thesePasses)=>{
        res.render('passTicketList',{title:'Passes',subtitle:subtitle,displayPasses:passListDisplayFormat(req.user.email,thesePasses)})
    })
    .catch((err)=>{
        res.json(err)
    })
}

export const testSendMail= async ()=>{
    // {to,subject,text,html,}
    const sendEmailResult = await sendEmail({to:'syamashiro@iolani.org',subject:'Test 2',text:'Hello 2'}) 

    console.log('sendEmailResult',sendEmailResult)
}