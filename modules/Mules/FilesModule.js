import { CSV2JSON,writeCSVDirectSync } from "./csvModule.js"
import fs from "fs"
import os from "os"
import path from "path"

const homeDir = os.homedir()

export const getFileData = async (thisFilePath) => {
  // let thisCleanFilePath=(Array.isArray(thisFilePath)?path.join(homeDir,...thisFilePath):path.join(homeDir,thisFilePath))
  const thisData = fs.readFileSync(thisFilePath, { encoding: "utf8" });
  return await CSV2JSON(thisData);
}

export const setDataToFile = (thisFilePath,thisData)=>{
  let thisCleanFilePath=(Array.isArray(thisFilePath)? path.join(homeDir,...thisFilePath) :path.join(homeDir,thisFilePath))
  writeCSVDirectSync(thisCleanFilePath,thisData)
  return path.join(homeDir,...thisFilePath)
}

export default {getFileData,setDataToFile}