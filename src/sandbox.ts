import { logger } from "./common/Logger";
import { conch, MagicConchShell } from "./applets/OpenAI/MagicConchShell";

(async () => {
    // const conch = new MagicConchShell();
    await conch.test();
    const a = await conch.ask({ text: "What is life?", user: "me" });
    logger.notice(a, { msg: a })
})();
