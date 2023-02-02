import * as fs from "fs";
import * as path from "path";
import { logger as parentLogger } from "../common/logger";
import { Command, isCommand, SlashCommand, UserContextMenuCommand } from "./Command";


let logger = parentLogger.child({ label: "CommandIndex" })

const ROOT_DIR = __dirname;
const SLASH_DIR = ROOT_DIR + "/slash";
const CTX_DIR = ROOT_DIR + "/usercontextmenu";
const _cache: { [key: string]: any[] } = {}


function _loadAll(dir: string) {
    logger.notice("Collecting commands in " + dir);

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

function loadAndCache(dir: string): any[] {
    if (!_cache[dir]) _cache[dir] = _loadAll(dir);
    return _cache[dir];
}

export const CommandCollection = {
    getAll(): Command[] {
        return loadAndCache(ROOT_DIR);
    },

    getAllJson() {
        return this.getAll().map(cmd => cmd.data.toJSON());
    },

    getAllSlashCommands: function (): SlashCommand[] {
        return loadAndCache(SLASH_DIR);
    },

    getAllUserContextMenuCommands: function (): UserContextMenuCommand[] {
        return loadAndCache(CTX_DIR);
    },
}
