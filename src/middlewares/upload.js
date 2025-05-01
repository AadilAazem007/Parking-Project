import multer from 'multer';

const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg']
    if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error('Only JPEG and PNG images are allowed'), false);
    }
    cb(null, true);
}


const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
})

const uploadImage = upload.single('image');

const handleUploadErrors = (err, req, res, next) => {
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
    next(err);
};

export { uploadImage, handleUploadErrors };