import {format,parse,isValid,parseISO} from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import {getClassPageInfoByClassId,getStudentForListSearch,getStudentByDBiD,getClassByStudentDBiDClint
    ,insertNewPassTicket,getPassTicketViewInfoById,closePassTicketById,getPassTicketById
    ,getOpenPassTickets,deletePassTicket,updateSeatChange,updateEnrollmentStatus} from  '../models/studyHallModel.js'
import {getStudentDailySchedule} from './Mules/VAPIReader.js'
import {compareLists,createUIDNooks,uidNooks} from './Mules/UpdateFileData/compareToolsModule.js'
import {insertLogsBatch} from '../models/logsModel.js'
import {sendEmail,newPassEmailTemplate,updatedPassEmailTemplate,sendEmailTest} from './Mules/mailModule.js'
import {sendSocketMessage} from './Mules/socketHandler.js'
import {getTodaysAttendance} from './Mules/VAPIReader.js'


export const alertRoomAboutPassForToday =(thisAction,thisPassInfo)=>{
    console.log('thisPassInfo',thisPassInfo)
    const todayInTimeZone = formatInTimeZone(new Date(),"pacific/Honolulu", "yyyy-MM-dd")
    const passDateInTimeZone = formatInTimeZone(thisPassInfo.at_date,"pacific/Honolulu", "yyyy-MM-dd")
    console.log(todayInTimeZone,passDateInTimeZone)
    if(todayInTimeZone===passDateInTimeZone){
        console.log(`Will alert room for today ${thisAction}`,thisPassInfo)   
        sendSocketMessage('PassList',{action:thisAction,value:thisPassInfo})
    }
    else{
        console.log(`Not today`,thisPassInfo)
    }
}

export const alertRoomAboutPassAll =(thisAction,thisPassInfo)=>{
    console.log('thisPassInfo',thisPassInfo)
    const todayInTimeZone = formatInTimeZone(new Date(),"pacific/Honolulu", "yyyy-MM-dd")
    const passDateInTimeZone = formatInTimeZone(thisPassInfo.at_date,"pacific/Honolulu", "yyyy-MM-dd")
    console.log(todayInTimeZone,passDateInTimeZone)

    thisPassInfo.isToday=(todayInTimeZone===passDateInTimeZone)
    console.log(`Will alert room all ${thisAction}`,thisPassInfo)   
    sendSocketMessage('PassList',{action:thisAction,value:thisPassInfo})
}

const earlyDismissalCodes =[50]
const absentCodes = [29,30,75,76,32,33]

