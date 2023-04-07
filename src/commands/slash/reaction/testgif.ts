import { SlashGifMessageCommand } from "../../templates/GifMessage";


export default new SlashGifMessageCommand({
    name: "show",
    description: "Show something special to someone special",
    query: "anime ecchi",
    messageWithPlaceholder: "**TARGET** saw something good",
});
