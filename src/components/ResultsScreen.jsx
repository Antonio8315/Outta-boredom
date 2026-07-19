import { RotateCcw } from 'lucide-react';
import { PlaceCard } from './PlaceCard';

export function ResultsScreen({ filteredPlaces, onReset }) {
  return (
    <main className="results-screen">
      <div className="results-header">
        <h2>Твої ідеальні місця 🗺️</h2>
        <p>Ось що ми підібрали під твій сьогоднішній настрій:</p>
      </div>

      <div className="places-list">
        {filteredPlaces.length > 0 ? (
          filteredPlaces.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))
        ) : (
          <div className="no-results">
            <p>Упс... На жаль, під таку комбінацію параметрів у нас поки немає місця. Спробуй обрати інші варіанти!</p>
          </div>
        )}
      </div>

      <button className="btn-primary reset-btn" onClick={onReset}>
        <RotateCcw size={18} /> Пройти тест знову
      </button>
    </main>
  );
}