export const setClassPage = (req,res,thisClassId)=>{
    getClassPageInfoByClassId(thisClassId).then(async(rsp)=>{
        const classInfo = {}
        const displayStudents=[]
        const passes=[]
        const todayDate=formatInTimeZone(new Date(),'Pacific/Honolulu','yyyy-MM-dd')

        const theseStudentPIDs = [101805]  // 101805
        
        rsp.forEach((r,i)=>{
            if(!(r.pid in theseStudentPIDs)){theseStudentPIDs.push(r.pid)}
        })

        const attendanceDictionary={}
        const theseAttendances = await getTodaysAttendance(theseStudentPIDs.join(';'))        

        theseAttendances.forEach((r,i)=>{
            console.log('r.early_dismissal_time',r.early_dismissal_time)
            let thisAttendanceStatus='P'
            let thisEarlyDismissalTime=''
            let thisEarlyDismissalTimeDisplay=''

            if(absentCodes.includes(r.student_attendance_status)){thisAttendanceStatus='A'}
            else if(earlyDismissalCodes.includes(r.student_attendance_status)){thisAttendanceStatus='E'}

            if(r.early_dismissal_time){
                thisEarlyDismissalTime=r.early_dismissal_time
                thisEarlyDismissalTimeDisplay=formatInTimeZone(r.early_dismissal_time,"UTC","hh:mm a") // format(new Date(r.early_dismissal_time),"hh:mm a") // formatInTimeZone(r.early_dismissal_time,"Pacific/Honolulu","hh:mm a")
            }
            attendanceDictionary[r.person_id]={status:thisAttendanceStatus,earlyDismissal:thisEarlyDismissalTime,earlyDismissalDisplay:thisEarlyDismissalTimeDisplay}
        })
        
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
                ,ce_status:r.ce_status,out_time:r.out_time,out_time_display:(r.out_time?formatInTimeZone(r.out_time,"Pacific/Honolulu",'hh:mm:ss a'):""),in_time:r.in_time,outreason:r.outreason,position:{x:0,y:0}
                ,passes:[]
                ,attendance:(r.pid in attendanceDictionary?attendanceDictionary[r.pid]:{status:"P",earlyDismissal:null,earlyDismissalDisplay:""})}  // r.pid

                // classInfo.students[r.sid].position.x =(r.sid==='329660'? 60 :r.positionx)
                // classInfo.students[r.sid].position.y = (r.sid==='329660'? 260 :r.positiony)

                classInfo.students[r.sid].position.x =r.positionx
                classInfo.students[r.sid].position.y = r.positiony
                
                // classInfo.students.push(studentInfo[r.sid])
            }

            if(r.pt_bywho){
                console.log('r.at_time',r.at_time)
                console.log('r.at_date',r.at_date)

                const atDateDiplay = formatInTimeZone(r.at_date,'Pacific/Honolulu','yyyy-MM-dd')
                const whenDisplay = (r.duration==='A'?'All Period':` from ${format(parse(r.at_time,'HH:mm:ss',new Date()),"hh:mm a")}`)
                const thisPass={pt_id: r.pt_id ,nameDisplay: `${r.pname} ${r.lname}`, whenDisplay,duration:r.duration,at_date:r.at_date,at_time:r.at_time,on_period:r.on_period,report_to:r.report_to
                    ,reason:r.reason,requestor:r.requestor,pt_status:r.pt_status,out_dt:r.out_dt,in_dt:r.in_dt,reciever:r.reciever
                    ,sid:r.sid,need_review:r.need_review,pt_bywho:r.pt_bywho
                }

                if(todayDate===atDateDiplay){
                classInfo.students[r.sid].passes.push(thisPass)
                passes.push(thisPass)
                }
            }
        })

        // res.json({rsp,classInfo})

        res.render('fac',{title:classInfo.classid,subtitle:'SUBTITLE',classInfo,passes})
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

                        console.log('thisInsertId',thisInsertId)
                        getPassTicketViewInfoById(thisInsertId).then((vThisPass)=>{
                            console.log('vThisPass',vThisPass)

                            if(vThisPass.length===1){
                                const thisMessage= newPassEmailTemplate(thisInsertId,passData.reportTo,passData.onDate,passData.atPeriod
                                    ,passData.duration,req.user.email)
                                console.log('thisMessage',thisMessage)

                                const thisInfo = vThisPass[0]
                                const atTimeDisplay = (thisInfo.at_time?format(parse(thisInfo.at_time,'HH:mm:ss',new Date()),"hh:mm a"):'')
                                const whenDisplay = (thisInfo.duration==='A'?'All Period':` from ${atTimeDisplay}`)
                                const atDateDisplay = formatInTimeZone(thisInfo.at_date,'Pacific/Honolulu','MM/dd/yyyy')
                                

                                thisInfo.whenDisplay=whenDisplay
                                thisInfo.atDateDisplay=atDateDisplay
                                thisInfo.atTimeDisplay=atTimeDisplay
                                
                                alertRoomAboutPassAll('new',thisInfo)

                                const thisEmailObj = {to:req.user.email,from:req.user.email,subject:`Study Hall Pass #${thisInsertId}`,html:thisMessage}
                                sendEmail(thisEmailObj)
                                // sendEmail({to:'syamashiro@iolani.org',subject:'Test 2',text:'Hello 2'}) 
                                res.json({rsp,passData,toInsert,insertRsp})
                            }
                            else{
                                res.json({status:'Not Ok',message:'Incorrect Length dkafj339'})                                
                            }
                        })
                        .catch((err)=>{
                            res.json({status:'Not Ok',message:'dskfja39kf00efa0e',err})
                        })
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

            console.log('thisDataSet',thisDataSet)

                thisDataSet.reportedAtTimeDisplay = format(thisDataSet.in_dt,"hh:mm")
                thisDataSet.departedAtTimeDisplay = format(thisDataSet.out_dt,"hh:mm")
                thisDataSet.receiverDisplay = (thisDataSet.receiver?thisDataSet.receiver.replace('@iolani.org',''):'')
                thisDataSet.receiverSignedDisplay=format(thisDataSet.receiver_signed,"MM/dd/yyyy hh:mm:ss a")
                res.render('passTicketCompletedViewOnly',{status:'Ok',title:'',subtitle:`(${thisDataSet.pt_status==='New'?'Open':'Closed'})`,userName:req.user.email,data:thisDataSet})
    

            

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
                    console.log('returnRsp',returnRsp)
                    const receiver_signed_display = format(returnRsp[0].receiver_signed,"MM/dd/yyyy hh:mm:ss a")
                    returnRsp[0].pt_id=returnRsp[0].id
                    alertRoomAboutPassAll('cmp',returnRsp[0])
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
                        console.log('passData',passData)

                        getPassTicketViewInfoById(passData.passId).then((vThisPass)=>{
                            console.log('vThisPass',vThisPass)
                            if(vThisPass.length===1){
                                const thisInfo = vThisPass[0]
                                const whenDisplay = (thisInfo.duration==='A'?'All Period':` from ${format(parse(thisInfo.at_time,'HH:mm:ss',new Date()),"hh:mm a")}`)
                                const atDateDisplay = formatInTimeZone(thisInfo.at_date,'Pacific/Honolulu','MM/dd/yyyy')
                                let atTimeDisplay = ''

                                if(thisInfo.at_time){
                                    const parsedTime = parse(thisInfo.at_time,'HH:mm:ss',new Date())
                                    atTimeDisplay = format(parsedTime,'hh:mm a')
                                }  
                                
                                thisInfo.id=thisInfo.pt_id
                                thisInfo.whenDisplay=whenDisplay
                                thisInfo.atDateDisplay=atDateDisplay
                                thisInfo.atTimeDisplay=atTimeDisplay
                                
                                console.log('Will Alert ',thisInfo)
                                alertRoomAboutPassAll('update',thisInfo)

                                const thisEmailObj = {to:req.user.email,from:req.user.email,subject:`Study Hall Pass #${passData.passId} Updated`,html:thisMessage}
                                sendEmail(thisEmailObj)                       


                                const returnDisplay={bywho:uidNooksRsp.update[0][0].bywho,updatedatetime:uidNooksRsp.update[0][0].updatedatetime,updatedatetimeDisplay:format(uidNooksRsp.update[0][0].updatedatetime,'MM/dd/yyyy HH:mm:ss a')}
                                res.json({passData,thisCurrentTickePass,compareAObj,comparedResult,uidNooksRsp,returnDisplay})
                            }
                            else{
                                res.json({status:'Not Ok',message:'Length incorrect aeoolgjroijagrje'})    
                            }
                        })
                        .catch((err)=>{
                            console.log('err',err)
                            res.json({status:'Not Ok',message:'dedsdfaejleiikjoiejjfei'})                            
                        })
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
            getPassTicketById(deletePassObj.thisPassId).then((thisDeletedPass)=>{
                if(thisDeletedPass.length===1){
                    alertRoomAboutPassAll('delete',thisDeletedPass[0])
                    res.json({status:'Ok',message:rsp[0].id})
                }
                else{
                    res.json({status:'Not Ok',message:`dfa Incorrect Length eikkadf dafeaooppf r`})
                }
            })
            .catch((err)=>{
                res.json({status:'Not Ok',message:`dfaeikkadf dafeaooppf r`})
            })
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
        r.allowDelete=(r.requestor===currentUserEmail && r.pt_status ==='New')

        return r
    })

    return displayPassList
}

