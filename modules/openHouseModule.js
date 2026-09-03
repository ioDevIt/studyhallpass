import fs from "fs"
import os from "os"
import path from "path"
import {PDFDocument,PageSizes, StandardFonts,rgb,degrees,grayscale} from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import { ro } from "date-fns/locale"

import { readFile } from "node:fs/promises";

const homeDir = os.homedir()

const projName ="openhouse"
const subProjName="openhouse"

const libreBarcode39Path=path.join(homeDir,'Projects',projName,"assets",'LibreBarcode39Text-Regular.ttf')
const notoPath=path.join(homeDir,'Projects',projName,"assets",'NotoSerif-VariableFont_wdth,wght.ttf');
const ralewayPath=path.join(homeDir,'Projects',projName,"assets",'Raleway-Bold.ttf');
const gothMedPath=path.join(homeDir,'Projects',projName,"assets",'Gotham-Medium.otf');
const montserratMedPath = path.join(homeDir,'Projects',projName,'assets','Montserrat-Medium.ttf')
const usMapPath=path.join(homeDir,'Projects',projName,"public","pdf",'USMaps.pdf');

console.log('gothMedPath',gothMedPath)

const ralewayPathText = fs.readFileSync(ralewayPath)
const fontBytesLibre39Text = fs.readFileSync(libreBarcode39Path);
const gothMedPathText = fs.readFileSync(gothMedPath)
const montserratMedPathText = fs.readFileSync(montserratMedPath)

const colorNames={
  "Black": rgb(0, 0, 0),
  "White": rgb(1, 1, 1),
  "Red": rgb(1, 0, 0),
  "Green": rgb(0, 0.502, 0),
  "Blue": rgb(0, 0, 1),
  "Yellow": rgb(1, 1, 0),
  "Cyan": rgb(0, 1, 1),
  "Magenta": rgb(1, 0, 1),
  "Orange": rgb(1, 0.647, 0),
  "Purple": rgb(0.502, 0, 0.502),
  "Pink": rgb(1, 0.753, 0.824),
  "Gray": rgb(0.502, 0.502, 0.502),
  "Brown": rgb(0.647, 0.165, 0.165),
  "Lime": rgb(0, 1, 0),
  "Teal": rgb(0, 0.502, 0.502),
  "Navy": rgb(0, 0, 0.502)
}

const pageInfo={
    width: null,
    height: null,
}

const setPageInfo=(thisPage)=>{
    pageInfo.width=thisPage.getWidth();
    pageInfo.height=thisPage.getHeight();
}

const atYFn=(thisPage, thisY)=>{
    return (thisPage.getHeight()-thisY)
}

const atYInchFn=(thisPage, thisY)=>{
    return (thisPage.getHeight()-inInch(thisY))
}

const pToInch = 72

const inInch=(thisPoint)=>(thisPoint*pToInch)


const createCenteredXTitle=(thisDoc, thisPage, thisEmbeddedFont, thisFontSize,atY, thisText)=> {
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
    color: rgb(0, 0, 0),
  });
}

const createCenteredYTitle=(thisDoc, thisPage, thisEmbeddedFont, thisFontSize,atX, thisText)=> {
  // 2. Embed a standard font
//   const font = await thisDoc.embedFont(thisFont);  // StandardFonts.Helvetica
//   const fontSize = 24;

  // 3. Prepare title text and find text width
  const titleText = thisText; // 'My Awesome Title';
//   const textWidth = thisEmbeddedFont.widthOfTextAtSize(titleText, thisFontSize);
  const textHeight = thisEmbeddedFont.heightAtSize(thisFontSize);

  // 4. Calculate the center X coordinate
  const pageWidth = thisPage.getHeight();
  const centerYText = ((thisPage.getHeight() + textHeight)/2);

  // 5. Draw the centered title on the page

  console.log('thisInfo',{
    titleText:titleText,
    x: atX,
    y: centerYText, // 700,
     size: thisFontSize,
    })

  thisPage.drawText(titleText, {
    x: atX,
    y: centerYText, // 700,
    size: thisFontSize,
    font: thisEmbeddedFont,
    color: rgb(0, 0, 0),
  });
}


const createLeftXTitle=(thisDoc, thisPage, thisEmbeddedFont, thisFontSize,atX,atY, thisText)=> {
  // 2. Embed a standard font
//   const font = await thisDoc.embedFont(thisFont);  // StandardFonts.Helvetica
//   const fontSize = 24;

  // 3. Prepare title text and find text width
  const titleText = thisText; // 'My Awesome Title';
  const textWidth = thisEmbeddedFont.widthOfTextAtSize(titleText, thisFontSize);

  // 4. Calculate the center X coordinate
  const pageWidth = thisPage.getWidth();
  // const centerX = (pageWidth - textWidth) / 2;

  // 5. Draw the centered title on the page
  thisPage.drawText(titleText, {
    x: atX,
    y: atYFn(thisPage,atY), // 700,
    size: thisFontSize,
    font: thisEmbeddedFont,
    color: rgb(0, 0, 0),
  });
}


const drawFieldText=(thisPage,x,y,thisText,options={})=>{ // thisFont,thisFontSize,
    // console.log({thisPage,thisFont,thisFontSize,x,y,thisText})
    const defaultOptions={   
        // font: timesRomanFont,
        size: 24,
        color: rgb(1, 0, 0),
        lineHeight: 24,
        opacity: 0.75,
            }

    const optionParams={x,y}
    for(const thisOpt in defaultOptions){optionParams[thisOpt]=((thisOpt in options)?options[thisOpt]:defaultOptions[thisOpt])}

    if('font' in options){optionParams['font']=options['font']}

      thisPage.drawText(thisText, optionParams)
    }

    const drawRect=(thisPage,x,y,height,width,options={})=>{
        const defaultOptions={ 
        rotate: degrees(0),
        borderWidth: 2,
        borderColor: grayscale(0.0),
        color: rgb(0.75, 0.2, 0.2),
        opacity: 0.0,
        borderOpacity: 1,
        }
        const optionParams={x,y,height,width}
        for(const thisOpt in defaultOptions){optionParams[thisOpt]=((thisOpt in options)?options[thisOpt]:defaultOptions[thisOpt])}

        console.log('optionParams',optionParams)

      thisPage.drawRectangle(optionParams)
    }

