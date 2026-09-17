'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <p className="text-2xl font-bold mb-2">حصل خطأ غير متوقع 😔</p>
      <p className="text-ink/60 mb-6">جرب تاني، ولو المشكلة استمرت تواصل معانا عبر واتساب.</p>
      <button onClick={() => reset()} className="bg-rose text-white font-bold px-6 py-2.5 rounded-full">
        حاول تاني
      </button>
    </div>
  );
}
