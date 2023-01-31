import { SlashCommandBuilder } from "discord.js";
import * as fs from "fs";
import * as path from "path";
import { logger as parentLogger } from "../common/logger";
import { SlashCommand, UserContextMenuCommand, Command, isCommand, SlashCommandData } from "./Command";

let logger = parentLogger.child({ label: "CommandCollector" })

const ROOT_DIR = __dirname;

const commands_cache: Command[] = [];

function _loadAll(dir: string) {
    logger.notice("Collecting commands...");


    function readDir(dir: string): Command[] {
        const commands: Command[] = []

        for (const filename of fs.readdirSync(dir)) {
            const file = path.join(dir, filename);
            logger.log("trace", `Read file ${file}}`);
            if (file.endsWith(".js") || file.endsWith(".ts")) {
                try {
                    let cmd = require(file);
                    cmd = cmd.default ?? cmd;
                    if (isCommand(cmd)) {
                        commands.push(cmd);
                        logger.notice(`Collected command in '${filename}'`)
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
                commands.push(...readDir(file));
            }
        }
        return commands;
    }

    return readDir(dir);
}

export const CommandCollection = {
    getAll(): Command[] {
        if (commands_cache.length == 0) {
            commands_cache.push(..._loadAll(ROOT_DIR));
        }
        return commands_cache;
    },
    getAllJson() {
        return this.getAll().map(cmd => cmd.data.toJSON());
    },
    getSlashCommands() {
        // this.getAll().forEach(c => console.log())
        type keys = keyof SlashCommand;
        console.log(keys);
    }
}
