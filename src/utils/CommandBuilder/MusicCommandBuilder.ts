import { QueryType } from "discord-player";

import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Command, CommandExecute, CommandData, CommandResolve } from "../../commands/Command";

export class MusicCommandBuilder {
    builder: CommandData

    execute?: CommandExecute;
    resolve?: CommandResolve;

    constructor(name: string, description: string) {
        this.builder = new SlashCommandBuilder()
            .setName(name)
            .setDescription(description);
    }

    addQueryOption(required: boolean = true): MusicCommandBuilder {
        if (!(this.builder instanceof SlashCommandBuilder)) throw new Error("Incompatible type " + typeof this.builder);
        this.builder = this.builder
            .addStringOption(option =>
                option
                    .setName('q')
                    .setDescription("url/query/search")
                    .setMaxLength(100)
                    .setRequired(required));
        return this;
    }

    addQueryTypeOption(): MusicCommandBuilder {
        if (!(this.builder instanceof SlashCommandBuilder)) throw new Error("Incompatible type " + typeof this.builder);
        const queryTypes = Object.keys(QueryType).filter((item) => isNaN(Number(item)));
        const choices = queryTypes.map((t) => ({ name: t, value: t }));

        this.builder = this.builder
            .addStringOption(option =>
                option.setName('querytype')
                    .setDescription('discord-player:QueryType')
                    .addChoices(...choices));

        return this;
    }

    addFunction(f: CommandExecute) {
        this.execute = f;
        return this;
    }

    addResolveFunction(f: CommandResolve) {
        this.resolve = f;
        return this;
    }

    build(): Command {
        this.validate();
        return {
            data: this.builder,
            execute: this.execute!,
        }
    }

    private validate(): void {
        if (this.execute == null) throw Error("Builder is not valid. Missing function.");
    }
}
