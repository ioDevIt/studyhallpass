import multer from "multer";
import path from "path"

//  (req,loadFiles,thisFolder=['DFiles','Uploads','documents'],allowedExt=['.pdf']) 
const setMulter = (thisFolder=['DFiles','Uploads','documents'],allowedExt=['.pdf']) => {
//   const allowedExt = [".pdf"];

  const storage = multer.diskStorage({
  destination: function (req, file, cb) {

    console.log('-------------InStorage----------------------')
    console.log('req.body.postid',req.body.postid,'|',req.session.sessionGETID)

    cb(null,((req.body.postid === req.session.sessionGETID)? path.join(...thisFolder):'DFiles/Uploads/noposts')) 
},
  filename: function (req, file, cb) {
    const filePrefix = ((req.body.postid === req.session.sessionGETID)?"":"DNU_")
    const uniqueSuffix = Date.now()
    cb(null, filePrefix+"_" +uniqueSuffix + "_" +file.originalname)
  }
})

const fileFilter=(req,file,cb)=>{
    // const allowedExt =['.pdf']
    const thisFileType = path.extname(file.originalname)

    cb(null,allowedExt.includes(thisFileType))
}

  const upload = multer({ storage: storage, fileFilter: fileFilter });
  return upload;
}

export { setMulter };