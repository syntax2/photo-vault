import { useState } from "react";

export const UploadButton = () => {
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files?.length) return;

    setUploading(true);

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      // Refresh the image grid or show success message
    } catch (error) {
      console.error("Upload error:", error);
      // Show error message to user
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mb-4">
      <label className="relative inline-block">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
        <span className="btn bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer">
          {uploading ? "Uploading..." : "Upload Photos"}
        </span>
      </label>
    </div>
  );
};
