import { OpenAI } from "openai";


const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY!,
});

export async function getEmbeddings(text: string) {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text.replace(/\n/g, ""),
    });

    console.log("response from getEmbeddings function...:", response);
    return response.data[0].embedding;
  } catch (error) {
    console.log("error calling openai embeddings api", error);
  }
}
