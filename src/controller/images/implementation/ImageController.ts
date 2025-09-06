import { Request, Response } from "express";
import IImageController from "../interfaces/IImageController";
import IImageService from "../../../services/images/interfaces/IImageService";
import { handleControllerError } from "../../../error/AppError";
import { sendSuccessResponse } from "../../../utils/responseHandler";
import { StatusCodes } from "../../../constants/statusCodes";
import { SuccessMessages } from "../../../constants/successMessages";
import { Express } from "express";

class ImageController implements IImageController {
    private readonly _imageService: IImageService;

    constructor(imageService: IImageService) {
        this._imageService = imageService;
    }

    async processImages(request: Request, response: Response): Promise<void> {
        try {
            const files = request.files as { [Field: string]: Express.Multer.File[] };
            if (!files?.frontSide?.length || !files?.backSide?.length) {
                throw new Error(`Both Aadhaar front and back images are required.`);
            }

            const frontSide = files.frontSide[0];
            const backSide = files.backSide[0];

            const processedData = await this._imageService.processImages(frontSide, backSide);

            sendSuccessResponse(response, StatusCodes.OK, SuccessMessages.OPERATION_SUCCESS, { processedData });
        } catch (error) {
            handleControllerError(response, error);
        }
    }
};

export default ImageController;