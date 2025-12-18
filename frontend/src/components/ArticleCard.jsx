
export default function ArticleCard({ titre, description, image_url, source_url }) {
  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg shadow-sm bg-white hover:shadow-md transition">
      {/* Image */}
      <img
        src={image_url}
        alt={`Illustration de ${titre}`}
        className="w-full md:w-32 h-32 object-cover rounded"
      />

      {/* Contenu */}
      <div className="flex flex-col justify-between">
        <h3 className="text-xl font-bold text-[var(--color-lavender)] mb-2">{titre}</h3>
        <p className="text-gray-700 mb-3">{description}</p>
        <a
          href={source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--color-terra)] font-semibold hover:underline"
        >
          Lire la suite →
        </a>
      </div>
    </div>
  );
}
