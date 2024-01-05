import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { loadS3IntoPinecone } from "@/lib/pinecone";
import { getS3Url } from "@/lib/s3";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

interface ChatCountResult {
  totalChats: number;
}

// api to create chat
export async function POST(req: Request, res: Response) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { file_key, file_name } = body;

    console.log("loading s3 into pinecone...");
    await loadS3IntoPinecone(file_key);

    // Count the number of existing chats for this user
    const userChatsCountResult = await db
      .select({ totalChats: sql`COUNT(*)` })
      .from(chats)
      .where(eq(chats.userId, userId))
      .execute();

    const userChatsCount = (userChatsCountResult as ChatCountResult[])[0]
      .totalChats;
    const newUserChatNumber = userChatsCount + 1;


    const chatInsertResult = await db
      .insert(chats)
      .values({
        fileKey: file_key,
        pdfName: file_name,
        pdfUrl: getS3Url(file_key),
        userId,
        userChatNumber: newUserChatNumber,
      })
      .returning({ id: chats.id, userChatNumber: chats.userChatNumber })
      .execute();

    return NextResponse.json(
      { chat_id: chatInsertResult[0].id, user_chat_number: newUserChatNumber },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
