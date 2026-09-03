import { colorNames } from 'chalk'
import {rgb} from 'pdf-lib'
const pToInch = 72

export const inInch=(thisPoint)=>(thisPoint*pToInch)
export const atYFn=(thisPage, thisY)=>{
    return (thisPage.getHeight()-thisY)
}

export const createCenteredXTitle=(thisDoc, thisPage, thisEmbeddedFont, thisFontSize,atY, thisText,thisFontColor)=> {
  // 2. Embed a standard font
//   const font = await thisDoc.embedFont(thisFont);  // StandardFonts.Helvetica
//   const fontSize = 24;

  // 3. Prepare title text and find text width
  const titleText = thisText; // 'My Awesome Title';
  const textWidth = thisEmbeddedFont.widthOfTextAtSize(titleText, thisFontSize);

  // 4. Calculate the center X coordinate
  const pageWidth = thisPage.getWidth();
  const centerX = (pageWidth - textWidth) / 2;

  // 5. Draw the centered title on the page
  thisPage.drawText(titleText, {
    x: centerX,
    y: atYFn(thisPage,atY), // 700,
    size: thisFontSize,
    font: thisEmbeddedFont,
    color: (thisFontColor?thisFontColor: rgb(0, 0, 0)),
  });
}

const drawLine=(thisPage,start,end,options={})=>{ // start/end:{x:nn,y:nn}
        // console.log('line Option',options)
        const defaultOptions={thickness: 2,  color: rgb(0.75, 0.2, 0.2),  opacity: 0.75,}
        const optionParams={start:start,end:end}
        for(const thisOpt in defaultOptions){optionParams[thisOpt]=((thisOpt in options)?options[thisOpt]:defaultOptions[thisOpt])}

        // console.log('optionParams',optionParams)
        thisPage.drawLine(optionParams)
    }

export const horzitonalLine=(page,thisLineObj={x1:undefined,y1:undefined,xlength:undefined,color:undefined,size:undefined})=>{
  const thisX =  (thisLineObj.x1?thisLineObj.x1:0)

  const lineObj=
    {x1:thisX
        ,y1:(thisLineObj.y1?thisLineObj.y1:0)
        ,xlength:(thisLineObj.xlength?thisLineObj.xlength:(page.getWidth()-thisX))
        ,color:(thisLineObj.color?thisLineObj.color:rgb(0, 0, 0))
        ,thickness:(thisLineObj.thickness?thisLineObj.thickness:5)
        ,opacity:(thisLineObj.opacity?thisLineObj.opacity:1)
    }
  page.drawLine({start:{x:lineObj.x1,y:lineObj.y1},end:{x:(lineObj.x1+lineObj.xlength),y:lineObj.y1},thickness:lineObj.thickness,opacity:lineObj.opacity,color:lineObj.color})
}

export const writeTextLeftJustified = (thisPage,theseTextObj)=>{
    /****** Sample Input **********
    theseTextObj={
            x:0,y:10,justifiedType:'L',
            textObjs:[text,size,font,color]    
    }
    ******************************/

    let currentX =theseTextObj.x
    let totalTextWidth=0
    let currentFontSize=12

    // console.log('theseTextObj.textObjs',theseTextObj.textObjs)
    theseTextObj.textObjs.forEach((thisTextObj)=>{
        const prefixWidth = thisTextObj.font.widthOfTextAtSize(thisTextObj.text, thisTextObj.size);
        totalTextWidth+=prefixWidth

        const thisObjSet ={
            x: currentX,
            y:atYFn(thisPage,theseTextObj.y),
            // size:(thisTextObj.size?thisTextObj.size:15),
            font:thisTextObj.font
        }

        currentX+=prefixWidth

    if(thisTextObj.size){thisObjSet.size=thisTextObj.size}
    // if(thisTextObj.font){thisObjSet.font=thisTextObj.font} // may need to reset font size.  Not sure if default is 12 or the last used on the page
    if(thisTextObj.color){thisObjSet.color=thisTextObj.color}

        // console.log(`Draw ${thisTextObj.text}`)
    thisPage.drawText(thisTextObj.text,thisObjSet)
    })
}


export const writeTextRightJustified = (thisPage,theseTextObj)=>{
    let currentX =theseTextObj.x
    let totalTextWidth=0
    let currentFontSize=12

    theseTextObj.textObjs.forEach((thisTextObj)=>{
        const prefixWidth = thisTextObj.font.widthOfTextAtSize(thisTextObj.text, thisTextObj.size);
        totalTextWidth+=prefixWidth
    })

    currentX-=totalTextWidth

    // console.log('theseTextObj.textObjs',theseTextObj.textObjs)
    theseTextObj.textObjs.forEach((thisTextObj)=>{
        const prefixWidth = thisTextObj.font.widthOfTextAtSize(thisTextObj.text, thisTextObj.size);
        totalTextWidth+=prefixWidth

        const thisObjSet ={
            x: currentX,
            y:atYFn(thisPage,theseTextObj.y),
            // size:(thisTextObj.size?thisTextObj.size:15),
            font:thisTextObj.font
        }

        currentX+=prefixWidth

    if(thisTextObj.size){thisObjSet.size=thisTextObj.size}
    // if(thisTextObj.font){thisObjSet.font=thisTextObj.font} // may need to reset font size.  Not sure if default is 12 or the last used on the page
    if(thisTextObj.color){thisObjSet.color=thisTextObj.color}

        // console.log(`Draw ${thisTextObj.text}`)
    thisPage.drawText(thisTextObj.text,thisObjSet)
    })
}


export const writeTextCenteredJustified = (thisPage,theseTextObj)=>{
    let currentX =0
    let totalTextWidth=0
    let currentFontSize=12

    theseTextObj.textObjs.forEach((thisTextObj)=>{
        const prefixWidth = thisTextObj.font.widthOfTextAtSize(thisTextObj.text, thisTextObj.size);
        totalTextWidth+=prefixWidth
    })

//       const pageWidth = thisPage.getWidth();
//   const centerX = (pageWidth - textWidth) / 2;

    currentX=(thisPage.getWidth() - totalTextWidth) / 2



    // console.log('theseTextObj.textObjs',theseTextObj.textObjs)
    theseTextObj.textObjs.forEach((thisTextObj)=>{
        const prefixWidth = thisTextObj.font.widthOfTextAtSize(thisTextObj.text, thisTextObj.size);
        totalTextWidth+=prefixWidth

        const thisObjSet ={
            x: currentX,
            y:atYFn(thisPage,theseTextObj.y),
            // size:(thisTextObj.size?thisTextObj.size:15),
            font:thisTextObj.font
        }

        currentX+=prefixWidth

    if(thisTextObj.size){thisObjSet.size=thisTextObj.size}
    // if(thisTextObj.font){thisObjSet.font=thisTextObj.font} // may need to reset font size.  Not sure if default is 12 or the last used on the page
    if(thisTextObj.color){thisObjSet.color=thisTextObj.color}

        // console.log(`Draw ${thisTextObj.text}`)
    thisPage.drawText(thisTextObj.text,thisObjSet)
    })
}

export const writeText=(thisPage,theseTextObjs)=>{

}