import 'dotenv/config'
import os from 'os'
import path from 'path'

const setup=()=>{
    const homeDir = os.homedir();
    const IS_PROD = process.env.IS_PROD;
    const PORT = process.env.PORT;
    const OAUTH2_HOST=(IS_PROD=='Y'?process.env.OAUTH2_HOST_P:process.env.OAUTH2_HOST_D+":"+PORT)
    return {
    
    HOMEDIR:homeDir,
    dt:{
        timeZone:process.env.IN_TIME_ZONE,
        dtFormat:process.env.DATE_TIME_FORMAT
    },

    knex:{
        "client": process.env.DB_CLIENT,
        "connection": {
            "host": process.env.DB_CONNECTION_HOST,
            "user": process.env.DB_CONNECTION_USER,
            "password": process.env.DB_CONNECTION_PASSWORD,
            "database": process.env.DB_CONNECTION_DATABASE
        },
        "pool": {
            "min": Number(process.env.DB_POOL_MIN),
            "max": Number(process.env.DB_POOL_MAX)
        }
    },

    goog:{
        googleClientID:process.env.GOOGLECLIENTID,
        googleClientSecret:process.env.GOOGLECLIENTSECRET,
        cookieKeys:[process.env.GOOGLECOOKIEKEYS],
        googleCallbackURL:process.env.GOOGLECALLBACKURL
    },

    PORT : process.env.PORT,     
     HOME_DIR:(IS_PROD=='Y'?homeDir:path.join(homeDir,'Projects','veracommons')),
     PACKAGES_DIR : (IS_PROD=='Y'?'/var/sftp/uploads/':'/var/sftptest/'),

    UPLOADS_DIR:'test',
    UPLOADS_WRITE_DIR:process.env.UPLOADS_WRITE_DIR,

    VERA:{
        grantType:process.env.VERA_GRANT_TYPE,
        clientId:process.env.VERA_CLIENT_ID,
        clientSecret:process.env.VERA_CLIENT_SECRET
    },
    ASM:{
        host:process.env.ASM_HOST,
        username:process.env.ASM_USER,
        pw:process.env.ASM_PW
    },
    OAUTH2_HOST:OAUTH2_HOST,
    OAUTH2:{
        tokenURL:process.env.OAUTH2_TOKEN_URL,
        clientId:process.env.OAUTH2_CLIENT_ID,
        clientSecret:process.env.OAUTH2_CLIENT_SECRET,
        callbackURL:OAUTH2_HOST + process.env.OAUTH2_CALLBACK_URL,
        authorizationURL:process.env.OAUTH2_AUTHORIZATION_URL.replace("<OAUTH2_CLIENT_ID>",process.env.OAUTH2_CLIENT_ID).replace("<OAUTH2_HOST>",OAUTH2_HOST),
    },    

     EKEY:process.env.EKEY,
     TEST_ADMIN:process.env.TEST_ADMIN,
     SCHOOL_CAL_ICS:process.env.SCHOOL_CAL_ICS,
    }
}

export default setup