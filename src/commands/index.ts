import * as fs from "fs";
import * as path from "path";
import { logger as parentLogger } from "../common/logger";
import { Command } from "./command";


let logger = parentLogger.child({ label: "CommandIndex" })

const ROOT_DIR = __dirname;


function loadAllWithinFolder(dir: string): Command[] {
    logger.info("Collecting commands in " + dir);

    function readDir(dir: string): Command[] {
        const commandClasses: Command[] = []

        for (const filename of fs.readdirSync(dir)) {
            const file = path.join(dir, filename);
            logger.debug(`Read file ${file}}`);
            if (file.endsWith(".js") || file.endsWith(".ts")) {
                try {
                    commandClasses.push(...classesFromFile(file))
                } catch (e) {
                    logger.warning(`Failed to read '${file}'`);
                    if (e instanceof Error) {
                        logger.warning(e.stack);
                        logger.warning(e.message);
                    }
                }
            } else if (fs.statSync(file).isDirectory()) {
                commandClasses.push(...readDir(file));
            }
        }
        return commandClasses;
    }

    return readDir(dir);
}

function classesFromFile(path: string): Command[] {
    let cmdFile = require(path);
    cmdFile = cmdFile.default ?? cmdFile;
    const cmdClasses = Array.isArray(cmdFile) ? cmdFile : [cmdFile];
    return cmdClasses.filter(c => !!c.prototype).map(c => new c());;
}

export const CommandCollection = {
    fromFolder(subfolder: string): Command[] {
        return loadAllWithinFolder(path.join(ROOT_DIR, subfolder));
    }
}
