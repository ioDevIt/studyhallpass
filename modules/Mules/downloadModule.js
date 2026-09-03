import fs from "fs"
import path from "path"
import os from "os"

export const sendFile = (res, thisFilePathDownLoadArray)=>{
    const thisFilePath = path.join(os.homedir(),"Projects","baseES6","DFiles",...thisFilePathDownLoadArray)
    const fileNameOnly = path.basename(thisFilePath)

    console.log('thisFilePath',thisFilePath)

    res.set('Content-Disposition', `attachment; filename="${fileNameOnly}"`);

    res.sendFile(thisFilePath)
}

export const downloadFile = (res, thisFilePathDownLoadArray)=>{
    const thisFilePath = path.join(os.homedir(),"Projects","baseES6","DFiles",...thisFilePathDownLoadArray)
    const fileNameOnly = path.basename(thisFilePath)

    console.log('thisFilePath',thisFilePath)

    res.download(thisFilePath,fileNameOnly,(err)=>{
        if (err) {
            if (err.code === 'ENOENT') {
                res.status(404).send('File not found.');
            } else {
                res.status(500).send('Error downloading file.');
            }
        } else {
            console.log('File downloaded successfully.');
            res.send('completed')
        }
    })
}

export default {sendFile,downloadFile}