import { MAX_IMAGE_SIZE_MB, SUPPORTED_IMAGE_TYPES } from "@/types/image";

const BYTES_PER_MB = 1024 * 1024;

export function validateImageFile(file: File): string | null {
  if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
    return "صيغة الملف غير مدعومة. يرجى رفع صورة من نوع JPG أو PNG أو WEBP.";
  }

  const maxBytes = MAX_IMAGE_SIZE_MB * BYTES_PER_MB;
  if (file.size > maxBytes) {
    return `حجم الملف كبير. الحد الأقصى المسموح هو ${MAX_IMAGE_SIZE_MB} ميجابايت.`;
  }

  return null;
}
