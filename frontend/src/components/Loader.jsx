
export default function Loader({ message = "Chargement en cours..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      {/* Animation circulaire */}
      <div className="w-12 h-12 border-4 border-[var(--color-lavender)] border-t-transparent rounded-full animate-spin mb-4"></div>
      
      {/* Message */}
      <p className="text-lg font-semibold text-[var(--color-lavender)]">{message}</p>
    </div>
  );
}
