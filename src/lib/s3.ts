import { S3 } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

const AWS_REGION = "us-east-2";

const s3 = new S3({
  region: AWS_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_S3_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToS3(
  file: File
): Promise<{ file_key: string; file_name: string }> {
  try {
    const sanitizedFileName = file.name.replace(/\s/g, "_");

    const file_key = `uploads/${Date.now()}/${sanitizedFileName}`;

    const params = {
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Key: file_key,
      Body: file,
    };

    const upload = new Upload({
      client: s3,
      params: params,
    });

    upload.on("httpUploadProgress", (progress) => {
      if (
        typeof progress.loaded === "number" &&
        typeof progress.total === "number"
      ) {
        const percentage = ((progress.loaded / progress.total) * 100).toFixed(
          2
        );
        console.log(`Upload progress: ${percentage}%`);
      } else {
        console.error(
          "Progress event received without loaded or total values:",
          progress
        );
      }
    });

    await upload.done();

    return {
      file_key,
      file_name: file.name,
    };
  } catch (error) {
    console.error("Error uploading file: ", error);
    throw new Error("Failed to upload file to S3");
  }
}

export function getS3Url(file_key: string) {
  const url = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.us-east-2.amazonaws.com/${file_key}`;
  return url;
}
