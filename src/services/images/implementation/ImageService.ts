import { wrapServiceError } from "../../../error/AppError";
import IImageService from "../interfaces/IImageService";
import { Express } from "express";

class ImageService implements IImageService {
    async processImages(front: Express.Multer.File, back: Express.Multer.File): Promise<void> {
        try {
            const processfront = front;
            const processBack = back;
        } catch (error) {
            throw wrapServiceError(error);
        }
    }
};

export default ImageService;