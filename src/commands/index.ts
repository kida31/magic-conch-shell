import * as fs from "fs";
import * as path from "path";
import { logger } from "../common/logger";
import { Command, isCommand } from "./Command";

const commands: Command[] = [];

function _loadAll() {
    logger.notice("Collecting commands...");

    const root = __dirname;
    // Grab all the command files from the commands directory you created earlier
    const readDir = (dir: string) => fs.readdirSync(dir).forEach(filename => {
        const file = path.join(dir, filename);

        logger.debug(`[ReadDir] ${file}}`);
        if (file.endsWith(".js") || file.endsWith(".ts")) {
            try {
                let cmd = require(file);
                cmd = cmd.default ?? cmd;
                if (isCommand(cmd)) {
                    commands.push(cmd);
                    logger.notice(`Registered command '${cmd.data.name}'`)
                } else {
                    logger.info(`Not a command '${filename}'`);
                }

            } catch (e) {
                logger.warning(`Failed to read '${file}'`);
                if (e instanceof Error) {
                    logger.error(e.stack);
                    logger.error(e.message);
                }
            }
        } else if (fs.statSync(file).isDirectory()) {
            readDir(file);
        }
    });

    readDir(root);
}

export function getAll(): Command[] {
    if (commands.length == 0) {
        _loadAll();
    }
    return commands;
}

export function getAllJsonData(): any[] {
    if (commands.length == 0) {
        _loadAll();
    }
    return commands.map(cmd => cmd.data.toJSON());
}
