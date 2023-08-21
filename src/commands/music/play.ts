import { Command, CommandCategory, CommandContext, isMessage } from "../command";
import {DiscordPlayerAction, playQuery} from "../../music/discord-player-action";
import { ExtendedClient } from "../../core/extended-client";

export default class PlayCommand implements Command {
    name = "play";
    category: CommandCategory = "Music";

    async execute(client: ExtendedClient, context: CommandContext) {
        const music = new DiscordPlayerAction(context);
        if (isMessage(context)) {
            const channel = context.member?.voice.channel;
            if (channel) {
                await music.play(channel, context.content);
            }
        }
    }
}