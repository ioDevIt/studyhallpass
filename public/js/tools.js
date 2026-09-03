        import {formatInTimeZone} from "date-fns-tz"

        const defaultTZ = "Pacific/Honolulu"

        const tzKeys ={
            "HST":"Pacific/Honolulu"
            ,"EST":"America/New_York"
        }

        // https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
        // https://www.npmjs.com/package/countries-and-timezones
        
        const newEl=(elInfo)=>{       
            const svgEls = ["svg","use"]   

            const thisNewEl=(svgEls.includes(elInfo.type)?document.createElementNS('http://www.w3.org/2000/svg',elInfo.type):document.createElement(elInfo.type))
            if('classList' in elInfo){thisNewEl.classList.add(...(elInfo.classList.split(' ')))}
            if('text' in elInfo){thisNewEl.textContent=elInfo.text}
            if('id' in elInfo){thisNewEl.id=elInfo.id}
            if('height' in elInfo){thisNewEl.setAttribute('height',elInfo.height)}
            if('width' in elInfo){thisNewEl.setAttribute('width',elInfo.width)}            
            if('onclick' in elInfo){thisNewEl.setAttribute('onclick',elInfo.onclick)}     
            if('href' in elInfo){thisNewEl.setAttribute('href',elInfo.href)}  

            return thisNewEl
        }

        export const sortBy=(data,SortFn)=>{
            data.sort((a,b)=>{
                if(SortFn(a)>SortFn(b)){return 1}
                if(SortFn(a)<SortFn(b)){return -1}
                return 0
            })
        }

        export const atDateTZ=(forDate=(new Date()),tz ='HST')=>{
            const year=forDate.getTimezoneOffset()
            const formatString = 'yyyy-MM-dd HH:mm:ss zzz'

            const newDT = formatInTimeZone(forDate,tzKeys[tz],formatString)
            // const dtHST = formatInTimeZone(forDate,'Pacific/Honolulu',formatString)
            // const dtNY = formatInTimeZone(forDate,'America/New_York',formatString)

            // console.log(`newDT ${newDT}`)
            // console.log(`HST ${dtHST}`)
            // console.log(`New York ${dtNY}`)

            // return `HST ${dtHST} New York ${dtNY}`
            return newDT
        }

        export const atDateFileSuffix =( forDate=(new Date()),tz =defaultTZ) =>{
            return formatInTimeZone(forDate,'Pacific/Honolulu','yyyyMMddHHmmss')
        }

        export const regExBetweenBrackets = /\[([^\]]*)\]/g;
        export const regExBetweenParens =/\(([^)]*)\)/
        export const regExPDigitBetweenParens =/\(P[0-9]\)/