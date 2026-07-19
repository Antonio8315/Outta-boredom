import { useState, useEffect } from "react";
import { places } from "./data/places";
import "./index.css";

import { StartScreen } from "./components/StartScreen";
import { QuizScreen } from "./components/QuizScreen";
import { ResultsScreen } from "./components/ResultsScreen";

// Імпортуємо іконки з пакету lucide-react (вони зроблять наш інтерфейс дуже красивим)
import {
  MapPin,
  Compass,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
} from "lucide-react";

// Описуємо наші питання для тесту
const questions = [
  {
    id: 1,
    key: "vibe",
    title: "Який у тебе сьогодні настрій?",
    options: [
      { label: "Природа та спокій", value: "nature", icon: "🌿" },
      { label: "Шумне місто та архітектура", value: "urban", icon: "🏙️" },
      { label: "Затишна кав'ярня або дах", value: "chill", icon: "☕" },
      { label: "Таємне або незвичне місце", value: "secret", icon: "🕵️‍♂️" },
    ],
  },
  {
    id: 2,
    key: "company",
    title: "З ким ти плануєш прогулянку?",
    options: [
      { label: "Гуляю сам/а", value: "solo", icon: "🚶‍♂️" },
      { label: "З друзями", value: "friends", icon: "👥" },
      { label: "Романтичне побачення", value: "couple", icon: "👩‍❤️‍👨" },
    ],
  },
  {
    id: 3,
    key: "duration",
    title: "Скільки у тебе є вільного часу?",
    options: [
      { label: "Швидка кава (до 1 години)", value: "short", icon: "⏱️" },
      { label: "Повноцінний тріп (на пів дня)", value: "long", icon: "🗺️" },
    ],
  },
];

function App() {
  // --- СТЕЙТИ (ДАНІ, ЯКІ МІНЯЮТЬСЯ) ---

  // 1. Поточний крок нашого додатка:
  // 0 - Головний екран (вітання)
  // 1 - Питання про Вайб (vibe)
  // 2 - Питання про Компанію (company)
  // 3 - Питання про Тривалість (duration)
  // 4 - Фінальний екран (результати фільтрації)
  const [currentStep, setCurrentStep] = useState(0);

  console.log("Поточний крок:", currentStep, "Тип:", typeof currentStep);

  // 2. Відповіді користувача, які ми будемо збирати під час тесту
  const [answers, setAnswers] = useState({
    vibe: "",
    company: "",
    duration: "",
  });

  // 3. Збережені відфільтровані місця, які ми покажемо в кінці
  const [filteredPlaces, setFilteredPlaces] = useState([]);

  const [allPlaces, setAllPlaces] = useState([]); // сюди запишемо місця з WordPress
  const [isLoading, setIsLoading] = useState(true);

  // --- ЛОГІЧНІ ФУНКЦІЇ ---

  // Функція для перезапуску тесту з самого початку
  const resetQuiz = () => {
    setAnswers({ vibe: "", company: "", duration: "" });
    setFilteredPlaces([]);
    setCurrentStep(0);
  };

  const handleAnswer = (questionKey, optionValue) => {
    // 1. Записуємо відповідь користувача
    const updatedAnswers = {
      ...answers,
      [questionKey]: optionValue,
    };
    setAnswers(updatedAnswers);

    // 2. Перевіряємо, чи це був останній крок (Крок 3)
    const nextStep = currentStep + 1;

    if (nextStep === 4) {
      // Фільтруємо базу даних
      const results = allPlaces.filter((place) => {
        const matchVibe = place.vibe.includes(updatedAnswers.vibe);
        const matchCompany = place.company.includes(updatedAnswers.company);
        const matchDuration = place.duration === updatedAnswers.duration;

        return matchVibe && matchCompany && matchDuration;
      });

      setFilteredPlaces(results);
    }

    setCurrentStep(nextStep);
  };

  useEffect(() => {
    // ЗАМІНИ aaa.local на свій домен з LocalWP, якщо він інший!
    fetch("http://outta-boredom.local/wp-json/wp/v2/posts?_embed")
      .then((response) => response.json())
      .then((data) => {
        // Трансформуємо дані з формату WordPress у формат нашого додатка
        const formattedData = data.map((post) => {
          // Безпечно беремо посилання на головну картинку поста
          const mediaUrl =
            post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
            "https://images.unsplash.com/photo-1544192240-4a34feb0104a?w=500"; // fallback, якщо немає фото

          return {
            id: post.id,
            name: post.title.rendered,
            // Очищаємо опис від HTML тегів <p>...</p>, які дає WordPress
            description: post.content.rendered.replace(/<[^>]*>/g, ""),
            image: mediaUrl,
            address: post.acf?.address || "Адреса не вказана",
            vibe: post.acf?.vibe || [],
            company: post.acf?.company || [],
            duration: post.acf?.duration || "",
          };
        });

        setAllPlaces(formattedData);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Помилка завантаження даних з WordPress:", error);
        setIsLoading(false);
      });
  }, []);

  // --- РЕНДЕР СТОРІНКИ ---
  return (
    <div className="app-container">
      {/* 1. ГОЛОВНИЙ ЕКРАН (Крок 0) */}
      {currentStep === 0 && <StartScreen onStart={() => setCurrentStep(1)} />}

      {/* 2. ЕКРАН ТЕСТУ (Кроки 1, 2, 3) */}
      {currentStep > 0 && currentStep < 4 && (
        <QuizScreen
          currentStep={currentStep}
          questions={questions}
          onAnswer={handleAnswer}
          onBack={() => setCurrentStep(currentStep - 1)}
        />
      )}

      {/* 3. ЕКРАН РЕЗУЛЬТАТІВ (Крок 4) */}
      {currentStep === 4 && (
        <ResultsScreen filteredPlaces={filteredPlaces} onReset={resetQuiz} />
      )}
    </div>
  );
}

export default App;
