// const fileDownLoad = require("../modules/fileDownloadMod")();
// const validate = require("./validationsModel")();

module.exports = (knexPG) => {
    // Validation is an array of functions to validate returning bool to continue to next validation etc.
  
    const selectClassList=()=>{return knexPG("class_list").select("id","class_int","class_id","fac_int","fac_lname","fac_fname","description","course_id","room").where({is_active:true})}
    const insertClassList=(theseInsertObjs)=>{return knexPG("class_list").insert(theseInsertObjs)}
    const updateClassList=(thisUpdateObj, thisWhereObj)=>{return knexPG("class_list").update(thisUpdateObj).where(thisWhereObj).where({is_active:true})}
    const deleteClassList=(thisWhereFields,thisWhereObj)=>{return knexPG("class_list").update({is_active:false}).whereIn(thisWhereFields,thisWhereObj).where({is_active:true})}


    const selectClassEnrollments=()=>{return knexPG("class_enrollments").select("id","class_int","class_id","stu_int").where({is_active:true})}
    const insertClassEnrollments=(theseInsertObjs)=>{return knexPG("class_enrollments").insert(theseInsertObjs)}
    const updateClassEnrollments=(thisUpdateObj, thisWhereObj)=>{return knexPG("class_enrollments").update(thisUpdateObj).where(thisWhereObj).where({is_active:true})}
    const deleteClassEnrollments=(thisWhereFields,thisWhereObj)=>{return knexPG("class_enrollments").update({is_active:false}).whereIn(thisWhereFields,thisWhereObj).where({is_active:true})}

    const selectDBSQL=(tableName,fieldList,whereObj)=>{return knexPG(tableName).select(fieldList).where({is_active:true}).where(whereObj)}
    const insertDBSQL=(tableName, theseInsertObjs)=>{return knexPG(tableName).insert(theseInsertObjs)}
    const updateDBSQL=(tableName,thisUpdateObj, thisWhereObj)=>{return knexPG(tableName).update(thisUpdateObj).where(thisWhereObj).where({is_active:true})}
    const deleteDBSQL=(tableName,theseIds)=>{console.log('deleteDB',tableName,theseIds);return knexPG(tableName).update({is_active:false}).whereIn('id',theseIds).where({is_active:true})}

    const deleteByTableId=(tableName,theseIds)=>{return knexPG(tableName).returning('id').update({is_active:false}).whereIn('id',theseIds).where({is_active:true})}

    const updateClassListSimilar =(data)=>{
       return  knexPG.raw(`UPDATE class_list AS cl 
            SET fac_int = ud.fac_int
                ,fac_lname = ud.fac_lname
                ,fac_fname =ud.fac_fname
                ,description =ud.description
                ,course_id=ud.course_id
                ,room=ud.room
  FROM (VALUES ${data.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ')})
    AS ud (class_id, fac_int, fac_lname,fac_fname,description,course_id,room)
  WHERE cl.class_id = ud.class_id
  `,
  data.flatMap((r) => { console.log(typeof r.fac_int); return [r.class_id, (r.fac_int*1), r.fac_lname, r.fac_fname, r.description, r.course_id, r.room]})
);
    }


    const updateClassListSimilarNook = (data) =>{
        return knexPG.transaction(async (trx) => {
            for(row of data)
            await trx('class_list').where({ class_id: row.class_id }).update({ room:row.room});
            // await trx('users').where({ id: 2 }).update({ name: 'B' });
            });
    }

    const uidClassListSimilarNook = (uidData) =>{

        console.log('uidData',uidData)

        return knexPG.transaction(async (trx) => {
            const returningIds={
                update:(uidData.update)?[]:undefined
                ,insert:(uidData.insert)?[]:undefined
                ,delete:(uidData.delete)?[]:undefined
            }
        
            if(uidData.update){
                for(row of uidData.update){
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
                for(row of uidData.insert){
                    returningIds.insert.push(await trx(uidData.table).insert(row).returning('id'))
                }
            }

            return returningIds
        });
    }
 
    return {
        selectClassList
        ,insertClassList
        ,updateClassList
        ,deleteClassList

        ,selectClassEnrollments
        ,insertClassEnrollments
        ,updateClassEnrollments
        ,deleteClassEnrollments

        ,selectDBSQL
        ,insertDBSQL
        ,updateDBSQL
        ,deleteDBSQL

        ,deleteByTableId

        ,updateClassListSimilar
        ,updateClassListSimilarNook
        ,uidClassListSimilarNook
    };
  };

  // 40
  