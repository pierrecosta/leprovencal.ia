export default function GeographyPage() {
  const iframes = [
    "https://gallica.bnf.fr/ark:/12148/btv1b8596846d/f1.item.mini",
    "https://gallica.bnf.fr/ark:/12148/btv1b8596846d/f2.item.mini",
    "https://gallica.bnf.fr/ark:/12148/btv1b8596846d/f3.item.mini",
    "https://gallica.bnf.fr/ark:/12148/btv1b8596846d/f4.item.mini",
    "https://gallica.bnf.fr/ark:/12148/btv1b8596846d/f5.item.mini"
  ];

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {iframes.map((src, i) => (
        <div
          key={src}
          className="border rounded-lg overflow-hidden shadow-sm bg-white hover:shadow-md transition"
        >
          <iframe
            src={src}
            title={`Carte historique ${i + 1}`}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-[320px] md:h-[400px] border-0"
          />
          <div className="p-2 text-center bg-[var(--color-bg)] text-[var(--color-lavender)] font-semibold">
            Carte {i + 1} — Provence historique
          </div>
        </div>
      ))}
    </div>
  );
}
