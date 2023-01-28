import { debug } from "console";
import winston, { createLogger, format, Logger, transports, addColors } from "winston";

const LOG_LEVEL = "debug";

const customLevels = {
    levels: {
        emerg: 0,
        alert: 1,
        crit: 2,
        error: 3,
        warning: 4,
        notice: 5,
        info: 6,
        debug: 7,
        verbose: 8,
        trace: 9,
    },
    colors: {
        emerg: 'magenta',
        alert: 'magenta',
        crit: 'magenta',
        error: 'red',
        warning: 'yellow',
        notice: 'cyan',
        info: 'white',
        debug: 'green',
        verbose: 'blue',
        trace: 'grey',
    }
}


const logger = createLogger({
    level: LOG_LEVEL,
    levels: customLevels.levels,
    transports: [new transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    })]
});

addColors(customLevels.colors);
export { logger }
