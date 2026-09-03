import dotenvMod from "../dotenvModule.js"
import knex from 'knex'

const knexPgSetup = dotenvMod().knex
const knexPG = knex(knexPgSetup)

export  const compareLists=(ASet,BSet,matchKeyFN,compareFields)=>{
    /********** Aset no id field, BSet has id field *********/
        const aObj ={}
        const bObj ={}
        const aOnly=[]
        const bOnly=[]
        const both={setA:{},setB:{}}
        const bothKeys =[]
        const updates=[]

        ASet.forEach((r)=>{aObj[matchKeyFN(r)]=r})
        BSet.forEach((r)=>{bObj[matchKeyFN(r)]=r}) // setting to array so all matches in database are marked as is_active = false

        const aKeys = Object.keys(aObj)
        const bKeys =Object.keys(bObj)
        const aSetLen = aKeys.length
        const bSetLen = bKeys.length

        for(let i=0;i<aSetLen;i++){
            const thisAKey = aKeys[i]
            
            console.log('thisAKey',thisAKey)

            if(thisAKey in bObj){
                if(!(bothKeys.includes(thisAKey))){
                    // both.push(bObj[thisAKey])
                    both.setA[thisAKey]=aObj[thisAKey]
                    both.setB[thisAKey]=bObj[thisAKey]
                    
                    bothKeys.push(thisAKey)
                }
            }
            else{
                aOnly.push(aObj[thisAKey])
            }
        }

        for(let i=0;i<bSetLen;i++){
            const thisBKey = bKeys[i]
            
            console.log('thisBKey',thisBKey)

            if(!(thisBKey in aObj)){
                console.log('thisBKey',thisBKey)
                // bObj[thisBKey].forEach((thisBObj)=>{
                //     bOnly.push(thisBObj)
                // })

                bOnly.push(bObj[thisBKey])
            }
        }     

        console.log('bothKeys',bothKeys)

        /************** Determine Updates ***********/
        const toUpdateAll=[]
        const reason=[]

        bothKeys.forEach((compareKey)=>{
            const toUpdate={}

            compareFields.forEach((thisCompareField)=>{
                if(both.setA[compareKey][thisCompareField]!==both.setB[compareKey][thisCompareField]){
                    toUpdate[thisCompareField]=both.setA[compareKey][thisCompareField]
                    reason.push({compareKey:compareKey,field:thisCompareField,A:both.setA[compareKey][thisCompareField],B:both.setB[compareKey][thisCompareField],display:`${both.setA[compareKey][thisCompareField]} => ${both.setB[compareKey][thisCompareField]}`})
                }
            })

            if(Object.keys(toUpdate).length>0){
                toUpdate['id']=both.setB[compareKey]['id']
                toUpdateAll.push(toUpdate)
            }
        })

        return {aObj,bObj,both,aOnly,bOnly,toUpdateAll,reason}
    }


export const createUIDNooks = (thisData,tableName,insertFn, deleteFn, updateFn)=>{
    const uidObject={table:tableName}

    if('aOnly' in thisData && thisData.aOnly.length!==0){
        uidObject.insert=thisData.aOnly.map(insertFn)
    }

    if('bOnly' in thisData && thisData.bOnly.length!==0){
        uidObject.delete=thisData.bOnly.map(deleteFn)
    }

    if('toUpdateAll' in thisData && thisData.toUpdateAll.length!==0){
        uidObject.update=thisData.toUpdateAll.map(updateFn)
    }
    
    return uidObject
}


export const uidNooks = async (uidData) =>{
    /*********************** Example Data **********************
     * 
     * {table:"class_enrollments",update:lunchClassEnrollmentListCompared.toUpdateAll
            ,insert:(lunchClassEnrollmentListCompared.aOnly.length===0?undefined:lunchClassEnrollmentListCompared.aOnly.map(r=>r))
            ,delete:(lunchClassEnrollmentListCompared.bOnly.length===0?undefined:lunchClassEnrollmentListCompared.bOnly.map(r=>r.id))}     * 
     * 
    *************************************************************/

        console.log('uidData',uidData)

        return knexPG.transaction(async (trx) => {
            const returningIds={
                update:(uidData.update)?[]:undefined
                ,insert:(uidData.insert)?[]:undefined
                ,delete:(uidData.delete)?[]:undefined
            }
        
            if(uidData.update){
                for(const row of uidData.update){
                    const {id,...updateData} = {...row}
                    console.log(row)
                    console.log(id, updateData)
                    returningIds.update.push(await trx(uidData.table).where({id:id}).update(updateData).returning('id'))
                }
            }

            if(uidData.delete){
                returningIds.delete.push(await trx(uidData.table).update({is_active:false}).whereIn('id',uidData.delete).where({is_active:true}).returning('id'))
            }

            if(uidData.insert){
                for(const row of uidData.insert){
                    console.log('uidData.insert',uidData.insert)
                    console.log('row',row)
                    returningIds.insert.push(await trx(uidData.table).insert(row).returning('id'))
                }
            }

            return returningIds
        });
    }