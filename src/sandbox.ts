import { Jarvis} from "./applets/OpenAI/chatbot";


(async function () {
    console.log(await Jarvis.chat("I love this song.", "Dan"));
    console.log(await Jarvis.read("It's highway to hell!", "Dan"));
    console.log(await Jarvis.chat("Oh, who is the artist?", "Mark"));
    console.log(await Jarvis.chat("Give me the youtube link for this song.", "Mark"));
    console.log(await Jarvis.chat("Who are you talking to?", "TonyStark"));
    console.log(await Jarvis.chat("What did you send Mark?", "TonyStark"));
})();
