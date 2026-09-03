const MONTHS_SCHOOL_YR_MINUS_1_ARRAY = [1,2,3,4,5,6]

export const getCurrentSchoolYearForVera = ()=>{
    const thisDT = new Date()
    const thisSchoolYear = (MONTHS_SCHOOL_YR_MINUS_1_ARRAY.includes(thisDT.getMonth()+1)?thisDT.getFullYear()-1:thisDT.getFullYear())
    return thisSchoolYear
}

export const getCurrentSchoolYearIO = ()=>{
    const thisDT = new Date()
    const thisSchoolYear = (MONTHS_SCHOOL_YR_MINUS_1_ARRAY.includes(thisDT.getMonth()+1)?thisDT.getFullYear():thisDT.getFullYear()+1)
    return thisSchoolYear
}