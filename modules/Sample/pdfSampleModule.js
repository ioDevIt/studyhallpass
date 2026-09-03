import fs from "fs"
import os from "os"
import path from "path"
import {PDFDocument, StandardFonts,rgb,degrees,grayscale} from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'

const homeDir = os.homedir()

const libreBarcode39Path=path.join(homeDir,'Projects','baseES6',"assets",'LibreBarcode39Text-Regular.ttf')
const notoPath=path.join(homeDir,'Projects','baseES6',"assets",'NotoSerif-VariableFont_wdth,wght.ttf');
const ralewayPath=path.join(homeDir,'Projects','baseES6',"assets",'Raleway-Bold.ttf');

const fontBytesLibre39Text = fs.readFileSync(libreBarcode39Path);

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
        console.log('line Option',options)
        const defaultOptions={thickness: 2,  color: rgb(0.75, 0.2, 0.2),  opacity: 0.75,}
        const optionParams={start:start,end:end}
        for(const thisOpt in defaultOptions){optionParams[thisOpt]=((thisOpt in options)?options[thisOpt]:defaultOptions[thisOpt])}

        console.log('optionParams',optionParams)
        thisPage.drawLine(optionParams)
    }

export const createDocSample = async (thisPDFFileName,data)=>{
    const pdfPath= path.join(homeDir,"Projects","baseES6","DFiles","Sample",'TEST Template For JS.pdf')
    
    const pdfDoc = await PDFDocument.create()
    const courierFont = await pdfDoc.embedFont(StandardFonts.Courier)
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)

    pdfDoc.registerFontkit(fontkit);

    const customFontLibre39Font = await pdfDoc.embedFont(fontBytesLibre39Text,{ subset: true });
    const page = pdfDoc.addPage()

    const barcodeTestText ="123456"

      /************** Vals Page Specific *****************/
    
      const { width, height } = page.getSize()      

     drawFieldText(page,100,100,barcodeTestText,{font:customFontLibre39Font}) // ,customFontLibre39Font,16
     drawLine(page,{x:10,y:100},{x:200,y:200},{thickness:15,opacity:.85,color:rgb(0.75, 0.0, 0.2)})
     drawRect(page,100,100,500,500,{opacity:0.5,color:rgb(0,0,0.2),borderWidth:5})

     drawFieldText(page,150,150,barcodeTestText)
     const pdfBytes = await pdfDoc.save()

      fs.writeFileSync(pdfPath, pdfBytes)

      return pdfPath // maybe later pdfDoc
}

export const modifyDocSample = async (data)=>{
    let dataTemplatesDir = path.join(homeDir,"Projects","baseES6","DFiles","Sample")
    const dataUploadFileDir = path.join(homeDir,"Projects","baseES6","DFiles","Sample")
    let inputPDFFileName=path.join(dataTemplatesDir,'OPEN HOUSE Template For JS.pdf')
    const PDFdoc = await PDFDocument.load(fs.readFileSync(inputPDFFileName))

    PDFdoc.registerFontkit (fontkit)
    console.log('notoPath',notoPath)

    const notoFont = await PDFdoc.embedFont(fs.readFileSync(notoPath))
    const ralewayFont = await PDFdoc.embedFont(fs.readFileSync(ralewayPath))
    
    const page= PDFdoc.getPage(0);

    const standardFontBoldHelveticaBold= await PDFdoc.embedFont(StandardFonts.HelveticaBold);
    const courierFont = await PDFdoc.embedFont(StandardFonts.Courier)

    const mainStandOutColor= rgb(0.95,0.05,0); 

    const textInfo={
            title1:{
                text:'Title1',
                info:{x: 50,y: 595,size: 16, color: mainStandOutColor,font:ralewayFont}
            },
            schoolYr:{
                text:`2025-2026 Yr`,
                info:{x: 309.4,y: 695.5,size: 15, color: mainStandOutColor,font:standardFontBoldHelveticaBold}
            }
        }
    
    for(let thisDrawName in textInfo){
                const thisDraw = textInfo[thisDrawName]
                page.drawText(thisDraw.text, thisDraw.info) 
            }

    const nextPage = PDFdoc.addPage()
    drawRect(nextPage,50,50,100,100,{borderColor: grayscale(0.0), color: rgb(0.75, 0.2, 0.2),})

    let pdfFileName=path.join(dataUploadFileDir,"TESTPDF.pdf");

    fs.writeFileSync(pdfFileName, await PDFdoc.save())

    return pdfFileName;
}

export default {createDocSample,modifyDocSample}