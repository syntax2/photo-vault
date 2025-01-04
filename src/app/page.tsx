"use client";

import { useAuth } from "@/hooks/useAuth";
import { ImageGrid } from "@/components/ImageGrid";
import { UploadButton } from "@/components/UploadButton";

export default function Home() {
  const { isAuthenticated, isLoading, login } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl mb-4">Welcome to PhotoVault</h1>
        <button
          onClick={login}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Login with Google
        </button>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl mb-4">Your Photos</h1>
      <UploadButton />
      <ImageGrid />
    </main>
  );
}
