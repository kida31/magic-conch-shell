// Prompt shorthands


export function pretendToBe(name: string) /*: ((series: string) => string)*/ {
    const BASE_TEXT = "I want you to act like {character} from {series}. " +
        "I want you to respond and answer like {character} using the tone, manner and vocabulary {character} would use. " +
        "Do not write any explanations. Only answer like {character}. You must know all of the knowledge of {character}."
    return {
        from(series: string): string {
            return BASE_TEXT.replaceAll("{character}", name).replaceAll("{series}", series);
        }
    }
};

export function pretend2be(character: string, who?: string) {
    return `I want you to act like ${character}${who ? ", " + who : ""}.` +
        `I want you to respond and answer like {character} using the tone, manner and vocabulary ${character} would use. ` +
        `Do not write any explanations. Only answer like ${character}. You must know all of the knowledge of ${character}.`
}
