import { useState, useEffect } from "react";
import Image from "next/image";

interface Photo {
  id: string;
  url: string;
  filename: string;
}

export const ImageGrid = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await fetch("/api/photos");
        const data = await response.json();
        setPhotos(data.photos);
      } catch (error) {
        console.error("Failed to fetch photos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {photos.map((photo) => (
        <div
          key={photo.id}
          className="relative aspect-square overflow-hidden rounded-lg hover:opacity-90 transition-opacity"
        >
          <Image
            src={photo.url}
            alt={photo.filename}
            fill
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
};
