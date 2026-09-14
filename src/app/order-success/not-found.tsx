import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <div className="text-5xl mb-4">🎁</div>
      <h1 className="font-display text-2xl font-bold mb-3">الصفحة دي مش موجودة، لكن أكيد هنلاقي لك هدية تفرّحك</h1>
      <Link href="/" className="inline-block bg-rose text-white font-bold px-6 py-3 rounded-full mt-4">الرجوع للرئيسية</Link>
    </div>
  );
}
