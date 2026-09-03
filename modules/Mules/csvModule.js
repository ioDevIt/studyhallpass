import papa from 'papaparse'
import csvtojson from 'csvtojson'
import fs from 'fs'
// import path from 'path'

  const writeCSV = (fileName, data, res, fn) => {
    var csv = Papa.unparse(data);
    fs.writeFile(fileName, csv, (err) => {
      if (err) {
        console.log("err while saving");
      } else {
        console.log("File saved");

        fn(res, fileName);
      }
    });
  };

  const writeCSVDirect = (fileName, data) => {
    var csv = Papa.unparse(data);
    fs.writeFile(fileName, csv, (err) => {
      if (err) {
        console.log("err while saving");
      } else {
        console.log("File saved");
      }
    });
  };

export const writeCSVDirectSync = (fileName, data) => {
    var csv = papa.unparse(data,{quotes:true});
    fs.writeFileSync(fileName, csv);
  };

  const ObjectToSheetArray = (thisObject) => {
    let mainHeaderKeys = Object.keys(thisObject[0]);
    let body = [];

    body.push(mainHeaderKeys);

    thisObject.forEach((thisRec) => {
      let thisRow = [];
      mainHeaderKeys.forEach((thisHeader) => {
        thisRow.push(thisRec[thisHeader]);
      });
      body.push(thisRow);
    });

    return body;
  };

  const readCSV = (fileName, res, func1) => {
    console.log("********");
    console.log(__dirname);

    let testFile = __dirname + "/" + "ClassEnrollmentsAll20230707.csv";

    fs.readFile(testFile, "utf8", function (err, data) {
      Papa.parse(data, {
        delimiter: ",",
        header: true,
        complete: (results) => {
          console.log(results);
          res.json(results);
        },
      });

      // res.json(data);
    });
  };

  export const readCSVSync = (fileNamePath) => {
    const fileData = fs.readFileSync(fileNamePath, "utf8");
    return papa.parse(fileData, {
      delimiter: ",",
      header: true,
    });
  };

export const CSV2JSON=async (thisCSV)=>{    return await  csvtojson({flatKeys:true}).fromString(thisCSV) }