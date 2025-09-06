import { Request, Response } from "express";

interface IImageController {
    processImages(request: Request, response: Response): Promise<void>;
};

export default IImageController;