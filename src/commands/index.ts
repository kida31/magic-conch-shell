import * as fs from "fs";
import * as path from "path";
import { logger as parentLogger } from "../common/logger";
import { Command, isCommand } from "./command";


let logger = parentLogger.child({ label: "CommandIndex" })

const ROOT_DIR = __dirname;
const SLASH_DIR = ROOT_DIR + "/slash";
const CTX_DIR = ROOT_DIR + "/usercontextmenu";
const _cache: { [key: string]: any[] } = {}


function _loadAll(dir: string) {
    logger.info("Collecting commands in " + dir);

    function readDir(dir: string): Command[] {
        const commands: Command[] = []

        for (const filename of fs.readdirSync(dir)) {
            const file = path.join(dir, filename);
            logger.debug(`Read file ${file}}`);
            if (file.endsWith(".js") || file.endsWith(".ts")) {
                try {
                    let cmd = require(file);
                    cmd = cmd.default ?? cmd;
                    if (isCommand(cmd)) {
                        commands.push(cmd);
                        logger.info(`Found command in '${filename}'`)
                    } else {
                        logger.debug(`No command in '${filename}'`);
                    }
                } catch (e) {
                    logger.warning(`Failed to read '${file}'`);
                    if (e instanceof Error) {
                        logger.warning(e.stack);
                        logger.warning(e.message);
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

    getAllSlashCommands: function (): Command[] {
        return loadAndCache(SLASH_DIR);
    },

    getAllUserContextMenuCommands: function (): Command[] {
        return loadAndCache(CTX_DIR);
    },
}
