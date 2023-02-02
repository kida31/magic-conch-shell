import { StopCommand } from "../../templates/Music";
import { CacheType, ChatInputCommandInteraction, ClientPresence, Interaction, Presence, PresenceStatusData, PresenceUpdateStatus, SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";
import { CommandExecute, SlashCommand, SlashCommandData } from "../../Command";
import { logger as parent } from "../../../common/Logger";
import { GenericReply } from "../../../messages/Common";

const logger = parent.child({ label: "admin" })

class AdminCommand implements SlashCommand {
    data = new SlashCommandBuilder()
        .setName("admin")
        .setDescription("Bot Administration")
        .addSubcommand(subcommand =>
            subcommand
                .setName("name")
                .setDescription("Check or set name of the bot")
                .addStringOption(option => option
                    .setName("set")
                    .setDescription("a new bot name")))
        .addSubcommand(subcommand =>
            subcommand
                .setName("status")
                .setDescription("Check or set bot status")
                .addStringOption(option => option //'online' | 'idle' | 'dnd' | 'invisible';
                    .setName("set")
                    .setDescription("set a status")
                    .addChoices(
                        { name: "Online", value: "online" },
                        { name: "Idle", value: "idle" },
                        { name: "Do not disturb", value: "dnd" },
                        { name: "Invisible", value: "invisible" },
                    )));
    async execute(interaction: Interaction<CacheType>) {
        if (!interaction.isChatInputCommand()) return;

        logger.warning("?", interaction.options)

        if (interaction.options.getSubcommand() == "name") {
            await name(interaction);
        } else if (interaction.options.getSubcommand() == "status") {
            await status(interaction);
        } else if (interaction.options.getSubcommand() == "name") {
        } else if (interaction.options.getSubcommand() == "name") {
        } else if (interaction.options.getSubcommand() == "name") {
        }
    }

    meta?: { name?: string | undefined; description?: string | undefined; category?: string | undefined; } | undefined;
}

export default new AdminCommand();


interface SubFunc {
    (interaction: ChatInputCommandInteraction<CacheType>): Promise<void>;
}

const name: SubFunc = async function (interaction) {
    const newName = interaction.options.getString("set") ?? null;
    if (newName) {
        await interaction.client.user.setUsername(newName);
        await interaction.reply(GenericReply.CONFIRM_QUIET);
    } else {
        await interaction.reply({
            content: `The bot's current name is \`${interaction.client.user.username}\``,
            ephemeral: true
        });
    }
}

const status: SubFunc = async function (interaction) {
    const status: PresenceStatusData = <PresenceStatusData>interaction.options.getString("set") ?? null;
    if (!!status) {
        await interaction.client.user.setStatus(status);
        await interaction.reply(GenericReply.CONFIRM_QUIET);
    } else {
        await interaction.reply({ ephemeral: true, content: interaction.client.user.presence.status })
    }
}

const templaet: SubFunc = async function (interaction) {

}
