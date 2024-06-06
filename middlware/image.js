const uploadImage=(person)=>{
    const multer=require('multer');
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, './images/'+person)
        },
        filename: function (req, file, cb) {
          const uniqueSuffix = Date.now() + '-' + file.originalname;
          cb(null, file.fieldname + '-' + uniqueSuffix)
        }
      })
    const fileFilter=(req,file,cb)=>{
        if(
            file.mimetype==='image/png' ||
            file.mimetype==='image/jpg' ||
            file.mimetype==='image/jpeg' 
        )
        cb(null,true);
        else
        cb(null,false);
    };
    
    const upload =multer({storage:storage,fileFilter:fileFilter});
    return upload;
};

const deleteImage=(imageURL)=>{
     require('fs').unlink(imageURL,(err)=>{
        if(err){
            throw err;
        }
        });
};

module.exports={
    uploadImage,
    deleteImage
};