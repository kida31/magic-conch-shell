

/** 
 * Prompt shorthands for open-ai chat gpt
*/
export class SystemPromptTemplate {
    static pretendToBe(name: string) /*: ((series: string) => string)*/ {
        const BASE_TEXT = "I want you to act like {character} from {series}. " +
            "I want you to respond and answer like {character} using the tone, manner and vocabulary {character} would use. " +
            "Do not write any explanations. Only answer like {character}. You must know all of the knowledge of {character}."
        return {
            from(series: string): string {
                return BASE_TEXT.replaceAll("{character}", name).replaceAll("{series}", series);
            }
        }
    };

    static pretend2be(character: string, who?: string) {
        return `I want you to act like ${character}${who ? ", " + who : ""}.` +
            `I want you to respond and answer like {character} using the tone, manner and vocabulary ${character} would use. ` +
            `Do not write any explanations. Only answer like ${character}. You must know all of the knowledge of ${character}.`
    }


    static withMusicListener(prompt: string) {
        return "Answer really specifically in case of certain prompts:\n" +
            "When the user allows you to play music, append meta information in this form `[[play;<title with artist>]]` at the end of your message.\n" +
            "When asked to skip a song, give a confirmation and append meta information `[[skip]]`.\n" +
            prompt;
    }
}

