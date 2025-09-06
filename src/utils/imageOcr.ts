import path from "path";
import sharp from 'sharp';
import { createWorker, PSM } from 'tesseract.js';
import fs from 'fs';

const preprocessImage = async function (imagePath: string): Promise<string> {
    try {
        const outputPath = imagePath.replace(path.extname(imagePath), '_processed.png');

        await sharp(imagePath) 
            .resize(1200, null, { withoutEnlargement: false, fit: 'inside' })
            .grayscale()
            .normalize()
            .sharpen()
            .png({ quality: 100 })
            .toFile(outputPath);

        return outputPath;
    } catch (error) {
        // eslint-disable-next-line no-console
        console.log(`Image preprocessing failed:`, error);
        return imagePath;
    }
};

const extractTextFromImage = async function (imagePath: string): Promise<string> {
    let processedImagePath = imagePath;
    try {
        processedImagePath = await preprocessImage(imagePath);

        const worker = await createWorker('eng', 1, {
            logger: text => {
                if (text.status === 'recognizing text') {
                    // eslint-disable-next-line no-console
                    console.log(`OCR Progress: ${Math.round(text.progress * 100)}%`);
                }
            }
        });

        await worker.setParameters({
            tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,/-:()@',
            tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
            preserve_interword_spaces: '1',
        });

        const { data: { text, confidence }} = await worker.recognize(processedImagePath);

        if (confidence < 30) {
            // eslint-disable-next-line no-console
            console.warn(`Low OCR confidence, results may be unreliable`);
        }

        await worker.terminate();

        if (processedImagePath !== imagePath) {
            try {
                fs.unlinkSync(processedImagePath);
            } catch (cleanupError) {
                // eslint-disable-next-line no-console
                console.warn(`Failed to cleanup processed image: `, cleanupError);
            }
        }

        return text;
    } catch (error) {
        if (processedImagePath !== imagePath) {
            try {
                fs.unlinkSync(processedImagePath);
            } catch (cleanupError) {
                // eslint-disable-next-line no-console
                console.warn(`Faild to clearnup processed image: `, cleanupError)
            }
        }

        throw new Error(`Failed to extract text from the image : ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export default extractTextFromImage;