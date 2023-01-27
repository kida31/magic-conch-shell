import fs from "node:fs";

import path from "node:path";

/**
 *  1. Iterate through commands folder
 *  2. If folder, recursive call to 1.
 *  3. If command with 'data' and 'execute' => client.commands.set()
 *  4. else => invalid file warning
 *  */
function iterateDepth(rootDir, delegate) {

    const allFiles = fs.readdirSync(rootDir);
    for (const f of allFiles) {
        const filePath = path.join(rootDir, f);
        if (fs.statSync(filePath).isDirectory()) {
            console.log("[INFO] Step into directory: " + f);
            iterateDepth(filePath, delegate);
        } else {
            delegate(filePath);
        }
    }
}

module.exports = {
    iterateDepth
}