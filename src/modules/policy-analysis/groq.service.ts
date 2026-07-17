import Groq from "groq-sdk";
import { POLICY_ANALYZER_PROMPT } from "./prompts.js";

export class GroqService {

    private groq = new Groq({
        apiKey: process.env.GROQ_API_KEY
    });

    async analyzePolicy(policyText: string): Promise<string> {

        const response = await this.groq.chat.completions.create({

            model: "llama-3.3-70b-versatile",

            messages: [

                {
                    role: "system",
                    content: POLICY_ANALYZER_PROMPT
                },

                {
                    role: "user",
                    content: policyText
                }

            ],

            temperature: 0

        });

        return response.choices[0].message.content ?? "";
    }

}