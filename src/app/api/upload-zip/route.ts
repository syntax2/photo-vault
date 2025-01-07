import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import JSZip from "jszip";
import { s3Config } from "@/lib/s3-config";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const zipFile = formData.get("zipFile") as File;

    if (!zipFile) {
      return NextResponse.json(
        { error: "No zip file provided" },
        { status: 400 }
      );
    }

    // Read the zip file
    const zipBuffer = await zipFile.arrayBuffer();
    const zip = await JSZip.loadAsync(zipBuffer);

    // Initialize S3 client
    const s3Client = new S3Client(s3Config);

    // Process each file in the zip
    const uploadPromises: any[] = [];

    zip.forEach((relativePath, zipEntry) => {
      // Skip directories and non-image files
      if (zipEntry.dir || !relativePath.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        return;
      }

      const uploadPromise = zipEntry
        .async("arraybuffer")
        .then(async (content) => {
          const command = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME!,
            Key: `photos/${relativePath}`,
            Body: Buffer.from(content),
            ContentType: getContentType(relativePath),
          });

          return s3Client.send(command);
        });

      uploadPromises.push(uploadPromise);
    });

    // Wait for all uploads to complete
    await Promise.all(uploadPromises);

    return NextResponse.json({
      success: true,
      message: "Files uploaded successfully",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to process and upload files" },
      { status: 500 }
    );
  }
}

function getContentType(fileName: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
  };
  return mimeTypes[extension || ""] || "application/octet-stream";
}
