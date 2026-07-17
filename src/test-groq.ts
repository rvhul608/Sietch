import "dotenv/config";
import { GroqService } from "./shared/groq.service.js";

async function main() {
  const groq = new GroqService();

  const response = await groq.chat(
    "Say hello in one sentence."
  );

  console.log(response);
}

main();