'use client';

import { useRef, useState } from 'react';
import { uploadImageToCloudinary } from '@/lib/cloudinary';

export function ImageUploader({
  onUploaded,
  label = 'رفع صورة',
  multiple = true,
}: {
  onUploaded: (url: string) => void;
  label?: string;
  multiple?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progressText, setProgressText] = useState('');

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    const list = Array.from(files);
    for (let i = 0; i < list.length; i++) {
      setProgressText(list.length > 1 ? `جاري رفع الصورة ${i + 1} من ${list.length}...` : 'جاري رفع الصورة...');
      try {
        const url = await uploadImageToCloudinary(list[i]);
        onUploaded(url);
      } catch (e: any) {
        setError(e.message || 'فشل رفع صورة واحدة على الأقل');
      }
    }
    setUploading(false);
    setProgressText('');
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={(e) => handleFiles(e.target.files)}
        disabled={uploading}
        className="hidden"
        id={`img-upload-${label}`}
      />
      <label
        htmlFor={`img-upload-${label}`}
        className={`inline-block cursor-pointer text-xs font-bold px-3 py-1.5 rounded-full border border-blush hover:border-rose ${uploading ? 'opacity-50 cursor-wait' : ''}`}
      >
        {uploading ? progressText : `+ ${label}`}
      </label>
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  );
}
