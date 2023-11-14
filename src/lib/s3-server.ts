"use server";
import { S3 } from "@aws-sdk/client-s3";
import fs from "fs";

export async function downloadFromS3(file_key: string): Promise<string> {
  const s3 = new S3({
    region: "us-east-2",
    credentials: {
      accessKeyId: process.env.NEXT_PUBLIC_AWS_S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.NEXT_PUBLIC_AWS_S3_SECRET_ACCESS_KEY!,
    },
  });
  const params = {
    Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
    Key: file_key,
  };
 
  try {
    const obj = await s3.getObject(params);
    const file_name = `/tmp/justiceiq-${Date.now().toString()}.pdf`;
 
    if (obj.Body instanceof require("stream").Readable) {
      const file = fs.createWriteStream(file_name);
      await new Promise((resolve, reject) => {
        file.on("open", function () {
          (obj.Body as any)?.pipe(file);
        });
 
        file.on("finish", function () {
          resolve(file_name);
        });
 
        file.on("error", function (err) {
          reject(err);
        });
      });
      return file_name;
    } else {
      throw new Error("Body is not a readable stream");
    }
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
 }
 
