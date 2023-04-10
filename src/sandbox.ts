import { CacheType, Interaction, Message, MessageReaction, PartialMessageReaction, SlashCommandBuilder } from "discord.js";
import { Command } from "./commands/command";

type messageCreateType = Message<boolean>;
type messageReactionType = MessageReaction | PartialMessageReaction;
type interactionCreateType = Interaction<CacheType>

type genericInput = messageCreateType | interactionCreateType;

const testCmd: Command = {
    get data() {
        return new SlashCommandBuilder();
    },

    execute: function (interaction: Interaction<CacheType>): Promise<void> {
        throw new Error("Function not implemented.");
    }
}