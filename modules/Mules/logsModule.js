import {addLog,getLogs,getLogsConfirmedNoChange} from '../../models/logsModel.js'
import chalk from 'chalk'

export const insertLog=(action,value,bywho,traceInfo)=>{
        if(traceInfo!==undefined){
            traceObj(traceInfo)
        }
        // console.log(chalk.blueBright.bgMagenta('insertLog',JSON.stringify(action),value,bywho))
        console.log(`************************************** TEST insertLog ${action} *****************************************`)
        console.log(action,value,bywho)
        return addLog(action,value,bywho)
    }

export const insertLogAsync=(action,value,bywho,successFn,ErrorFn,traceInfo)=>{
        if(traceInfo!==undefined){
            traceObj(traceInfo)
        }
    // console.log(chalk.blueBright('insertLog',action,value,bywho))
        console.log(`************************************** TEST insertLogAsync ${action} *****************************************`)
        addLog(action,value,bywho).then((thisRsp)=>{
            if(successFn !== undefined){successFn(thisRsp) }            
        })
        .catch((thisError)=>{
            console.log('This Error',thisError)
            if(ErrorFn!==undefined){ErrorFn(thisError)}
        })
    }

export const displayLogs = async (fromDate,toDate)=>{
        return getLogs(fromDate,toDate)
    }

export const getConfirmedNoChange = (fromDate,toDate)=>{
    return getLogsConfirmedNoChange(fromDate,toDate)
}

/************ Outputs to screen but no logs ************/
export const trace =(group,messageArray,attrs=[]) =>{
    if(false ){ // isolate groups or skip group
        return;
    }

    if(attrs.length==0 ){  //  && color===undefined && bgColor===undefined
        console.log(...messageArray)
    }
    else{
        let thisChalk = chalk

        attrs.forEach((r)=>{
            thisChalk = thisChalk[r]
        })

        // if(color!==undefined){thisChalk=thisChalk[color]}
        // if(bgColor!==undefined){thisChalk=thisChalk[bgColor]}

        console.log(thisChalk(...messageArray))
    }  
}

export const traceObj =(traceInfo) =>{
    if('group' in traceInfo){
            if(false ){ // isolate groups or skip group
        return;
        }
    }

    if(traceInfo.attrs.length==0){  // if(traceInfo.color===undefined && traceInfo.bgColor===undefined){
        console.log(...traceInfo.messageArray)
    }
    else{
        let thisChalk= chalk

        traceInfo.attrs.forEach((r)=>{
            console.log('r',r)
            thisChalk=thisChalk[r]
        })

        console.log(thisChalk(...traceInfo.messageArray))
    }  
}

export default {insertLog,insertLogAsync,displayLogs,getConfirmedNoChange,trace,traceObj}