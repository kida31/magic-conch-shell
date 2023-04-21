/**
 * Collection of simple gif message commands
 */
import {Command, CommandCategory, CommandContext, isInteraction, isMessage, Jsonable} from "./command";
import {EmbedTemplates} from "../templates/builder-templates";
import {APIInteractionDataResolvedGuildMember, APIInteractionGuildMember, GuildMember, User} from "discord.js";

/**
 * Base gif message command.
 *
 * Use keywords `ACTOR` and `TARGET` as replacement for you and the recipient
 */
abstract class GifMessageCommand implements Command {
    abstract name: string;
    abstract description: string;

    abstract gifQuery: string;
    abstract gifMessage: string;

    alias: string[];
    category: CommandCategory;
    data: Jsonable | Jsonable[];

    constructor() {
        this.alias = [];
        this.data = [];
        this.category = "Fun";
    }

    async execute(context: CommandContext): Promise<void> {
        const actor = context.member ?? undefined;
        let target: GuildMember | APIInteractionDataResolvedGuildMember | undefined;

        if (isMessage(context)) {
            target = context.mentions.members?.at(0);
        } else if (isInteraction(context) && context.isChatInputCommand()) {
            target = context.options.getMember("target") ?? undefined;
        }

        let text = this.gifMessage;
        if (actor) text = text.replaceAll("ACTOR", actor.toString());
        if (target) text = text.replaceAll("TARGET", target.toString());

        const embed = await EmbedTemplates.getGifEmbed(text, this.gifQuery);

        if (isMessage(context)) {
            await context.reply({
                embeds: [embed],
            })
        } else if (context.isRepliable() && context.isChatInputCommand()) {
            const mention = context.options.getMentionable("mention", true);

            await context.reply({
                content: mention.toString(),
                embeds: [embed],
            })

        }
    }
}

export default [
    class SlapCommand extends GifMessageCommand {
        name: string = "slap";
        description: string = "Sends a slap";
        gifMessage: string = "ACTOR slapped TARGEt";
        gifQuery: string = "anime slap";
    },


]