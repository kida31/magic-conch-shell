import {Command, CommandCategory, CommandContext, isMessage} from "../command";
import {DiscordPlayerAction} from "../../music/discord-player-action";
import {ExtendedClient} from "../../core/extended-client";
import {DEFAULT_COLORS, SKIPPED} from "./messages";
import {Interaction} from "discord.js";

export default class SkipCommand implements Command {
    name = "skip";
    category: CommandCategory = "Music";

    async execute(context: CommandContext) {
        const music = new DiscordPlayerAction(context);
        await music.skipSong();

        const client = context.client as ExtendedClient;
        await client.reply.send(context as Interaction, {text: SKIPPED, color: DEFAULT_COLORS.OK})
    }
}