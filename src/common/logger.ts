import { CommandInteraction, StringSelectMenuInteraction } from "discord.js";
import { describe } from "node:test";
import { addColors, createLogger, format, transports, Logger } from "winston";

const LOG_LEVEL = "info";

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

addColors(customLevels.colors);


export function safeStringify(obj: any, space?: string | number | undefined) {
    return JSON.stringify(obj, (key, value) => typeof value === 'bigint' ? value.toString() : value, space)
}

export function toObject(obj: any) {
    return JSON.parse(JSON.stringify(obj, (key, value) =>
        typeof value === 'bigint'
            ? value.toString()
            : value // return everything else unchanged
    ));
}

const commonFormat = format.combine(
    format.json(),
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.printf(({ level, message, timestamp, label, ...rest }) => {
        let text = `${timestamp} [${label ?? "-----"}] ${level.toUpperCase()} ${message}`;
        if (!!Object.keys(rest).length) text += ", " + safeStringify(rest)
        return text
    }))

const logger = createLogger({
    level: LOG_LEVEL,
    levels: customLevels.levels,
    transports: [
        new transports.Console({
            level: LOG_LEVEL,
            format: format.combine(
                format.json(),
                format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
                format.printf(({ level, message, timestamp, label, ...rest }) => {
                    let text = `${timestamp} [${label ?? "-----"}] ${level.toUpperCase()} ${message}`;
                    if (!!Object.keys(rest).length) text += "\n" + safeStringify(rest)
                    return text
                }),
                format.colorize({ all: true }),
            )
        }),
        new transports.File({
            filename: "logs/error.log",
            level: "error",
            format: commonFormat
        }),
        new transports.File({
            filename: "logs/notice.log",
            level: "notice",
            format: commonFormat
        }),
        new transports.File({
            filename: "logs/info.log",
            level: "info",
            format: commonFormat
        }),
        new transports.File({
            filename: "logs/trace.log",
            level: "trace",
            format: commonFormat
        }),
    ]
});


function LoggerWithLabel(label: string, level?:string): Logger {
    const child = logger.child({ label: label });
    child.level = level ?? LOG_LEVEL;
    return child;
}

export {
    logger,
    LoggerWithLabel
};


type LoggableInteraction = CommandInteraction | StringSelectMenuInteraction;
interface InteractionLog {
    id: string,
    user: {
        name: string,
        id: string
    },
    commandName?: string,
    customId?: string,
}

export function formatInteraction(interaction: LoggableInteraction): InteractionLog {
    const logObj: InteractionLog = {
        id: interaction.id,
        user: {
            name: interaction.user.username,
            id: interaction.user.id
        },
    }

    if (interaction.isCommand()) {
        logObj.commandName = interaction.commandName;
    }

    if (interaction.isAnySelectMenu()) {
        logObj.customId = interaction.customId;
    }

    return logObj;
}


export function LogExecution(logger: Logger, displayName: string, {
    sucesssMessage = 'OK 200',
    errorMessage = 'ERROR 500'
} = {}) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            const startTime = Date.now();

            try {
                const result = await originalMethod.apply(this, args);
                const elapsedTime = Date.now() - startTime;
                logger.info(`${displayName} - ${sucesssMessage} execution_time=${elapsedTime}ms`);
                return result;
            } catch (error) {
                logger.error(`${displayName} - ${errorMessage}`);
                throw error;
            }
        };

        return descriptor;
    }
}

export const LogCommand = (() => {
    const logger = LoggerWithLabel("Command");
    
    return function(displayName: string, { sucesssMessage = 'Ok', errorMessage = 'Error' } = {}) {
        return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
            const originalMethod = descriptor.value;
    
            descriptor.value = async function (...args: any[]) {
                const startTime = Date.now();
    
                try {
                    const result = await originalMethod.apply(this, args);
                    const elapsedTime = Date.now() - startTime;
                    logger.info(`${displayName} - ${sucesssMessage} execution_time=${elapsedTime}ms`);
                    return result;
                } catch (error) {
                    logger.error(`${displayName} - ${errorMessage}`);
                    throw error;
                }
            };
    
            return descriptor;
        }
    }
})();