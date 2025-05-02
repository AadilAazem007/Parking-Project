import multer from 'multer';
import path from 'path';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    console.log('File received:', file);
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!file || !allowedTypes.includes(file.mimetype)) {
        return cb(new Error('Only JPEG and PNG images are allowed'), false);
    }
    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

const uploadImage = (req, res, next) => {
    console.log('Starting form-data parsing...');
    upload.single('image')(req, res, (err) => {
        if (err) {
            console.error('Multer error in uploadImage:', err.message, err.stack);
            return next(err);
        }
        console.log('Form-data parsing completed:', req.body, req.file);
        next();
    });
};

const handleUploadErrors = (err, req, res, next) => {
    console.log('handleUploadErrors triggered:', err.message);
    if (err instanceof multer.MulterError) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: `Image upload error: ${err.message}`,
            data: []
        });
    }
    if (err.message === 'Only JPEG and PNG images are allowed') {
        return res.status(400).json({
            status: 400,
            success: false,
            message: err.message,
            data: []
        });
    }
    if (err.message === 'Unexpected end of form') {
        return res.status(400).json({
            status: 400,
            success: false,
            message: 'Invalid form-data: Incomplete or malformed request. Please check your file and form fields.',
            data: []
        });
    }
    console.error('Unhandled error in handleUploadErrors:', err);
    return res.status(500).json({
        status: 500,
        success: false,
        message: `Server error during file upload: ${err.message}`,
        data: []
    });
};

export { uploadImage, handleUploadErrors };