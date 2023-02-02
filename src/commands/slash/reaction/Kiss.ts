import { SlashGifMessageCommand } from "../../templates/GifMessage";


export default new SlashGifMessageCommand({
    name: "kiss",
    description: "Kiss someone",
    query: "anime kiss",
    messageWithPlaceholder: "**ACTOR** kissed **TARGET**",
});
