export const sortBy=(data,SortFn)=>{
    data.sort((a,b)=>{
        if(SortFn(a)>SortFn(b)){return 1}
        if(SortFn(a)<SortFn(b)){return -1}
        return 0
    })
}