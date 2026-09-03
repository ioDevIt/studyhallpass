import {getClassPermissionsByPersonIdSchoolYear} from './Mules/VAPIReader.js'
import {getCurrentSchoolYearForVera} from './Mules/helpersModule.js'
import {getClassesByClint} from '../models/studyHallModel.js'


export const setMenu = async (req,res)=>{
    const thisUserId =  128829  // req.user.id
    const thisSchoolYr = getCurrentSchoolYearForVera()
    const permissionForTheseClasses = await getClassPermissionsByPersonIdSchoolYear(thisUserId,thisSchoolYr)
    const shClassesByViewAttendance = permissionForTheseClasses.filter((r)=>(r.view_attendance && (r.class.description.substring(0,2)==='SH')))
    const shClassesClint = shClassesByViewAttendance.map((r)=>r.class.id)
    const theseClassesDB = await getClassesByClint(shClassesClint)
    const menuItems = theseClassesDB.map((r)=>{
        return{
            name:r.classid,
            description:r.name,
            url:`/fac/${r.classid}`

    }})

    // res.json({permissionForTheseClasses,shClassesByViewAttendance,theseClassesDB})
    // return

    res.render('menu',{title:'',subtitle:'',menus:menuItems})    
}