const drawLine=(thisPage,start,end,options={})=>{ // start/end:{x:nn,y:nn}
        // console.log('line Option',options)
        const defaultOptions={thickness: 2,  color: rgb(0.75, 0.2, 0.2),  opacity: 0.75,}
        const optionParams={start:start,end:end}
        for(const thisOpt in defaultOptions){optionParams[thisOpt]=((thisOpt in options)?options[thisOpt]:defaultOptions[thisOpt])}

        // console.log('optionParams',optionParams)
        thisPage.drawLine(optionParams)
    }

const wrapText=(font, text, fontSize, maxWidth) => {
  const words = text.split(/\s+/);
  const lines = [];
  let current = '';

  for (const word of words) {
    const test = current ? current + ' ' + word : word;
    const w = font.widthOfTextAtSize(test, fontSize);
    if (w <= maxWidth) {
      current = test;
    } else {
      if (current) lines.push(current);
      // word itself may be longer than maxWidth → break the word
      if (font.widthOfTextAtSize(word, fontSize) > maxWidth) {
        let part = '';
        for (const ch of word) {
          const tryPart = part + ch;
          if (font.widthOfTextAtSize(tryPart, fontSize) <= maxWidth) {
            part = tryPart;
          } else {
            if (part) lines.push(part);
            part = ch;
          }
        }
        if (part) current = part;
        else current = '';
      } else {
        current = word;
      }
    }
  }
  if (current) lines.push(current);
  return lines;
}

const createTable=(page,starts={x:0,y:0},rows,columns)=>{
  // draw cols on y
  for(let c=0;c<columns.length;c++){
      console.log('coords',{x:(starts.x+columns[c]),y:atYFn(page,(starts.y+rows[0]))},{x:(starts.x+columns[c]),y:atYFn(page,(starts.y+rows[rows.length-1]))})
      drawLine(page,{x:(starts.x+columns[c]),y:atYFn(page,(starts.y+rows[0]))},{x:(starts.x+columns[c]),y:atYFn(page,(starts.y+rows[rows.length-1]))},{thickness:1,opacity:.85,color:rgb(0.75, 0.0, 0.2)})
    }

   // draw rows on x
   for(let r=0;r<rows.length;r++) {
      drawLine(page,{x:(starts.x+columns[0]),y:atYFn(page,(starts.y+rows[r]))},{x:(starts.x+columns[columns.length-1]),y:atYFn(page,(starts.y+rows[r]))},{thickness:1,opacity:.85,color:rgb(0.75, 0.0, 0.2)})
   }   
}

const createTableByCols=(page,starts={x:0,y:0},rows,columnWidths)=>{
  // draw cols on y

  drawLine(page,{x:(starts.x),y:atYFn(page,(starts.y+rows[0]))},{x:(starts.x),y:atYFn(page,(starts.y+rows[rows.length-1]))},{thickness:1,opacity:.85,color:rgb(0.0, 0.0, 0.2)})
  let nextX=starts.x

  for(let c=0;c<columnWidths.length;c++){
      nextX+=columnWidths[c]
      drawLine(page,{x:(nextX),y:atYFn(page,(starts.y+rows[0]))},{x:(nextX),y:atYFn(page,(starts.y+rows[rows.length-1]))},{thickness:1,opacity:.85,color:rgb(0.75, 0.0, 0.2)})
    }

  //  // draw rows on x
  //  for(let r=0;r<rows.length;r++) {
  //     drawLine(page,{x:(starts.x+columns[0]),y:atYFn(page,(starts.y+rows[r]))},{x:(starts.x+columns[columns.length-1]),y:atYFn(page,(starts.y+rows[r]))},{thickness:1,opacity:.85,color:rgb(0.75, 0.0, 0.2)})
  //  }   
}

const writeText = (page,text,x,y,size,lineHeight,fontColor)=>{
      const colorName = (fontColor?fontColor:'Green')
      // console.log('fontColor',fontColor)
      // console.log('colorName',colorName)
      page.drawText(text, {
        x: x,
        y: y,
        size: size,
        lineHeight: lineHeight, // Space between lines
        color:colorNames[colorName]
      });
}

const horzitonalLine=(page,x1,y1,xlength)=>{
  drawLine(page,{x:x1,y:y1},{x:(x1+xlength),y:y1},{thickness:.3,opacity:.85,color:rgb(0.8, 0.0, 0.2)})
}

const setColumnStarts = (columnWidths,startX) =>{
  const returnArray =[]
  let currentTotal = startX
  columnWidths.forEach((r)=>{    
    returnArray.push(currentTotal)
    currentTotal=currentTotal+r
  })

  return returnArray
}

