import { SlashGifMessageCommand } from "../../templates/GifMessage";


export default new SlashGifMessageCommand({
    name: "feed",
    description: "Feed someone",
    query: "anime feed food",
    messageWithPlaceholder: "**ACTOR** feeds **TARGET**",
});
