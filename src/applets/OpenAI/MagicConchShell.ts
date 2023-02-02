
import * as dotenv from "dotenv";
import { logger as parent, safeStringify, toObject } from "../../common/Logger";
import { Configuration, CreateCompletionRequest, ListModelsResponse, OpenAIApi } from "openai";
import { AxiosResponse } from "axios";
import { Message } from "discord.js";

dotenv.config();
const { OPENAI_KEY } = process.env;

const logger = parent.child({ label: "OpenAI" })

interface LimitedCreateCompletionRequest extends Omit<CreateCompletionRequest, "model"> {
    model?: "text-babbage-001" | "text-curie-001"
}

export class MagicConchShell {
    api: OpenAIApi;
    default_model: string;

    constructor(options?: { key?: string | undefined, model?: string }) {
        const key = options?.key ?? OPENAI_KEY;
        this.default_model = options?.model! ?? "text-babbage-001";
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
            max_tokens: 50,
            ...options,
        };
        const res = await this.api.createCompletion(req);
        raiseForStatus(res);
        logger.notice(`Text completion {tokens=${res.data.usage?.total_tokens}, user=${req.user}, model=${res.data.model}}`, { prompt: options.prompt, ...res.data });
        return res.data.choices[0].text!;
    }

    public async ask(message: Message<boolean> | { text: string, user: string }) {
        let quotedQuestion: string
        let username: string;

        if (message instanceof Message<boolean>) {
            quotedQuestion = `"${message.content}"`;
            username = message.author.username;
        } else {
            quotedQuestion = `"${message.text}"`;
            username = message.user;
        }

        // FIXME
        quotedQuestion = quotedQuestion.substring(0, 300);

        const random = async (question: string, user: string): Promise<string> => {
            if (Math.random() < 0.1) {
                const prompt = [question, "Answer eloquently and poetically with 150 words."].join("\n");
                return await this.complete({ prompt: prompt, user: user, model: "text-curie-001", max_tokens: 200 });
            }

            else {
                const manner = ["evasive", "supportive", "rejective", "stupid"]
                const prompt = [question, `Answer in 5 words in a ${manner[Math.floor(Math.random() * manner.length)]} manner.`].join("\n");
                return await this.complete({ prompt: prompt, user: user });
            }
        }

        return (await random(quotedQuestion, username)).replaceAll("!", ".").trim();
    }
}

function raiseForStatus(res: AxiosResponse<any, any>) {
    if (res.status != 200) {
        throw new Error(`HTTPError {status=${res.status}, statusText:${res.statusText}`)
    }
}

export const conch = new MagicConchShell();
