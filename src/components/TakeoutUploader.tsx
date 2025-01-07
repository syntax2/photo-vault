import React, { useState } from "react";
import { Upload, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { ZipHandler } from "@/utils/zip-handler";

interface UploadStatus {
  fileName: string;
  status: "pending" | "uploading" | "completed" | "failed";
  progress: number;
}

export default function TakeoutUploader() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatuses, setUploadStatuses] = useState<UploadStatus[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !file.name.endsWith(".zip")) {
      setError("Please select a valid zip file from Google Takeout");
      return;
    }

    setError(null);
    setIsProcessing(true);

    try {
      const zipHandler = new ZipHandler((progress) => {
        setUploadStatuses(progress);
      });

      await zipHandler.processZipFile(file);
    } catch (error) {
      setError("Failed to process the takeout file. Please try again.");
      console.error("Takeout processing error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = (status: UploadStatus["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return (
          <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-blue-500" />
        );
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Import Google Takeout</h2>

      <div className="mb-6">
        <label className="block mb-4 text-gray-700">
          Select your Google Takeout zip file containing your photos
        </label>

        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-xs text-gray-500">Google Takeout ZIP file</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept=".zip"
              onChange={handleFileSelect}
              disabled={isProcessing}
            />
          </label>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {uploadStatuses.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Upload Progress</h3>
          <div className="space-y-3">
            {uploadStatuses.map((status) => (
              <div
                key={status.fileName}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(status.status)}
                  <span className="text-sm truncate max-w-md">
                    {status.fileName}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 rounded-full h-2"
                      style={{ width: `${status.progress}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-14">
                    {status.progress}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
