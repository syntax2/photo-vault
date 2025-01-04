import { S3Client } from "@aws-sdk/client-s3";

export const s3Config = {
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  bucketName: process.env.S3_BUCKET_NAME!,
};

// Initialize S3 client
export const s3Client = new S3Client(s3Config);
