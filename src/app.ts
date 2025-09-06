import './config/envConfig/envConfig'; 
import express, { Request, Response } from 'express';
import cors from 'cors';
import router from './routes/routes';

const app = express();

app.use(cors({ 
    origin: process.env.FRONT_END_URL,
    methods: ['GET', 'POST'],
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.get('/', (request: Request, response: Response) => {
    response.status(200).json(`Server is up and Running`);
});

app.use('/api', router);

export default app;