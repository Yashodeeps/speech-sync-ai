import Anthropic from "@anthropic-ai/sdk";

export async function claude() {
  const anthropic = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY,
  });

  try {
    const message = await anthropic.messages.create({
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content:
            "Suggest 3 debating topics for users who are learning to communicate confidently. The topics should be suitable for debate with Hume AI's empathetic voice model.",
        },
      ],
      model: "claude-3-opus-20240229",
    });

    if (typeof message.content === "string") {
      console.log(message.content);
      const contentString: string = message.content;
      return contentString.split("\n").filter((topic) => topic.trim() !== "");
    } else {
      console.error("Unexpected response format from Claude API");
      return [];
    }
  } catch (error) {
    console.error("Error calling Claude API:", error);
    return [];
  }
}
