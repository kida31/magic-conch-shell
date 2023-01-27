// noinspection DuplicatedCode

import pino, { transport as _transport } from "pino";

const transport = _transport({
  targets: [{
    // baseline
    level: "info",
    target: "pino-pretty",
  }, {
    level: "trace",
    target: "pino/file",
    options: { destination: "./log-trace.json" },
  }],
});

const logger = pino(transport);

export default logger;
