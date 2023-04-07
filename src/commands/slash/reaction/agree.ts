import { SlashGifMessageCommand } from "../../templates/GifMessage";


export default new SlashGifMessageCommand({
    name: "agree",
    description: "Show your approval",
    query: "morty im in",
    messageWithPlaceholder: " ",
});
