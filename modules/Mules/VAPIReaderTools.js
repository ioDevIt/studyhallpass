export const veraEnrollmentMap=(r)=>{
    return {clint:r.internal_class_id
        ,description:r.class_description
        ,facid: r.primary_teacher.id
        ,facprefix: r.primary_teacher.id
        ,facfname: r.primary_teacher.first_name
        ,facmname: r.primary_teacher.middle_name
        ,faclname: r.primary_teacher.last_name
        ,facsuffix: r.primary_teacher.name_suffix

        ,pid: r.person_id
        ,personName: r.person_name
        ,gradeid: r.grade_level_id
        ,currentlyEnrolled: r.currently_enrolled
        ,withdrawnDate:r.date_withdrawn
    }
}

const veraEnrollmentFilterBy__ =(r)=>{}