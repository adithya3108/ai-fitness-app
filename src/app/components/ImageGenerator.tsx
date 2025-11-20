"use client";

import React from "react";

type ImageGeneratorProps = {
  open: boolean;
  title: string;
  imageUrl: string | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
};

const ImageGenerator: React.FC<ImageGeneratorProps> = ({
  open,
  title,
  imageUrl,
  loading,
  error,
  onClose,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
        >
          ✕
        </button>

        <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">
          {title}
        </h3>

        {loading && (
          <p className="mb-3 text-sm text-gray-500 dark:text-gray-300">
            Generating image...
          </p>
        )}

        {error && (
          <p className="mb-3 text-sm text-red-500">
            {error}
          </p>
        )}

        {imageUrl && (
          <img
            src={imageUrl}
            alt={title}
            className="h-48 w-auto rounded-lg object-contain shadow"
          />
        )}

        {!loading && !imageUrl && !error && (
          <p className="text-sm text-gray-500 dark:text-gray-300">
            No image available.
          </p>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;
