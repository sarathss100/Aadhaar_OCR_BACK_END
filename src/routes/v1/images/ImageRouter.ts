import { Router } from "express";
import IImageController from "../../../controller/images/interfaces/IImageController";
import upload from "../../../utils/multer";

const createImageRouter = function(imageController: IImageController): Router {
    const router = Router();

    router.post('/', upload.fields([{ name: 'frontSide', maxCount: 1 }, { name: 'backSide', maxCount: 1 }]), imageController.processImages.bind(imageController));

    return router;
};

export default createImageRouter;