const createTableByData=(page,starts={x:0,y:0},data,columnWidths)=>{
  const textSize = 6
  const lineHeight = 16 // 20 // 22
  const lineHeightInCell = 11

  const totalColumnWidths = columnWidths.reduce((p,c)=>{
    return p+c
  })

  const theseColStarts = setColumnStarts(columnWidths,starts.x)
  

  // writeText(page,"TEST",10,atYInchFn(page,1),textSize,lineHeight)

  console.log(totalColumnWidths,'columnWidths',columnWidths)
 console.log(starts, totalColumnWidths)
  // horzitonalLine(page,starts.x,starts.y, totalColumnWidths)

  let currentY = starts.y

  for(let i=0;i<data.length;i++){
    const currentRow = data[i]
    let currentRowMaxLines =0
    // console.log('currentRow',currentRow)
    
    currentRow.forEach((rowCell, rowCellIndex)=>{
      // console.log('rowCell TEST',rowCell)
      if(rowCell.length>currentRowMaxLines){currentRowMaxLines = rowCell.length}

      if(false){
              const textToWrite = rowCell.length===0?"":rowCell.reduce((acc,o)=>{console.log('TEST');console.log('acc',acc); return (acc?acc+"\n":"") + o.textList},"")

      // console.log('rowCell.length===0',rowCell.length===0)
      // console.log('textToWrite',textToWrite)
      // console.log('rowCell.fontColor',rowCell.fontColor)
      const thisFontColor = rowCell.length===0?'Black':rowCell.fontColor
       writeText(page,textToWrite,theseColStarts[rowCellIndex],atYFn(page,currentY),textSize,lineHeightInCell,thisFontColor)  // lineHeight
      } else {
        rowCell.forEach((thisCellLineData,thisCellLineDataIndex)=>{
          if(thisCellLineData.textAlign==='center' && i!==0)
          {
            writeText(page,thisCellLineData.textList,theseColStarts[rowCellIndex]+(columnWidths[rowCellIndex]/4),atYFn(page,currentY + (thisCellLineDataIndex*10)),textSize,lineHeightInCell,thisCellLineData.fontColor)  // lineHeight
          }
          else
          {
            writeText(page,thisCellLineData.textList,theseColStarts[rowCellIndex],atYFn(page,currentY + (thisCellLineDataIndex*10)),textSize,lineHeightInCell,thisCellLineData.fontColor)  // lineHeight
          }
        })
      }

      // textArray.join('\n');

      // rowCell.forEach((thisLine,thisLineIndex)=>{
      //   console.log(`Write out ${thisLine}`)
      //   writeText(page,(thisLine + ''),theseColStarts[rowCellIndex],atYFn(page,currentY + (thisLineIndex * lineHeight)),textSize,lineHeight)
      // })      
    })

    // console.log(`For Row ${i} size = ${currentRowMaxLines}`)
    
    currentY += ((lineHeightInCell * (currentRowMaxLines-1)) + lineHeight)  // lineHeight
    horzitonalLine(page,starts.x,atYFn(page,(currentY-(lineHeight/1.75))), totalColumnWidths)

    // console.log(`Next write at ${currentY}`)
   }

   console.log('theseColStarts',theseColStarts)

   return {currentY}

  // horzitonalLine(page,starts.x,(starts.y-100), totalColumnWidths) 
}

const getRange=(start=0,end=0,step=1)=>{
  const returnArray=[]

  for(let i=start;i<=end;i++){
    returnArray.push(i*step)
  }

  return returnArray
}

const notes1="Refreshments: Please feel free to join us for refreshments during open/free periods at the Senior Benches, located on the ground floor of the Sullivan Center.  Refreshments will also be available on the fountain side of Seto Hall, where you will have an opportunity to meet members of the Upper School Counseling Team."
const notes2="Upper School Library:  Visitors are welcome to visit the Tsuzuki Group Library, located on the 2nd floor of Sullivan Center."
const notes3="Campus Store will be open until 8PM. The Campus store is located in the Arrillaga Student Center across St. Albans Chapel"
const notes4="Room Numbers:  When locating classrooms, please note that the letter preceding the room number indicates the building:"


