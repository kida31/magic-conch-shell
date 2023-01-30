import { debug } from "console";
import { Interaction, CacheType, ChatInputCommandInteraction, BaseInteraction, User, CommandInteraction, StringSelectMenuInteraction } from "discord.js";
import winston, { createLogger, format, Logger, transports, addColors, Logform } from "winston";

const LOG_LEVEL = "trace";

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


function safeStringify(obj: any, space?: string | number | undefined) {
    return JSON.stringify(obj, (key, value) => typeof value === 'bigint' ? value.toString() : value, space)
}

const logger = createLogger({
    level: LOG_LEVEL,
    levels: customLevels.levels,
    transports: [new transports.Console({
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
    })]
});

export { logger }

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
