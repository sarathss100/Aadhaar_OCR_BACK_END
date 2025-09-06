import ImageController from "../../../controller/images/implementation/ImageController";
import IImageController from "../../../controller/images/interfaces/IImageController";
import ImageService from "../../../services/images/implementation/ImageService";
import createImageRouter from "./ImageRouter";

class ImageContainer {
    public readonly controller: IImageController;
    public readonly router: ReturnType<typeof createImageRouter>;
    constructor() {
        const service = new ImageService();
        this.controller = new ImageController(service);
        this.router = createImageRouter(this.controller);
    }
};

export default ImageContainer;