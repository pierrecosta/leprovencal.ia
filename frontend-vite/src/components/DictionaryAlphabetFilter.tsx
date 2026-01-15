const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

interface DictionaryAlphabetFilterProps {
  lettre: string;
  onLettreChange: (value: string) => void;
}

export function DictionaryAlphabetFilter({ lettre, onLettreChange }: DictionaryAlphabetFilterProps) {
  return (
    <div className="card mb-6">
      <h2 className="text-xl font-bold text-heading mb-4">Filtre alphabétique</h2>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onLettreChange('toutes')}
          className={`px-3 py-1 rounded border ${
            lettre === 'toutes'
              ? 'bg-primary text-primaryContrast border-primary'
              : 'bg-white border-borderProvence hover:bg-surface'
          }`}
        >
          Toutes
        </button>
        {ALPHABET.map((l) => (
          <button
            key={l}
            onClick={() => onLettreChange(l)}
            className={`px-3 py-1 rounded border ${
              lettre === l
                ? 'bg-primary text-primaryContrast border-primary'
                : 'bg-white border-borderProvence hover:bg-surface'
            }`}
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}
