import OAuth2Strategy from "passport-oauth2";
import GoogleStrategy from "passport-google-oauth20"

import dotEnvMod from "../modules/Mules/dotenvModule.js"
import vapiSSO from "../modules/Mules/VAPIUserInfo.js"
import {insertLog} from "../modules/Mules/logsModule.js"
import {passStatic,getUserRoles,isUserTrackSHAttendance} from "../modules/Mules/accessModule.js"


import {trace} from "../modules/Mules/logsModule.js"

const dotEnv = dotEnvMod()
const vapiSSOFn=vapiSSO()

const accessPasses=['syamashiro@iolani.org','sweaver@iolani.org','kasato@iolani.org','bchun@iolani.org','mdaggett@iolani.org','larafeld@iolani.org','ahiga@iolani.org','kkadofukuda@iolani.org','akaonohi@iolani.org','nlau@iolani.org','hlee@iolani.org','kmarks@iolani.org','anakagawa@iolani.org','spark@iolani.org','csakamoto@iolani.org','ptom@iolani.org','nhue@iolani.org','eyamamoto@iolani.org','lyoneda@iolani.org']


const setPassport =(passport)=>{

const serializeGoogle=(thisUserInfo)=>{
    var uId = thisUserInfo.id.toLowerCase().trim();
    var returnUser={};

    var uIdComps = uId.split('@');
    returnUser.type='V'
    returnUser.id = uIdComps[0];  //'zzz2401'; // uIdComps[0]; // 'zzz2401'; // uIdComps[0]; // 'kasato'; // 'keb2401'; //kasato'; //uIdComps[0];
    returnUser.domain = (uIdComps.length==2?uIdComps[1]:null);

    returnUser.isIO= (returnUser.domain=="iolani.org");

    return returnUser;
}

const serializeV=(thisUserInfo)=>{
    var returnUser={...thisUserInfo};
    returnUser.uid=thisUserInfo.preferred_username.replace('@iolani.org','')

    return returnUser;
}

passport.serializeUser((user, done) => {
    console.log('************* In Serialize *****************')
    // console.log('user',user)

    var returnUser=user

    // console.log('In Serialize ' + JSON.stringify(returnUser));
    console.log('Before SErialize ' , JSON.stringify(returnUser.id),JSON.stringify(returnUser))
        // console.log('Before SErialize ' + JSON.stringify(returnUser))
    done(null, returnUser);
});

passport.deserializeUser((user, done) => {
    console.log('***************** In Deserialize *****************') // + JSON.stringify(user));
    // console.log({whereObj:{userid:user.id}})

    done(null, user);
})

passport.use(new GoogleStrategy({ clientID: dotEnv.goog.googleClientID, clientSecret: dotEnv.goog.googleClientSecret
    , callbackURL: "/auth/google/callback"
    , passReqToCallback: true },
    function (accessToken, refreshToken, profile, done) {
        console.log('In Google Strategy')
        // console.log(JSON.stringify(Object.keys(profile)))
        // console.log('*******************************************************')
        //     console.log(JSON.stringify(profile))
        // console.log('*******************************************************')
        let searchAddObj = {type:"???"}  // { googleId: profile.id };

        if(profile.provider==="google"){
            searchAddObj.type="G"
            searchAddObj.id =  profile._json.email.replace(`@${profile._json.hd}`,'').trim()
            searchAddObj.email=profile._json.email
            searchAddObj.domain=profile._json.hd
            searchAddObj.VOnly={Roles:[]}
            searchAddObj.GOnly={displayName:profile.displayName,firstName:profile.name.givenName,lastName:profile.name.familyName,photos:'Maybe Later',email_verified:profile._json.email_verified}
            searchAddObj.gates={}
        }

        // if(passStatic(searchAddObj.email)){
        //     searchAddObj.Roles=["ADMIN"]
        //     insertLog(`Log in`,`${JSON.stringify(profile.displayName)}`,profile._json.email.replace(`@${profile._json.hd}`,'').trim())
        //     .then(()=>{
        //         // console.log('****************************** Logged ************************************')
        //     })

        //     // console.log('********************** G Strategy *********************************')
        //     // console.log(JSON.stringify(searchAddObj))

        //     done(null, searchAddObj);
        // }
        // else 
        if("id" in searchAddObj){
            getUserRoles(searchAddObj["id"]).then((thisData)=>{
                // searchAddObj.Roles=thisData.map((r)=>r.roleid)

                    searchAddObj.Roles=[]
                    thisData.forEach((r)=>{if(!(searchAddObj.Roles.includes(r.roleid))){searchAddObj.Roles.push(r.roleid)}})

                    insertLog(`Log in`,`${JSON.stringify(profile.displayName)}`,profile._json.email.replace(`@${profile._json.hd}`,'').trim())
                    .then(()=>{
                        // console.log('****************************** Logged ************************************')
                    })
                    done(null, searchAddObj);
            })
        }
        else
        {   /******** Not Google **********/
            insertLog(`Log in`,`${JSON.stringify(profile.displayName)}`,profile._json.email.replace(`@${profile._json.hd}`,'').trim())
                .then(()=>{
                    // console.log('****************************** Logged ************************************')
                })

                done(null, searchAddObj);
        }    
    }));


passport.use(new OAuth2Strategy({
        authorizationURL: dotEnv.OAUTH2.authorizationURL,
        tokenURL:  dotEnv.OAUTH2.tokenURL,
        clientID: dotEnv.OAUTH2.clientId,
        clientSecret: dotEnv.OAUTH2.clientSecret,
        callbackURL: dotEnv.OAUTH2.callbackURL
      },
      
      async function(accessToken, refreshToken, profile, done) {
        console.log('********************** V Strategy *********************************')    
        console.log(JSON.stringify(accessToken))
    
        const thisInfo = await vapiSSOFn.getVeraUserInfoSync(accessToken);
        
        let searchAddObj = {type:"???"};

        /******** Only Test  **********/
        const testUser=false

        if(testUser){
            thisInfo.data.sub = 101708
            thisInfo.data.email = 'MKA3101@iolani.org'
        }
        /******************************/


        if(thisInfo.isVeracross){
            searchAddObj.type="V"
            searchAddObj.id = 123980 // thisInfo.data.sub
            searchAddObj.email=thisInfo.data.email
            searchAddObj.domain="veracross"
            searchAddObj.VOnly={Roles:thisInfo.data.roles}
            searchAddObj.GOnly={}
            searchAddObj.Roles=[...thisInfo.data.roles]

            searchAddObj.grade = null
            searchAddObj.gates={}

            if(searchAddObj.Roles.includes('Faculty') || searchAddObj.Roles.includes('Staff'))
                { 
                    // accessPasses.includes(searchAddObj.email) || 
                    if(accessPasses.includes(searchAddObj.email) || await isUserTrackSHAttendance(searchAddObj.id)){ // Add Student as Role for Testing
                        searchAddObj.Roles.push('Passer')
                    }
                }    

            // if(searchAddObj.Roles.includes('Student')){
            //     console.log('Check Fix')
            //     console.log('thisInfo.data.sub',thisInfo.data.sub)
            //     // const thisStudentInfo_V = await userMod.getStudentInfo(thisInfo.data.sub)
            //     const thisStudentInfo_V = await userMod.getStudentInfo(thisInfo.data.sub) // Fix here to allow student id to be taken 100817

            //     console.log('thisStudentInfo_V',thisStudentInfo_V)
            //     // console.log(1/n)

            //     searchAddObj.grade = thisStudentInfo_V.grade_level
            // }
        }

        console.log('searchAddObj',searchAddObj)
        // n=1/e

        done(null, searchAddObj);

        // if("id" in searchAddObj){
        //     console.log('id in searchAddObj')
        //     getUserRoles(searchAddObj["email"]).then((thisData)=>{
        //         // searchAddObj.Roles=thisData.map((r)=>r.roleid)

        //         // console.log('thisData',thisData)

        //             // searchAddObj.Roles=[]
        //             thisData.forEach((r)=>{console.log('r.roleid',r.roleid);console.log('searchAddObj.Roles.includes(r.roleid)',searchAddObj.Roles.includes(r.roleid));if(!(searchAddObj.Roles.includes(r.roleid))){console.log('Push In');searchAddObj.Roles.push(r.roleid)}})

        //             insertLog(`Log in`,`${JSON.stringify(searchAddObj.email)}`,searchAddObj.email.trim())
        //             .then(()=>{
        //                 // console.log('****************************** Logged ************************************')
        //             })

        //             // console.log('thisData searchAddObj',searchAddObj)
        //             done(null, searchAddObj);
        //     })
        // }
        // else
        // {   /******** Not Veracross **********/
        //     insertLog(`Log in`,`${JSON.stringify(profile.displayName)}`,profile._json.email.replace(`@${profile._json.hd}`,'').trim())
        //         .then(()=>{
        //             // console.log('****************************** Logged ************************************')
        //         })

        //         done(null, searchAddObj);
        // }


        // return done(null, searchAddObj); 
      }
    ));        
}

export default setPassport