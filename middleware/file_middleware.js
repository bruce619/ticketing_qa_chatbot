const multer = require('multer');
const path = require('path')

// file upload storage with multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads');
    },
    filename: (req, file, cb) => {
        const unique_suffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + unique_suffix + '.' + file.originalname.split('.').pop());
    }
  });
  
  const file_upload = multer({
    storage: storage,
    fileFilter: function(req, file, cb){
        const validFileExtentions = [".jpg", ".JPG", ".png", ".PNG", ".jpeg", ".JPEG"]
        const ext_ = path.extname(file.originalname);
        if (!validFileExtentions.includes(ext_)){
            return cb(new Error("Invalid file. Please select either .jpg, .JPG, .png, .PNG, .jpeg, .JPEG"))
        }
        cb(null, true)
    },
    limits: { fileSize: 125000 * 20 }, // 20mb
});


module.exports = file_upload