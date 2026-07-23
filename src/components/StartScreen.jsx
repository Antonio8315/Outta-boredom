import { Compass, ArrowRight, MapPin } from "lucide-react";
import "./StartScreen.css";
export function StartScreen({ onStart, selectedCity, onSelectCity, cities }) {
  return (
    <main className="hero-screen">
      {/* Селектор вибору міста зверху */}
      <div className="city-selector-container">
        <MapPin size={18} className="city-icon" />
        <select
          value={selectedCity}
          onChange={(e) => onSelectCity(e.target.value)}
          className="city-select"
        >
          {cities.map((city) => (
            <option key={city.id} value={city.name}>
              {city.name}
            </option>
          ))}
        </select>
      </div>
      <div className="icon-badge">
        <Compass className="animate-spin-slow" size={48} color="#38bdf8" />
      </div>
      <h1>Де Погуляти?</h1>
      <p>
        Нудно і не знаєш куди піти? Пройди швидкий тест на 4 питання, і ми
        підберемо для тебе ідеальне місце у місті!
      </p>
      <button className="btn-primary" onClick={onStart}>
        Знайди мені пригоду! <ArrowRight size={20} />
      </button>
    </main>
  );
}
