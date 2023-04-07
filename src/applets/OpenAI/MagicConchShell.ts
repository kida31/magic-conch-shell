import { logger as parent, safeStringify, toObject } from "../../common/logger";
import { Configuration, CreateCompletionRequest, ListModelsResponse, OpenAIApi } from "openai";
import { AxiosResponse } from "axios";
import { Message, quote } from "discord.js";
import * as dotenv from "dotenv";

dotenv.config();
const { OPENAI_KEY } = process.env;

const logger = parent.child({ label: "OpenAI" })

interface LimitedCreateCompletionRequest extends Omit<CreateCompletionRequest, "model"> {
    model?: "text-ada-001" | "text-babbage-001" | "text-curie-001" | "text-davinci-003"
}

export class MagicConchShell {
    api: OpenAIApi;
    default_model: string;

    constructor(options?: { key?: string | undefined, model?: string }) {
        const key = options?.key ?? OPENAI_KEY;
        this.default_model = options?.model! ?? "text-curie-001";
        this.api = new OpenAIApi(new Configuration({ apiKey: key }));
    }

    async test() {
        const res = await this.api.listModels();
        raiseForStatus(res);
        const models = res.data.data.map(m => m.id);
        logger.notice("TEST\n" + models.filter(id => !id.includes("davinci")).join("\n"));
        if (models.includes(this.default_model)) {
            logger.notice("TEST valid default_model");
        } else {
            logger.error("Unknown default model");
        }
    }

    private async complete(options: LimitedCreateCompletionRequest): Promise<string> {
        const req: CreateCompletionRequest = {
            model: this.default_model,
            max_tokens: 120,
            ...options,
        };

        logger.debug("Request: ", req);
        const res = await this.api.createCompletion(req);
        raiseForStatus(res);
        logger.notice(`Text completion {query=${req.prompt}, tokens=${res.data.usage?.total_tokens}, user=${req.user}, model=${res.data.model}}`, { prompt: options.prompt, ...res.data });
        return res.data.choices[0].text!;
    }

    public async ask(message: Message | { text: string, user: string }) {
        try {
            let quotedQuestion: string
            let username: string;

            if (message instanceof Message) {
                quotedQuestion = `"${message.content.replaceAll(message.client.user.toString(), "").trim()}"`;
                username = message.author.username;
            } else {
                quotedQuestion = `"${message.text}"`;
                username = message.user;
            }

            // FIXME
            quotedQuestion = quotedQuestion.substring(0, 500);

            const random = async (question: string, user: string): Promise<string> => {
                if (Math.random() < 0.2) {
                    const prompt = [question, "Answer eloquently and metaphorically."].join("\n");
                    return await this.complete({ prompt: prompt, user: user, model: "text-davinci-003", max_tokens: 200 });
                } else {
                    const prompt = [question].join("\n");
                    return await this.complete({ prompt: prompt, user: user });
                }
            }

            return (await random(quotedQuestion, username)).replaceAll("!", ".").trim();
            return (await this.complete({ prompt: quotedQuestion, user: username })).replaceAll("!", ".").trim();
        } catch (err) {
            if (err instanceof Error) {
                logger.warning(err.message);
                logger.error("" + err.stack, err);
            }
        }

    }
}

function raiseForStatus(res: AxiosResponse<any, any>) {
    if (res.status != 200) {
        throw new Error(`HTTPError {status=${res.status}, statusText:${res.statusText}`)
    }
}

export const conch = new MagicConchShell();
