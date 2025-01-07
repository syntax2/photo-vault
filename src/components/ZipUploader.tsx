import React, { useState } from "react";
import { Upload, Loader2 } from "lucide-react";

export default function ZipUploader() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith(".zip")) {
      setSelectedFile(file);
    } else {
      alert("Please select a valid ZIP file");
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.name.endsWith(".zip")) {
      setSelectedFile(file);
    } else {
      alert("Please drop a valid ZIP file");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("zipFile", selectedFile);

    try {
      const response = await fetch("/api/upload-zip", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      // Reset the state after successful upload
      setSelectedFile(null);
      setProgress(0);
      alert("Upload completed successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center
          ${selectedFile ? "border-green-500 bg-green-50" : "border-gray-300"}
          transition-colors duration-200`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400" />

        {!selectedFile ? (
          <>
            <h3 className="mt-2 text-lg font-medium">
              Drop your ZIP file here
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              or click below to browse
            </p>
          </>
        ) : (
          <h3 className="mt-2 text-lg font-medium text-green-600">
            {selectedFile.name}
          </h3>
        )}

        <div className="mt-4 flex flex-col items-center gap-4">
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".zip"
              onChange={handleFileSelect}
              className="hidden"
            />
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
              {selectedFile ? "Choose Different File" : "Select ZIP File"}
            </span>
          </label>

          {selectedFile && (
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="inline-flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload to S3"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
