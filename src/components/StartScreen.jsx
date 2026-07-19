import { Compass, ArrowRight } from "lucide-react";
import "./StartScreen.css";
export function StartScreen({ onStart }) {
  return (
    <main className="hero-screen">
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