import { Interaction, CacheType, InteractionType, StringSelectMenuInteraction } from "discord.js";
import { Command, CommandResolution, SelectMenuCommand } from "src/commands/Command";

type InitialInteraction = Interaction<CacheType>;
type ResponseInteraction = StringSelectMenuInteraction<CacheType>;

class MenuInteractionHandler {
    ongoingInteractions: Map<string, CommandResolution> = new Map();

    async registerInteraction(interaction: InitialInteraction, callback: CommandResolution): Promise<string> {
        const customId = this.getCustomId(interaction);
        this.ongoingInteractions.set(customId, callback);
        return customId;
    }

    async resolveInteraction(response: ResponseInteraction) {
        const customId = this.getCustomId(response);
        const callback = this.ongoingInteractions.get(customId);
        if (callback) {
            await callback(response);
            this.ongoingInteractions.delete(customId);
        }
    }

    getCustomId(obj: any): string {
        return (obj as Interaction).user.id;
    }
}


export default new MenuInteractionHandler();
