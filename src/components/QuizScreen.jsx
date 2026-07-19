import "./QuizScreen.css";
import { ArrowLeft } from "lucide-react";

export function QuizScreen({ currentStep, questions, onAnswer, onBack }) {
  
  // Отримуємо поточне питання за індексом
  const currentQuestion = questions[currentStep - 1];

  // Захист на випадок збою кроків
  if (!currentQuestion) return null;

  return (
    <main className="quiz-screen">
      {/* Прогрес-бар */}
      <div className="progress-bar">
        <span className="step-indicator">Крок {currentStep} з 3</span>
        <div className="progress-line">
          <div
            className="progress-fill"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Картка поточного питання */}
      <div className="question-card">
        <h2>{currentQuestion.title}</h2>

        <div className="options-grid">
          {currentQuestion.options.map((option) => (
            <button
              key={option.value}
              className="option-button"
              // Тут викликається тільки onAnswer з App.jsx. 
              // Жодних setAnswers, setCurrentStep чи allPlaces тут бути НЕ повинно!
              onClick={() => onAnswer(currentQuestion.key, option.value)}
            >
              <span className="option-icon">{option.icon}</span>
              <span className="option-label">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Кнопка "Назад" викликає функцію onBack з батьківського компонента */}
      <button className="btn-secondary" onClick={onBack}>
        <ArrowLeft size={18} /> Назад
      </button>
    </main>
  );
}