export const getOpenPasses=(req,res,subtitle,isOnlyToday,isOnlyMyPasses,whereObjArray)=>{
    getOpenPassTickets(isOnlyToday,whereObjArray).orderBy('at_date','period').then((thesePasses)=>{
        res.render('passTicketList',{title:'Passes',subtitle:subtitle,isOnlyToday,isOnlyMyPasses,displayPasses:passListDisplayFormat(req.user.email,thesePasses)})
    })
    .catch((err)=>{
        res.json(err)
    })
}

export const editSeatChange=(req,res,seatChangeInfo)=>{
    updateSeatChange(seatChangeInfo).then((rsp)=>{
        console.log('rsp',rsp)
        if(rsp.length===1){
            res.json({status:'Ok',message:rsp[0]})
            return
        }
        
        res.json({status:'Not Ok',message:'Incorrect Length'})
    })
    .catch((err)=>{
        res.json(err)
    })
}

export const editEnrollmentStatus=(req,res,enrollmentStatusInfo)=>{
    updateEnrollmentStatus(enrollmentStatusInfo).then((rsp)=>{
        console.log('rsp',rsp)
        if(rsp.length===1){
            const thisOutTimeDisplay = (rsp[0].out_time?formatInTimeZone(rsp[0].out_time,"Pacific/Honolulu","hh:mm:ss a"):"")
            res.json({status:'Ok',message:rsp[0].id,scanid:rsp[0].sid,outStatus:rsp[0].status,outreason:rsp[0].outreason,outTime:thisOutTimeDisplay})
            return
        }
        
        res.json({status:'Not Ok',message:'Incorrect Length'})
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