const createPDFBytes = async (data)=>{
    const pdfDoc = await PDFDocument.create()
    const courierFont = await pdfDoc.embedFont(StandardFonts.Courier)
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)

    const [pageSizeLetterW,pageSizeLetterH] = PageSizes.Letter
    
    pdfDoc.registerFontkit(fontkit);

    // const customHawaiianFont = await pdfDoc.embedFont(ralewayPathText,{ subset: true });
    // const customFontLibre39Font = await pdfDoc.embedFont(fontBytesLibre39Text,{ subset: true });
    const customGothMedFont = await pdfDoc.embedFont(gothMedPathText,{subset:true})
    // const customMontserratMedFont = await pdfDoc.embedFont(montserratMedPathText,{subset:true})

    const mainFont = customGothMedFont

    const page = pdfDoc.addPage([pageSizeLetterH,pageSizeLetterW])

    // const barcodeTestText ="123456"

      /************** Vals Page Specific *****************/
    
      const { width, height } = page.getSize()      

      console.log('************************************')
      console.log(data.titletitle)

      
    createCenteredXTitle(pdfDoc,page,mainFont,25,40, '‘Iolani Open House')    // timesRomanFont
    createCenteredXTitle(pdfDoc,page,mainFont,20,65, '2026-2027')  // data.data.title
    createCenteredXTitle(pdfDoc,page,mainFont,12,85, `${data.data.subtitle}`)

 
    // createCenteredXTitle(pdfDoc,page,customHawaiianFont,12,55, `${data.studentInfo.lname}, ${data.studentInfo.fname} Entry Year ${data.studentInfo.entryYear}`)

    // const thisText = 'akdjf adfkjaei3 dfaeafe a faiejfi340190qigq34jtoqia4j;oaijflkawjelieijalkejeij'
    // const textLines = wrapText(timesRomanFont,thisText,15,300)
    // console.log('textLines',textLines)


    const starts={x:inInch(1),y:inInch(1.9)} // {x:45,y:atYInchFn(page,2)}
    const rowsY=getRange(inInch(0),16,inInch(.25))
    const colsX=getRange(inInch(0),5,inInch(1))

    const tableWidthForLetter = [inInch(.7),inInch(1.25),inInch(1.25),inInch(1.25),inInch(1.25),inInch(1.25)]

    const lScapeGrColW = 1.6
    const tableWidthForLandscape = [inInch(.5),inInch(1),inInch(lScapeGrColW),inInch(.5),inInch(3),inInch(.5),inInch(.5)]
    const tableAlignForLandscape = ['center','left','left','left','left','left','left']

    const tableColumnWidths = tableWidthForLandscape // [inInch(.7),inInch(1.65),inInch(1.65),inInch(1.65),inInch(1.65)]

    const totalColumnWidthInInch = tableColumnWidths.reduce((p,c)=>p+c)
    const tableStartsX = (width-totalColumnWidthInInch)/2
    
    console.log('totalColumnWidthInInch',totalColumnWidthInInch)
    console.log('tableStartsX',tableStartsX)
    console.log('starts',starts)
    // console.log(1/n)
    
    const thisTableFontSize = 6
    const thisTableDataArray = []

    console.log('data',data)

    data.tableData.forEach((thisRow)=>{
      const thisNewRow = []
      thisRow.forEach((thisCell,thisCellIndex)=>{
        const newCell=[]
        
        thisCell.forEach((thisLine)=>{
          // console.log('thisLine',thisLine)
          const thisLineArray = wrapText(timesRomanFont,(thisLine.text + ''),thisTableFontSize,tableColumnWidths[thisCellIndex])
            // console.log('thisCellIndex',thisCellIndex,'tableColumnWidths[thisCellIndex]',tableColumnWidths[thisCellIndex],'thisLine.text',thisLine.text )
            thisLineArray.forEach((thisLineArrayInLine,thisLineArrayInLineIndex)=>{
              newCell.push({textList:thisLineArrayInLine,textAlign:tableAlignForLandscape[thisCellIndex],fontColor:(thisLine.hili?"Red":"Black")})  // ((thisLine+'').includes("(D")?"Red":"Black")
            })
        })

        thisNewRow.push(newCell)
      })

      thisTableDataArray.push(thisNewRow)
    })

  

    const afterTable = createTableByData(page,{x:tableStartsX,y:starts.y},thisTableDataArray,tableColumnWidths) // data.data

    // console.log('afterTable',afterTable)
    // console.log(1/n)

    let nextLineY = afterTable.currentY + 20  // starts.y +185
    createLeftXTitle(pdfDoc,page,mainFont,11,tableStartsX+50,nextLineY, 'PLEASE NOTE THE FOLLOWING:')

    nextLineY+=12

    const notesWidth=700
    const notesFontSize=13

    const thisNote1Array = wrapText(timesRomanFont,notes1,notesFontSize,notesWidth)     // totalColumnWidthInInch
    const thisNote2Array = wrapText(timesRomanFont,notes2,notesFontSize,notesWidth)
    const thisNote3Array = wrapText(timesRomanFont,notes3,notesFontSize,notesWidth)
    const thisNote4Array = wrapText(timesRomanFont,notes4,notesFontSize,notesWidth)
    
    thisNote1Array.forEach((r)=>{
      createLeftXTitle(pdfDoc,page,mainFont,6,tableStartsX+50,nextLineY,r)
      nextLineY+=12  
    }) 

        nextLineY+=6

    thisNote2Array.forEach((r)=>{
      createLeftXTitle(pdfDoc,page,mainFont,6,tableStartsX+50,nextLineY,r)
      nextLineY+=12
    }) 

        nextLineY+=6
    thisNote3Array.forEach((r)=>{
      createLeftXTitle(pdfDoc,page,mainFont,6,tableStartsX+50,nextLineY,r)
      nextLineY+=12
    })

        nextLineY+=6
    thisNote4Array.forEach((r)=>{
      createLeftXTitle(pdfDoc,page,mainFont,6,tableStartsX+50,nextLineY,r)
      nextLineY+=12
    }) 

    // const tableWidthForRooms = [inInch(.5),inInch(1),inInch(.5)]
    // const tableAlignForRooms = ['left','left','left']

    const roomsLegend =[
                  ['C - Castle Building','ART - Art Building','G - Gym Complex']
                  ,['N - Nangaku Building','W - Weinberg Building','I - Courtyard Complex']
                  ,['R - Chapel','SCIL - Sullivan Center','ASC - Arrillaga Student Center']]

    // C - Castle Building	ART - Art Building	G - Gym Complex
    // N - Nangaku Building	W - Weinberg Building	I - Courtyard Complex
    // R - Chapel	S - Sullivan Center	ASC - Arrillaga Student Center

    const roomsLegendStartX = 200

    roomsLegend.forEach((thisRow,rowIndex)=>{
      thisRow.forEach((thisCol,colIndex)=>{
        createLeftXTitle(pdfDoc,page,mainFont,6,roomsLegendStartX+(100*colIndex),nextLineY,thisCol)
      })

      nextLineY+=12
    })

    nextLineY+=12
    createLeftXTitle(pdfDoc,page,mainFont,11,tableStartsX+50,nextLineY, 'Parking Reminders:')
    nextLineY+=12
    
    const thisParking1Array = wrapText(timesRomanFont,"Parking is available in our parking structure on Kamoku Street or along La‘au Street along the Lower School autoline drop off.  ",notesFontSize,notesWidth)     // totalColumnWidthInInch
    const thisParking2Array = wrapText(timesRomanFont,"Beginning at 5:30 p.m., additional parking will be available on our baseball field and the Ala Wai Elementary School parking lot.",notesFontSize,notesWidth)

    thisParking1Array.forEach((r)=>{
      createLeftXTitle(pdfDoc,page,mainFont,6,tableStartsX+50,nextLineY,r)
      nextLineY+=12
    }) 

    thisParking2Array.forEach((r)=>{
      createLeftXTitle(pdfDoc,page,mainFont,6,tableStartsX+50,nextLineY,r)
      nextLineY+=12
    }) 


     /********* Add Map **********/
    console.log('process.cwd()', process.cwd())
    // const mapPDFDocBytes = await fetch('./public/pdf/USMaps.pdf' ).then(res => res.arrayBuffer());   // '../public/pdf/USMaps.pdf'  usMapPath
    // const mapPDFDoc = await PDFDocument.load(mapPDFDocBytes);

    const mapPDFDocBytes = await readFile("./public/pdf/USMaps.pdf")
    const mapPDFDoc =  await PDFDocument.load(mapPDFDocBytes);

    const copiedPages = await pdfDoc.copyPages(mapPDFDoc,mapPDFDoc.getPageIndices())

  const targetWidth = 792 ;  // Letter width, points
  const targetHeight = 612; // Letter height, points

    if(false){
      for (const page of copiedPages){

        const oldWidth = page.getWidth();
        const oldHeight = page.getHeight();

        const scale = 0.5;

        page.setSize(oldWidth * scale, oldHeight * scale);
        pdfDoc.addPage(page)
      }
    } else {
      for (const sourcePage of mapPDFDoc.getPages()) {
          const embeddedPage = await pdfDoc.embedPage(sourcePage);

          const margin = 36;
          const maxWidth = targetWidth - margin * 2;
          const maxHeight = targetHeight - margin * 2;

          const scale = Math.min(
            maxWidth / embeddedPage.width,
            maxHeight / embeddedPage.height
          );

          const width = embeddedPage.width * scale;
          const height = embeddedPage.height * scale;

          const newPage = pdfDoc.addPage([targetWidth, targetHeight]);

          newPage.drawPage(embeddedPage, {
            x: (targetWidth - width) / 2,
            y: (targetHeight - height) / 2,
            width,
            height,
          });
        }
    }
    
    //  const  = await PDFDocument.load()
    //  await pdfDoc.copyPages



    console.log('thisNote1Array',thisNote1Array)

    if(false){
   
    console.log(`current at ${afterTable.currentY}`)
    page.drawText(`${data.displayRequirementNotes}`, {
              x: 50,
              y: atYFn(page,afterTable.currentY),
              size: 5,
              lineHeight: 22, // Space between lines
              color:colorNames.Red
              });


    console.log('pageSizeLetterW,pageSizeLetterH]',pageSizeLetterW,pageSizeLetterH)

            }
     
      console.log('Saving')
      const pdfBytes = await pdfDoc.save()

      return pdfBytes
}



