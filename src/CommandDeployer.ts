import { REST, Routes } from "discord.js";
import * as dotenv from "dotenv";
import { DeployableData } from "./commands/Command";
import { logger as parent } from "./common/Logger";

const logger = parent.child({ label: "Deployment" })

dotenv.config();
const {
    CLIENT_ID: clientId,
    GUILD_ID,
    DEV_GUILD_ID,
    TOKEN: token
} = process.env;

export async function deployData(cmdJson: DeployableData[]) {
    await _internal_deploy(cmdJson, GUILD_ID!);
    await _internal_deploy(cmdJson, DEV_GUILD_ID!);
}

async function _internal_deploy(cmdJson: DeployableData[], guildId: string) {
    if (!clientId || !guildId || !token) throw new Error("Missing environment variables")
    const rest = new REST({ version: "10" }).setToken(token);
    try {
        logger.notice(`Started refreshing ${cmdJson.length} application (/) commands.`);
        const response = await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: cmdJson },);
        logger.notice(`Successfully reloaded ${(response as []).length} application (/) commands.`);
    } catch (error) {
        logger.error("Deployment may have failed", error);
    }
}
