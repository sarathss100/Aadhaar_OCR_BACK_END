/* eslint-disable no-console */
import app from './app';

const PORT: number = parseInt(process.env.PORT || '5000', 10);

(async function () {
    try {
        const server = app.listen(PORT, () => {
            console.log(`Server Successfully start on PORT ${PORT}`);
        });

        server.on('error', (error) => {
            console.error(`Server failtd to start on PORT ${PORT}:`, error.message);
            process.exit(1);
        });

        process.on('SIGINT', async () => {
            console.log(`Shutting down the application`);
            process.exit(0);
        });
    } catch (error) {
        console.error(`Some thing went wrong: `, error);
        process.exit(1);
    }
})();