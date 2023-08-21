import { ChannelType, Client, Guild, Channel, GuildChannel, GuildBasedChannel } from "discord.js";
import { NotFoundError } from "../common/error";

export function getGuild(client: Client, guildId: string): Guild {
    const guild = client.guilds.cache.get(guildId);
    if (guild == null) {
        throw new NotFoundError("Could not resolve guild id " + guildId);
    }
    return guild;
}

export async function fetchChannel(client: Client, channelId: string): Promise<GuildBasedChannel> {
    const channel = (await client.channels.fetch(channelId)) as GuildBasedChannel;
    if (channel == null) {
        throw new NotFoundError("Could n ot resolve channel id " + channelId);
    }
    return channel;
}

export function getVoiceChannels(client: Client, guildId: string) {
    const guild = getGuild(client, guildId);
    const channels = guild.channels.cache;
    return channels.filter(c => c.type == ChannelType.GuildVoice);
}