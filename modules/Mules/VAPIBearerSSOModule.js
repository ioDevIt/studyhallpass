import dotenvModule from "./dotenvModule.js";
import { default as axios } from "axios";
import { URLSearchParams } from "url";

const dotEnv = dotenvModule();
// const axios = require('axios').default;

const thisURL = "https://accounts.veracross.com/iolani/oauth/token";

const main = () => {
  const getEncodedParams = (scopeList) => {
    // console.log(JSON.stringify(dotenvModule))

    let thisScopeList =
      scopeList == undefined
        ? "students:read students:list academics.enrollments:list"
        : scopeList;
    const encodedParams = new URLSearchParams();
    encodedParams.set("grant_type", dotEnv.VERA.grantType);
    encodedParams.set("client_id", dotEnv.VERA.clientId);
    encodedParams.set("client_secret", dotEnv.VERA.clientSecret);
    encodedParams.set("scope", thisScopeList);

    // encodedParams.set('code', '');
    // encodedParams.set('redirect_uri', '');
    console.log("encodedParams", JSON.stringify(encodedParams));
    return encodedParams;
  };

  const getOptions = () => {
    return {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
    };
  };

  const getHeaders = (headerValObj) => {
    // // thisToken, pageSize, pageNumber
    return {
      Authorization: `Bearer ${headerValObj.thisToken}`,
      // "X-API-Value-Lists": "include",
      "X-Page-Size": "pageSize" in headerValObj ? headerValObj.pageSize : 2000,
      "X-Page-Number":
        "pageNumber" in headerValObj ? headerValObj.pageNumber : 1,
      // "X-API-Value-Lists":'include',
    };
  };

  const getBearerTokenAxiosSync = async (res, scopeObj) => {
    const startTime = new Date();
    const { URLSearchParams } = require("url");
    const encodedParams = getEncodedParams(scopeObj.scope);

    const options = getOptions();
    options.url = thisURL;
    options.data = encodedParams;

    try {
      axios
        .request(options)
        .then((resp) => {
          return resp.data;
        })
        .then(async (data) => {
          const diffDate = (new Date() - startTime) / 1000;
          console.log(diffDate);
          data.diff = diffDate;

          let headerValObj = {
            thisToken: data.access_token,
            pageSize: 1000,
            pageNumber: 1,
          };

          let allData = [];
          let allDataLength = [];
          let findMoreData = true;
          let maxCycles = 5;

          while (findMoreData && maxCycles > 0) {
            maxCycles--;
            const thisData = await axios.get(scopeObj.url, {
              headers: getHeaders(headerValObj),
            });

            allDataLength.push(thisData.data.data.length);
            findMoreData = thisData.data.data.length == 1000;
            console.log("data size", thisData.data.data.length);
            allData = allData.concat(thisData.data.data);
            headerValObj.pageNumber++;
          }

          const diffDate2 = (new Date() - startTime) / 1000;
          console.log(diffDate2);

          scopeObj.withDataFn(res, allData);

          // res.json({allDataLength,lv:allData.length,allData}) // ,vl:thisData.data.data.length,data:thisData.data.data
        });
    } catch (error) {
      // console.error(error);
      console.error(Object.keys(error));
    }
  };


  const getAxiosFetch=async (scopeObj,headerValObj)=>{
    try{
      const thisData = await axios.get(scopeObj.url, {headers: getHeaders(headerValObj),});

      console.log('Has No Error')
      // console.log(thisData)
      //  console.log(1/n)
      return thisData
    }
    catch(error){
      if(error){
        console.log('Has Error')
        // console.log(error)
        // console.log(error.response)
        const errorRsp = error.response   
        console.log(errorRsp.status, errorRsp.statusText,errorRsp.data.error)

        return error.response
             

        return {status:errorRsp.status,statusText:errorRsp.statusText,statusDataError:errorRsp.data.error}
        console.log(errorRsp.status, errorRsp.statusText,errorRsp.data)
      }
    }
  }

  const getBearerTokenAxiosSyncBack = async (scopeObj) => {
    // res,scopeObj
    const startTime = new Date();

    // const { URLSearchParams } = require('url');
    const encodedParams = getEncodedParams(scopeObj.scope);

    const options = getOptions();
    options.url = thisURL;
    options.data = encodedParams;

    console.log(options);

    const reqDataInfo = await axios.request(options);

    console.log("reqDataInfo", reqDataInfo.data);

    const pageSize = 1000;
    let maxCycles = 14;
    let pageNumber = 1;
    let nextPage = true;
    let returnDataArray = [];

    while (maxCycles > 0 && nextPage) {
      let headerValObj = {
        thisToken: reqDataInfo.data.access_token,
        pageSize: pageSize,
        pageNumber: pageNumber,
      };

      // const thisData = await axios.get(scopeObj.url, {headers: getHeaders(headerValObj),});

      const thisData = await getAxiosFetch(scopeObj,headerValObj)

      // console.log(1/n)

      if(thisData.status===200){
        console.log("thisData Length", thisData.data.data.length);
        console.log("thisPage ", nextPage);
        console.log("maxCycles ", maxCycles);

        nextPage = thisData.data.data.length == pageSize;
        maxCycles--;
        pageNumber++;

        returnDataArray = returnDataArray.concat(thisData.data.data);
      }else{
        nextPage=false
      }
    }

    console.log("Completed");
    return returnDataArray;
  };

  return { getBearerTokenAxiosSyncBack };
};

export default main;