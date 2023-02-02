"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
exports.__esModule = true;
exports.formatInteraction = exports.logger = void 0;
var winston_1 = require("winston");
var LOG_LEVEL = "trace";
var customLevels = {
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
        trace: 9
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
        trace: 'grey'
    }
};
(0, winston_1.addColors)(customLevels.colors);
function safeStringify(obj, space) {
    return JSON.stringify(obj, function (key, value) { return typeof value === 'bigint' ? value.toString() : value; }, space);
}
var logger = (0, winston_1.createLogger)({
    level: LOG_LEVEL,
    levels: customLevels.levels,
    transports: [new winston_1.transports.Console({
            format: winston_1.format.combine(winston_1.format.json(), winston_1.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), winston_1.format.printf(function (_a) {
                var level = _a.level, message = _a.message, timestamp = _a.timestamp, label = _a.label, rest = __rest(_a, ["level", "message", "timestamp", "label"]);
                var text = "".concat(timestamp, " [").concat(label !== null && label !== void 0 ? label : "-----", "] ").concat(level.toUpperCase(), " ").concat(message);
                if (!!Object.keys(rest).length)
                    text += "\n" + safeStringify(rest);
                return text;
            }), winston_1.format.colorize({ all: true }))
        })]
});
exports.logger = logger;
function formatInteraction(interaction) {
    var logObj = {
        id: interaction.id,
        user: {
            name: interaction.user.username,
            id: interaction.user.id
        }
    };
    if (interaction.isCommand()) {
        logObj.commandName = interaction.commandName;
    }
    if (interaction.isAnySelectMenu()) {
        logObj.customId = interaction.customId;
    }
    return logObj;
}
exports.formatInteraction = formatInteraction;
