import { QueryType } from "discord-player";

import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Command, CommandExecution, CommandData, CommandResolution, SelectMenuCommand } from "../../commands/Command";

export class MusicCommandBuilder {
    builder: CommandData

    execute?: CommandExecution;
    resolve?: CommandResolution;

    constructor(name: string, description: string) {
        this.builder = new SlashCommandBuilder()
            .setName(name)
            .setDescription(description);
    }

    addQueryOption(required: boolean = true): MusicCommandBuilder {
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
        const queryTypes = Object.keys(QueryType).filter((item) => isNaN(Number(item)));
        const choices = queryTypes.map((t) => ({ name: t, value: t }));

        this.builder = this.builder
            .addStringOption(option =>
                option.setName('querytype')
                    .setDescription('discord-player:QueryType')
                    .addChoices(...choices));

        return this;
    }

    addFunction(f: CommandExecution) {
        this.execute = f;
        return this;
    }

    addResolveFunction(f: CommandResolution) {
        this.resolve = f;
        return this;
    }

    build(): Command | SelectMenuCommand {
        this.validate();
        if (this.resolve) {
            return {
                data: this.builder,
                execute: this.execute!,
                resolve: this.resolve
            }
        }
        return {
            data: this.builder,
            execute: this.execute!,
        }
    }

    private validate(): void {
        if (this.execute == null) throw Error("Builder is not valid. Missing function.");
    }
}
