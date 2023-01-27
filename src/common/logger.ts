import * as log from "https://deno.land/std/log/mod.ts";
import { Logger, LoggerConfig } from "https://deno.land/std/log/mod.ts";
import { ConsoleHandler } from "https://deno.land/std@0.174.0/log/handlers.ts";

const loggers: { [name: string]: LoggerConfig } = {
    debugLogger: {
        level: "DEBUG",
        handlers: ["default"]
    }
}

const handlers = {
    default: new ConsoleHandler("DEBUG")
}

log.setup({
    handlers,
    loggers
});

export const logger: Logger = log.getLogger();
export const debugLogger: Logger = log.getLogger("debugLogger");