export const createPDFToFile = async (newdata)=>{
  const data={data:{newdata}}
  console.log(data)
  // console.log(1/n)
  const pdfDoc = await PDFDocument.create()
    const courierFont = await pdfDoc.embedFont(StandardFonts.Courier)
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)

    const [pageSizeLetterW,pageSizeLetterH] = PageSizes.Letter
    
    pdfDoc.registerFontkit(fontkit);

    const customHawaiianFont = await pdfDoc.embedFont(ralewayPathText,{ subset: true });
    const customFontLibre39Font = await pdfDoc.embedFont(fontBytesLibre39Text,{ subset: true });
    const customGothMedFont = await pdfDoc.embedFont(gothMedPathText,{subset:true})

    const page = pdfDoc.addPage([pageSizeLetterH,pageSizeLetterW])

    // const barcodeTestText ="123456"

      /************** Vals Page Specific *****************/
    
      const { width, height } = page.getSize()      

      console.log('************************************')
      console.log(data.titletitle)

      
    createCenteredXTitle(pdfDoc,page,mainFont,25,40, 'Open House')    // timesRomanFont
    createCenteredXTitle(pdfDoc,page,mainFont,20,65, data.data.title)
    createCenteredXTitle(pdfDoc,page,mainFont,12,85, `${data.data.subtitle}`)

 
    // createCenteredXTitle(pdfDoc,page,customHawaiianFont,12,55, `${data.studentInfo.lname}, ${data.studentInfo.fname} Entry Year ${data.studentInfo.entryYear}`)

    // const thisText = 'akdjf adfkjaei3 dfaeafe a faiejfi340190qigq34jtoqia4j;oaijflkawjelieijalkejeij'
    // const textLines = wrapText(timesRomanFont,thisText,15,300)
    // console.log('textLines',textLines)


    const starts={x:inInch(1),y:inInch(2)} // {x:45,y:atYInchFn(page,2)}
    const rowsY=getRange(inInch(0),16,inInch(.25))
    const colsX=getRange(inInch(0),5,inInch(1))

    const tableWidthForLetter = [inInch(.7),inInch(1.25),inInch(1.25),inInch(1.25),inInch(1.25),inInch(1.25)]

    const lScapeGrColW = 1.6
    const tableWidthForLandscape = [inInch(.5),inInch(1),inInch(lScapeGrColW),inInch(.5),inInch(3),inInch(.5),inInch(.5)]
    const tableAlignForLandscape = ['center','left','left','left','left','left','left']

    const tableColumnWidths = tableWidthForLandscape // [inInch(.7),inInch(1.65),inInch(1.65),inInch(1.65),inInch(1.65)]

    const totalColumnWidthInInch = tableColumnWidths.reduce((p,c)=>p+c)
    const tableStartsX = (width-totalColumnWidthInInch)/2
    
    console.log('totalColumnWidthInInch',totalColumnWidthInInch)
    console.log('tableStartsX',tableStartsX)
    console.log('starts',starts)
    // console.log(1/n)
    
    const thisTableFontSize = 6
    const thisTableDataArray = []

    console.log('data',data)

    data.tableData.forEach((thisRow)=>{
      const thisNewRow = []
      thisRow.forEach((thisCell,thisCellIndex)=>{
        const newCell=[]
        
        thisCell.forEach((thisLine)=>{
          // console.log('thisLine',thisLine)
          const thisLineArray = wrapText(timesRomanFont,(thisLine.text + ''),thisTableFontSize,tableColumnWidths[thisCellIndex])
            // console.log('thisCellIndex',thisCellIndex,'tableColumnWidths[thisCellIndex]',tableColumnWidths[thisCellIndex],'thisLine.text',thisLine.text )
            thisLineArray.forEach((thisLineArrayInLine,thisLineArrayInLineIndex)=>{
              newCell.push({textList:thisLineArrayInLine,textAlign:tableAlignForLandscape[thisCellIndex],fontColor:(thisLine.hili?"Red":"Black")})  // ((thisLine+'').includes("(D")?"Red":"Black")
            })
        })

        thisNewRow.push(newCell)
      })

      thisTableDataArray.push(thisNewRow)
    })

  

    const afterTable = createTableByData(page,{x:tableStartsX,y:starts.y},thisTableDataArray,tableColumnWidths) // data.data


    let nextLineY = starts.y +185
    createLeftXTitle(pdfDoc,page,mainFont,11,tableStartsX+50,nextLineY, 'PLEASE NOTE THE FOLLOWING:')

    nextLineY+=12

    const notesWidth=700
    const notesFontSize=13

    const thisNote1Array = wrapText(timesRomanFont,notes1,notesFontSize,notesWidth)     // totalColumnWidthInInch
    const thisNote2Array = wrapText(timesRomanFont,notes2,notesFontSize,notesWidth)
    const thisNote3Array = wrapText(timesRomanFont,notes3,notesFontSize,notesWidth)
    

    thisNote1Array.forEach((r)=>{
      createLeftXTitle(pdfDoc,page,mainFont,6,tableStartsX+50,nextLineY,r)
      nextLineY+=12
    }) 

    thisNote2Array.forEach((r)=>{
      createLeftXTitle(pdfDoc,page,mainFont,6,tableStartsX+50,nextLineY,r)
      nextLineY+=12
    }) 

    thisNote3Array.forEach((r)=>{
      createLeftXTitle(pdfDoc,page,mainFont,6,tableStartsX+50,nextLineY,r)
      nextLineY+=12
    }) 

    // const tableWidthForRooms = [inInch(.5),inInch(1),inInch(.5)]
    // const tableAlignForRooms = ['left','left','left']

    const roomsLegend =[
                  ['C - Castle Building','ART - Art Building','G - Gym Complex']
                  ,['N - Nangaku Building','W - Weinberg Building','I - Courtyard Complex']
                  ,['R - Chapel','S - Sullivan Center','ASC - Arrillaga Student Center']]

    // C - Castle Building	ART - Art Building	G - Gym Complex
    // N - Nangaku Building	W - Weinberg Building	I - Courtyard Complex
    // R - Chapel	S - Sullivan Center	ASC - Arrillaga Student Center

    const roomsLegendStartX = 200

    roomsLegend.forEach((thisRow,rowIndex)=>{
      thisRow.forEach((thisCol,colIndex)=>{
        createLeftXTitle(pdfDoc,page,mainFont,6,roomsLegendStartX+(100*colIndex),nextLineY,thisCol)
      })

      nextLineY+=12
    })

    nextLineY+=12
    createLeftXTitle(pdfDoc,page,mainFont,11,tableStartsX+50,nextLineY, 'Parking Reminders:')
    nextLineY+=12
    
    const thisParking1Array = wrapText(timesRomanFont,"Parking is available in our parking structure on Kamoku Street or along La‘au Street along the Lower School autoline drop off.  ",notesFontSize,notesWidth)     // totalColumnWidthInInch
    const thisParking2Array = wrapText(timesRomanFont,"Beginning at 5:30 p.m., additional parking will be available on our baseball field and the Ala Wai Elementary School parking lot.",notesFontSize,notesWidth)

    thisParking1Array.forEach((r)=>{
      createLeftXTitle(pdfDoc,page,mainFont,6,tableStartsX+50,nextLineY,r)
      nextLineY+=12
    }) 

    thisParking2Array.forEach((r)=>{
      createLeftXTitle(pdfDoc,page,mainFont,6,tableStartsX+50,nextLineY,r)
      nextLineY+=12
    }) 


     /********* Add Map **********/
    console.log('process.cwd()', process.cwd())
    // const mapPDFDocBytes = await fetch('./public/pdf/USMaps.pdf' ).then(res => res.arrayBuffer());   // '../public/pdf/USMaps.pdf'  usMapPath
    // const mapPDFDoc = await PDFDocument.load(mapPDFDocBytes);

    const mapPDFDocBytes = await readFile("./public/pdf/USMaps.pdf")
    const mapPDFDoc =  await PDFDocument.load(mapPDFDocBytes);

    const copiedPages = await pdfDoc.copyPages(mapPDFDoc,mapPDFDoc.getPageIndices())

  const targetWidth = 792 ;  // Letter width, points
  const targetHeight = 612; // Letter height, points

    if(false){
      for (const page of copiedPages){

        const oldWidth = page.getWidth();
        const oldHeight = page.getHeight();

        const scale = 0.5;

        page.setSize(oldWidth * scale, oldHeight * scale);
        pdfDoc.addPage(page)
      }
    } else {
      for (const sourcePage of mapPDFDoc.getPages()) {
          const embeddedPage = await pdfDoc.embedPage(sourcePage);

          const margin = 36;
          const maxWidth = targetWidth - margin * 2;
          const maxHeight = targetHeight - margin * 2;

          const scale = Math.min(
            maxWidth / embeddedPage.width,
            maxHeight / embeddedPage.height
          );

          const width = embeddedPage.width * scale;
          const height = embeddedPage.height * scale;

          const newPage = pdfDoc.addPage([targetWidth, targetHeight]);

          newPage.drawPage(embeddedPage, {
            x: (targetWidth - width) / 2,
            y: (targetHeight - height) / 2,
            width,
            height,
          });
        }
    }
    
    //  const  = await PDFDocument.load()
    //  await pdfDoc.copyPages



    console.log('thisNote1Array',thisNote1Array)

    if(false){
   
    console.log(`current at ${afterTable.currentY}`)
    page.drawText(`${data.displayRequirementNotes}`, {
              x: 50,
              y: atYFn(page,afterTable.currentY),
              size: 5,
              lineHeight: 22, // Space between lines
              color:colorNames.Red
              });


    console.log('pageSizeLetterW,pageSizeLetterH]',pageSizeLetterW,pageSizeLetterH)

            }
     
      console.log('Saving')
      const pdfBytes = await pdfDoc.save()

      const pdfPath= path.join(homeDir,"Projects",projName,"DFiles",subProjName,"thisPDFFileName.pdf")
      fs.writeFileSync(pdfPath, pdfBytes)

      // return pdfBytes
}


