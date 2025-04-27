import multer from 'multer';
import path from 'path';

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && 
            file.mimetype !== 'application/vnd.ms-excel') {
            return cb(new Error('Only Excel files are allowed!'));
        }
        cb(null, true);
    }
});

export default upload; 