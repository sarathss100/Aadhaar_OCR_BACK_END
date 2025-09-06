import { Express } from "express";
interface IImageService {
    processImages(front: Express.Multer.File, back: Express.Multer.File): Promise<void>;
};

export default IImageService;