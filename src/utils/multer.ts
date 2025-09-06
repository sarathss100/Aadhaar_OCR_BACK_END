import multer from "multer";
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { Express } from "express";

const UPLOAD_DIRECTORY = path.join(__dirname, '../../uploads/aadhaar');

const storage = multer.diskStorage({
    destination: (request, file, cb) => {
        if (!fs.existsSync(UPLOAD_DIRECTORY)) {
            fs.mkdirSync(UPLOAD_DIRECTORY, { recursive: true });
        }
        cb(null, UPLOAD_DIRECTORY);
    },
    filename: (request, file, cb) => {
        const extName = path.extname(file.originalname);
        const randomName = crypto.randomBytes(4).toString('hex');
        cb(null, `${file.fieldname}-${Date.now()}-${randomName}${extName}`);
    },
});

const fileFilter = function (request: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error(`Please file in image format`));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
});

export default upload;