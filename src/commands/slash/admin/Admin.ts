import { CacheType, ChatInputCommandInteraction, ClientPresence, Interaction, Presence, PresenceStatusData, PresenceUpdateStatus, SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";
import { Command } from "../../command";
import { logger as parent } from "../../../common/logger";
import { GenericReply } from "../../../messages/Common";
import { conch, MagicConchShell } from "../../../applets/open-ai/MagicConchShell";

const logger = parent.child({ label: "admin" })

class AdminCommand implements Command {
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
                    )))
        .addSubcommand(subcommand => subcommand
            .setName("model")
            .setDescription("Get or set the current AI model")
            .addStringOption(option => option
                .setName("modelid")
                .setDescription("OpenAi's ChatGPT models")
                .addChoices(
                    { name: "text-babbage-001", value: "text-babbage-001" },
                    { name: "text-curie-001", value: "text-curie-001" },
                    { name: "text-ada-001", value: "text-ada-001" },
                    { name: "text-davinci-003", value: "text-davinci-003" }
                )));

    async execute(interaction: Interaction<CacheType>) {
        if (!interaction.isChatInputCommand()) return;

        logger.warning("?", interaction.options)

        if (interaction.options.getSubcommand() == "name") {
            await name(interaction);
        } else if (interaction.options.getSubcommand() == "status") {
            await status(interaction);
        } else if (interaction.options.getSubcommand() == "model") {
            await model(interaction);
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
        let info: Map<string, string> = new Map();

        info.set("status", interaction.client.user.presence.status);
        info.set("ai model", conch.default_model);

        const text = Array
            .from(info.entries())
            .map(([k, v]) => k + "=" + v)
            .join("\n");

        logger.warning(text + info.size,);
        await interaction.reply({ ephemeral: true, content: "```\n" + text + "\n```" });
    }
}

const model: SubFunc = async function (interaction) {
    const m = interaction.options.getString("modelid") ?? null;
    if (m) {
        conch.default_model = m;
        await interaction.reply({ ephemeral: true, content: `Now using \`${conch.default_model}\`` })
    } else {
        await interaction.reply({ ephemeral: true, content: `Currently using \`${conch.default_model}\`` })
    }
}

const templaet: SubFunc = async function (interaction) {

}
