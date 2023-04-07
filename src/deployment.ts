import {REST} from "@discordjs/rest";
import {Routes} from "discord-api-types/v10";
import * as dotenv from "dotenv";
import {DeployableData} from "./commands/command";
import {logger as parent} from "./common/logger";

const logger = parent.child({label: "Deployment"})

dotenv.config();
const {
    CLIENT_ID: clientId,
    GUILD_ID,
    DEV_GUILD_ID,
    TOKEN: token
} = process.env;

export async function deployData(cmdJson: DeployableData[]) {
    await _internal_deploy(cmdJson, GUILD_ID!);
    //await _internal_deploy(cmdJson, DEV_GUILD_ID!);
}

async function _internal_deploy(cmdJson: DeployableData[], guildId: string) {
    if (!clientId) throw new Error("Missing environment clientId");
    if (!guildId) throw new Error("Missing environment guildId");
    if (!token) throw new Error("Missing environment token");
    const rest = new REST({version: "10"}).setToken(token);
    try {
        logger.notice(`Started refreshing ${cmdJson.length} application (/) commands.`);
        const response: any = await rest.put(
            // @ts-ignore
            Routes.applicationGuildCommands(clientId, guildId),
            {body: cmdJson},
        );
        console.log(response);
        logger.notice(`Successfully reloaded ${(response as []).length} application (/) commands.`);
    } catch (error) {
        logger.error("Deployment may have failed", error);
    }
}
