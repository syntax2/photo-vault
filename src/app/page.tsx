"use client";

import ZipUploader from "@/components/ZipUploader";
// import S3FileList from "@/components/S3FileList";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Photo Storage Manager
        </h1>

        <div className="space-y-8">
          <ZipUploader />
          {/* <S3FileList /> */}
        </div>
      </div>
    </main>
  );
}
