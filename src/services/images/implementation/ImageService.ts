import { wrapServiceError } from "../../../error/AppError";
import { extractAadhaarDetails, isAadhaarCard, mergeAadhaarDetails } from "../../../utils/aadhaarParser";
import identifySides from "../../../utils/identifySides";
import extractTextFromImage from "../../../utils/imageOcr";
import IAadhaar from "../../../utils/interfaces/IAadhaar";
import deleteImages from "../../../utils/removeImages";
import validateAadhaarDetails from "../../../utils/validateAadhaarDetails";
import IImageService from "../interfaces/IImageService";
import { Express } from "express";

class ImageService implements IImageService {
    async processImages(frontSide: Express.Multer.File, backSide: Express.Multer.File): Promise<IAadhaar> {
        try {
            const [extractedTextFromFrontSide, extractedTextFromBackSide] = await Promise.all([
                extractTextFromImage(frontSide.path),
                extractTextFromImage(backSide.path)
            ]);

            if (!isAadhaarCard(extractedTextFromFrontSide) || !isAadhaarCard(extractedTextFromBackSide)) {
                throw new Error("Please upload a valid Aadhaar Card Image");
            }

            // Double check which side is which based on content
            const { frontSideText, backSideText } = identifySides(extractedTextFromFrontSide, extractedTextFromBackSide);

            // Filterout details from both sides 
            const frontSideDetails = extractAadhaarDetails(frontSideText, false);
            const backSideDetails = extractAadhaarDetails(backSideText, true);

            // Combine both fronSide and backSide Details
            const aadhaarDetails = mergeAadhaarDetails(frontSideDetails, backSideDetails);

            // final validation
            validateAadhaarDetails(aadhaarDetails);

            return aadhaarDetails;
        } catch (error) {
            throw wrapServiceError(error);
        } finally {
            await deleteImages(frontSide.path, backSide.path);
        }
    }
};

export default ImageService;