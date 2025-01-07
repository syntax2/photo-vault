import JSZip from "jszip";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Config } from "@/lib/s3-config";

interface FileProgress {
  fileName: string;
  status: "pending" | "uploading" | "completed" | "failed";
  progress: number;
}

export class ZipHandler {
  private s3Client: S3Client;
  private onProgress: (progress: FileProgress[]) => void;
  private fileProgress: FileProgress[] = [];

  constructor(progressCallback: (progress: FileProgress[]) => void) {
    this.s3Client = new S3Client(s3Config);
    this.onProgress = progressCallback;
  }

  private updateProgress(
    fileName: string,
    status: FileProgress["status"],
    progress: number
  ) {
    const existingIndex = this.fileProgress.findIndex(
      (f) => f.fileName === fileName
    );

    if (existingIndex !== -1) {
      this.fileProgress[existingIndex] = { fileName, status, progress };
    } else {
      this.fileProgress.push({ fileName, status, progress });
    }

    this.onProgress([...this.fileProgress]);
  }

  async processZipFile(file: File): Promise<void> {
    try {
      const zip = new JSZip();

      // Read the zip file
      const zipContent = await zip.loadAsync(file);

      // Process each file in the zip
      const entries = Object.entries(zipContent.files);

      for (const [filePath, zipEntry] of entries) {
        // Skip directories
        if (zipEntry.dir) continue;

        // Skip non-image files
        if (!filePath.match(/\.(jpg|jpeg|png|gif|webp)$/i)) continue;

        this.updateProgress(filePath, "pending", 0);

        try {
          // Get file content as ArrayBuffer
          const content = await zipEntry.async("arraybuffer");

          // Upload to S3
          await this.uploadToS3(filePath, content);

          this.updateProgress(filePath, "completed", 100);
        } catch (error) {
          console.error(`Failed to process ${filePath}:`, error);
          this.updateProgress(filePath, "failed", 0);
        }
      }
    } catch (error) {
      console.error("Failed to process zip file:", error);
      throw error;
    }
  }

  private async uploadToS3(
    fileName: string,
    content: ArrayBuffer
  ): Promise<void> {
    try {
      this.updateProgress(fileName, "uploading", 50);

      const command = new PutObjectCommand({
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
        Key: `takeout/${fileName}`,
        Body: Buffer.from(content),
        ContentType: this.getContentType(fileName),
      });

      await this.s3Client.send(command);

      this.updateProgress(fileName, "completed", 100);
    } catch (error) {
      console.error(`Failed to upload ${fileName}:`, error);
      this.updateProgress(fileName, "failed", 0);
      throw error;
    }
  }

  private getContentType(fileName: string): string {
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
}