export const createNewDoc = async (thisPDFFileName,data)=>{
    const pdfPath= path.join(homeDir,"Projects",projName,"DFiles",subProjName,thisPDFFileName)

    const thisPDFBytes = await createPDFBytes(data)
    
    return thisPDFBytes

      console.log('Saving')
      const pdfBytes = await pdfDoc.save()

      return pdfBytes

    
    const pdfDoc = await PDFDocument.create()
    const courierFont = await pdfDoc.embedFont(StandardFonts.Courier)
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)

    const [pageSizeLetterW,pageSizeLetterH] = PageSizes.Letter
    
    pdfDoc.registerFontkit(fontkit);

    const customHawaiianFont = await pdfDoc.embedFont(ralewayPathText,{ subset: true });
    const customFontLibre39Font = await pdfDoc.embedFont(fontBytesLibre39Text,{ subset: true });
    const customGothMedFont = await pdfDoc.embedFont(gothMedPathText,{subset:true})

    const page = pdfDoc.addPage([pageSizeLetterH,pageSizeLetterW])

    // const barcodeTestText ="123456"

      /************** Vals Page Specific *****************/
    
      const { width, height } = page.getSize()      

      console.log('************************************')
      console.log(data.titletitle)

      
    createCenteredXTitle(pdfDoc,page,customGothMedFont,25,40, 'Open House')    // timesRomanFont
    createCenteredXTitle(pdfDoc,page,customGothMedFont,20,65, data.data.title)
    createCenteredXTitle(pdfDoc,page,customGothMedFont,12,85, `${data.data.subtitle}`)

 
    // createCenteredXTitle(pdfDoc,page,customHawaiianFont,12,55, `${data.studentInfo.lname}, ${data.studentInfo.fname} Entry Year ${data.studentInfo.entryYear}`)

    // const thisText = 'akdjf adfkjaei3 dfaeafe a faiejfi340190qigq34jtoqia4j;oaijflkawjelieijalkejeij'
    // const textLines = wrapText(timesRomanFont,thisText,15,300)
    // console.log('textLines',textLines)


    const starts={x:inInch(1),y:inInch(2)} // {x:45,y:atYInchFn(page,2)}
    const rowsY=getRange(inInch(0),16,inInch(.25))
    const colsX=getRange(inInch(0),5,inInch(1))

    const tableWidthForLetter = [inInch(.7),inInch(1.25),inInch(1.25),inInch(1.25),inInch(1.25),inInch(1.25)]

    const lScapeGrColW = 1.6
    const tableWidthForLandscape = [inInch(.5),inInch(1),inInch(lScapeGrColW),inInch(.5),inInch(3),inInch(.5),inInch(.5)]
    const tableAlignForLandscape = ['center','left','left','left','left','left','left']

    const tableColumnWidths = tableWidthForLandscape // [inInch(.7),inInch(1.65),inInch(1.65),inInch(1.65),inInch(1.65)]

    const totalColumnWidthInInch = tableColumnWidths.reduce((p,c)=>p+c)
    const tableStartsX = (width-totalColumnWidthInInch)/2
    
    console.log('totalColumnWidthInInch',totalColumnWidthInInch)
    console.log('tableStartsX',tableStartsX)
    console.log('starts',starts)
    // console.log(1/n)
    
    const thisTableFontSize = 6
    const thisTableDataArray = []

    console.log('data',data)

    data.tableData.forEach((thisRow)=>{
      const thisNewRow = []
      thisRow.forEach((thisCell,thisCellIndex)=>{
        const newCell=[]
        
        thisCell.forEach((thisLine)=>{
          // console.log('thisLine',thisLine)
          const thisLineArray = wrapText(timesRomanFont,(thisLine.text + ''),thisTableFontSize,tableColumnWidths[thisCellIndex])
            // console.log('thisCellIndex',thisCellIndex,'tableColumnWidths[thisCellIndex]',tableColumnWidths[thisCellIndex],'thisLine.text',thisLine.text )
            thisLineArray.forEach((thisLineArrayInLine,thisLineArrayInLineIndex)=>{
              newCell.push({textList:thisLineArrayInLine,textAlign:tableAlignForLandscape[thisCellIndex],fontColor:(thisLine.hili?"Red":"Black")})  // ((thisLine+'').includes("(D")?"Red":"Black")
            })
        })

        thisNewRow.push(newCell)
      })

      thisTableDataArray.push(thisNewRow)
    })

  

    const afterTable = createTableByData(page,{x:tableStartsX,y:starts.y},thisTableDataArray,tableColumnWidths) // data.data


    let nextLineY = starts.y +185
    createLeftXTitle(pdfDoc,page,customGothMedFont,11,tableStartsX+50,nextLineY, 'PLEASE NOTE THE FOLLOWING:')

    nextLineY+=12

    const notesWidth=700
    const notesFontSize=13

    const thisNote1Array = wrapText(timesRomanFont,notes1,notesFontSize,notesWidth)     // totalColumnWidthInInch
    const thisNote2Array = wrapText(timesRomanFont,notes2,notesFontSize,notesWidth)
    const thisNote3Array = wrapText(timesRomanFont,notes3,notesFontSize,notesWidth)
    

    thisNote1Array.forEach((r)=>{
      createLeftXTitle(pdfDoc,page,customGothMedFont,6,tableStartsX+50,nextLineY,r)
      nextLineY+=12
    }) 

    thisNote2Array.forEach((r)=>{
      createLeftXTitle(pdfDoc,page,customGothMedFont,6,tableStartsX+50,nextLineY,r)
      nextLineY+=12
    }) 

    thisNote3Array.forEach((r)=>{
      createLeftXTitle(pdfDoc,page,customGothMedFont,6,tableStartsX+50,nextLineY,r)
      nextLineY+=12
    }) 

    // const tableWidthForRooms = [inInch(.5),inInch(1),inInch(.5)]
    // const tableAlignForRooms = ['left','left','left']

    const roomsLegend =[
                  ['C - Castle Building','ART - Art Building','G - Gym Complex']
                  ,['N - Nangaku Building','W - Weinberg Building','I - Courtyard Complex']
                  ,['R - Chapel','S - Sullivan Center','ASC - Arrillaga Student Center']]

    // C - Castle Building	ART - Art Building	G - Gym Complex
    // N - Nangaku Building	W - Weinberg Building	I - Courtyard Complex
    // R - Chapel	S - Sullivan Center	ASC - Arrillaga Student Center

    const roomsLegendStartX = 200

    roomsLegend.forEach((thisRow,rowIndex)=>{
      thisRow.forEach((thisCol,colIndex)=>{
        createLeftXTitle(pdfDoc,page,customGothMedFont,6,roomsLegendStartX+(100*colIndex),nextLineY,thisCol)
      })

      nextLineY+=12
    })

    nextLineY+=12
    createLeftXTitle(pdfDoc,page,customGothMedFont,11,tableStartsX+50,nextLineY, 'Parking Reminders:')
    nextLineY+=12
    
    const thisParking1Array = wrapText(timesRomanFont,"Parking is available in our parking structure on Kamoku Street or along La‘au Street along the Lower School autoline drop off.  ",notesFontSize,notesWidth)     // totalColumnWidthInInch
    const thisParking2Array = wrapText(timesRomanFont,"Beginning at 5:30 p.m., additional parking will be available on our baseball field and the Ala Wai Elementary School parking lot.",notesFontSize,notesWidth)

    thisParking1Array.forEach((r)=>{
      createLeftXTitle(pdfDoc,page,customGothMedFont,6,tableStartsX+50,nextLineY,r)
      nextLineY+=12
    }) 

    thisParking2Array.forEach((r)=>{
      createLeftXTitle(pdfDoc,page,customGothMedFont,6,tableStartsX+50,nextLineY,r)
      nextLineY+=12
    }) 


     /********* Add Map **********/
    console.log('process.cwd()', process.cwd())
    // const mapPDFDocBytes = await fetch('./public/pdf/USMaps.pdf' ).then(res => res.arrayBuffer());   // '../public/pdf/USMaps.pdf'  usMapPath
    // const mapPDFDoc = await PDFDocument.load(mapPDFDocBytes);

    const mapPDFDocBytes = await readFile("./public/pdf/USMaps.pdf")
    const mapPDFDoc =  await PDFDocument.load(mapPDFDocBytes);

    const copiedPages = await pdfDoc.copyPages(mapPDFDoc,mapPDFDoc.getPageIndices())

  const targetWidth = 792 ;  // Letter width, points
  const targetHeight = 612; // Letter height, points

    if(false){
      for (const page of copiedPages){

        const oldWidth = page.getWidth();
        const oldHeight = page.getHeight();

        const scale = 0.5;

        page.setSize(oldWidth * scale, oldHeight * scale);
        pdfDoc.addPage(page)
      }
    } else {
      for (const sourcePage of mapPDFDoc.getPages()) {
          const embeddedPage = await pdfDoc.embedPage(sourcePage);

          const margin = 36;
          const maxWidth = targetWidth - margin * 2;
          const maxHeight = targetHeight - margin * 2;

          const scale = Math.min(
            maxWidth / embeddedPage.width,
            maxHeight / embeddedPage.height
          );

          const width = embeddedPage.width * scale;
          const height = embeddedPage.height * scale;

          const newPage = pdfDoc.addPage([targetWidth, targetHeight]);

          newPage.drawPage(embeddedPage, {
            x: (targetWidth - width) / 2,
            y: (targetHeight - height) / 2,
            width,
            height,
          });
        }
    }
    
    //  const  = await PDFDocument.load()
    //  await pdfDoc.copyPages



    console.log('thisNote1Array',thisNote1Array)

    if(false){
   
    console.log(`current at ${afterTable.currentY}`)
    page.drawText(`${data.displayRequirementNotes}`, {
              x: 50,
              y: atYFn(page,afterTable.currentY),
              size: 5,
              lineHeight: 22, // Space between lines
              color:colorNames.Red
              });


    console.log('pageSizeLetterW,pageSizeLetterH]',pageSizeLetterW,pageSizeLetterH)

            }
     
      console.log('Saving')
      const pdfBytes_A = await pdfDoc.save()

      return pdfBytes_A

      fs.writeFileSync(pdfPath, pdfBytes_A)

      return pdfPath // maybe later pdfDoc
}

export const createPDFFile = async (thisPDFFileName,data)=>{
    const pdfPath= path.join(homeDir,"Projects",projName,"DFiles",subProjName,thisPDFFileName)

    console.log('pdfPath',pdfPath)

    // const thisPDFBytes = createPDFBytes(data)

    // fs.writeFileSync(pdfPath, thisPDFBytes)
    return pdfPath

}


// export default {createDocSample}