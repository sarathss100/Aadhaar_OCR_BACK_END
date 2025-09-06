import { Router } from "express";
import ImageContainer from "./ImageContainer";

const apiV1Router = Router();

const imagesContainer = new ImageContainer();

apiV1Router.use('/images', imagesContainer.router);

export default apiV1Router;