"use client";

import { MAX_IMAGE_SIZE_MB } from "@/types/image";

type ImageUploaderProps = {
  onFileSelected: (file: File) => void;
};

export function ImageUploader({ onFileSelected }: ImageUploaderProps) {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    onFileSelected(selectedFile);
    event.target.value = "";
  };

  return (
    <div className="uploaderCard">
      <label htmlFor="imageUpload" className="uploaderLabel">
        رفع صورة
      </label>
      <input
        id="imageUpload"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleInputChange}
        className="uploaderInput"
      />
      <p className="inputHint">
        الصيغ المدعومة: JPG, PNG, WEBP (حد أقصى {MAX_IMAGE_SIZE_MB}MB)
      </p>
    </div>
  );
}
