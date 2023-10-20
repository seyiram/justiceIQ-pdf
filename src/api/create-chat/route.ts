import { NextResponse } from "next/server";

// api to create chat
export async function POST(req: Request, res: Response) {
  try {
    const body = await req.json();
    const { file_key, file_name } = body;
    console.log("From route.ts", file_key, file_name);
    return NextResponse.json({ message: "success" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
