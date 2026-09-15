// Unsigned upload directly from the browser — no API secret ever touches the
// client. Admin-only usage is enforced by the AdminGuard around every page
// that imports this; Cloudinary itself has no concept of "who" is uploading.
const CLOUD_NAME = 'nzjzi15x';
const UPLOAD_PRESET = 'hadiyetak_products';

export async function uploadImageToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error?.message || 'فشل رفع الصورة');
  }

  const data = await res.json();
  return data.secure_url as string;
}
