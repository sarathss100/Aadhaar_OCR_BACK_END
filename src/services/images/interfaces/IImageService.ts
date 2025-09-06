import { Express } from "express";
import IAadhaar from "../../../utils/interfaces/IAadhaar";
interface IImageService {
    processImages(frontSide: Express.Multer.File, backSide: Express.Multer.File): Promise<IAadhaar>;
};

export default IImageService;