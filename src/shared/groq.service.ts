import Groq from "groq-sdk";

export class GroqService {
  private groq: Groq;

  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY!,
      baseURL: process.env.GROQ_BASE_URL!,
    });
  }

  async chat(prompt: string) {
    console.log(
      "Groq API Key Loaded:",
      !!process.env.GROQ_API_KEY
    );

    const response = await this.groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",

      messages: [
        {
          role: "system",
          content:
            "You are an expert insurance policy and healthcare claim analysis assistant.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],

      temperature: 0.2,
    });

    return response.choices[0]?.message?.content ?? "";
  }
}