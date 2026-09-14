import {getClassPermissionsByPersonIdSchoolYear} from './Mules/VAPIReader.js'
import {getCurrentSchoolYearForVera} from './Mules/helpersModule.js'
import {getClassesByClint} from '../models/studyHallModel.js'

const getTermVal = (thisTerm)=>{
    switch(thisTerm){
        case 'Q1': return 1;
        case 'Q2': return 3;
        case 'Q3': return 4;
        case 'Q4': return 6;
        case 'S1': return 2;
        case 'S2': return 5;

        default:
            return 9;
    }
}

export const setMenu = async (req,res)=>{
    const thisUserId =  122737 // 105111  // 128829  // req.user.id
    const thisSchoolYr = getCurrentSchoolYearForVera()
    const permissionForTheseClasses = await getClassPermissionsByPersonIdSchoolYear(thisUserId,thisSchoolYr)
    const shClassesByViewAttendance = permissionForTheseClasses.filter((r)=>(r.view_attendance && (r.class.description.substring(0,2)==='SH')))
    const shClassesClint = shClassesByViewAttendance.map((r)=>r.class.id)
    const theseClassesDB = await getClassesByClint(shClassesClint)
    const menuItems = theseClassesDB.map((r)=>{
        return{
            name:r.classid,
            description:r.name,
            url:`/fac/${r.classid}`,
            term:r.term
    }})

    const menuItemsSorted = menuItems.sort((a,b)=>{
        let aTerm = getTermVal(a.term)
        let bTerm = getTermVal(b.term)

        if(aTerm>bTerm){return 1}
        if(aTerm<bTerm){return -1}
        return 0
    })

    // res.json({permissionForTheseClasses,shClassesByViewAttendance,theseClassesDB})
    // return

    /**** Set req.user.gates.clints  to shClassesClint *****/

    if(!('gates' in req.user)){ req.user.gates={}}
    if(!('clint' in req.user.gates)){ req.user.gates.clint=[]}

    req.user.gates.clint=shClassesClint

    res.render('menu',{title:'',subtitle:'',menus:menuItems})    
}