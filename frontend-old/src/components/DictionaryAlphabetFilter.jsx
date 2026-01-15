
export default function DictionaryAlphabetFilter({ lettre, onLettreChange }) {
  const alphabet = ['toutes', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {alphabet.map(l => (
        <button
          key={l}
          onClick={() => onLettreChange(l)}
          className={`px-3 py-1 border rounded ${lettre === l ? 'bg-[var(--color-sun)]' : 'bg-white'}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
