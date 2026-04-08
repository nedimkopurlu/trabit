export default function OnboardingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Kimlik cümlen nedir?</h1>
      <input
        className="w-full rounded-lg border border-surface bg-surface px-4 py-3 mb-4"
        placeholder="Ben her gün öğrenen biriyim..."
      />
      <button className="w-full rounded-lg bg-fg text-bg px-6 py-3">
        Devam (stub)
      </button>
    </main>
  );
}
