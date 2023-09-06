import { Transform } from 'stream';
import JSONLogFile from '../files/JSONLogFile';
import TextLogFile from '../files/TextLogFile';
import LineExtractor from '../streams/LineExtractor';
import LineParser from '../streams/LineParser';
import { LogFilter } from '../../types';
import logger from '../../logger';
import { pipeline } from 'stream/promises';
import { formatSize } from '../../utils/units';

class TextToJSONLogsAdapter {
    protected transforms: Transform[];

    public constructor(filter?: LogFilter) {
        this.transforms = [
            new LineExtractor(),
            new LineParser({ filter }),
        ];
    }

    public async execute(inputFile: TextLogFile, outputFile: JSONLogFile) {

        // Give user some info regarding
        logger.info(`Reading logs from: '${inputFile.getPath()}'`);
        logger.info(`Writing logs to: '${outputFile.getPath()}'`);

        // Delete existing and create new file
        await outputFile.delete();
        await outputFile.create();

        try {
            // Open array in JSON file
            await outputFile.start();

            // Write filtered parsed logs into JSON file
            await pipeline([
                inputFile.getPipeFrom().getStream(),
                ...this.transforms,
                outputFile.getPipeTo().getStream({ flags: 'a' }),
            ]);

            // Remove last comma, and close array in JSON file
            await outputFile.end();

            // Give user info about files
            logger.info(`Input file size was: ${formatSize(inputFile.getSize())}`);
            logger.info(`Output file size is: ${formatSize(outputFile.getSize())}`);

        } catch (err: any) {
            logger.fatal(`Could not parse app logs: ${err.message}`);

            throw err;
        }
    }
}

export default TextToJSONLogsAdapter;