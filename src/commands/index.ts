import { debug } from "console";
import * as fs from "fs";
import * as path from "path";
import { logger } from "../core/logger";
import { Command, isCommand } from "./Command";

const commands: Command[] = [];

export function getAll(): Command[] {
    const root = __dirname;
    // Grab all the command files from the commands directory you created earlier
    const readDir = (dir: string) => fs.readdirSync(dir).forEach(file => {
        file = path.join(dir, file);
        const shortName = "..." + file.substring(file.length - 20);

        if (file.endsWith(".js") || file.endsWith(".ts")) {
            try {
                logger.debug(`[ReadDir] ${shortName}} > import`);
                let cmd = require(file);
                cmd = cmd.default ?? cmd;
                if (isCommand(cmd)) {
                    commands.push(cmd);
                    logger.notice(`Registered command ${cmd.data.name}`)
                } else {
                    throw Error("Not a command");
                }
            } catch (e) {
                logger.warning(`Failed to read '${file}'`);
                logger.warning(e);
            }
        } else if (fs.statSync(file).isDirectory()) {
            logger.debug(`[ReadDir] ${shortName}} > read`);
            readDir(file);
        }
    });

    readDir(root);

    return commands;
}

export function getAllJsonData(): any[] {
    if (commands.length == 0) {
        getAll();
    }
    return commands.map(cmd => cmd.data.toJSON());
}
