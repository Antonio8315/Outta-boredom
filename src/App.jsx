import { useState, useEffect } from "react";
import { places } from "./data/places";
import "./index.css";

import { StartScreen } from "./components/StartScreen";
import { QuizScreen } from "./components/QuizScreen";
import { ResultsScreen } from "./components/ResultsScreen";

// Описуємо наші питання для тесту
const questions = [
  {
    id: 1,
    key: "vibe",
    title: "Який у тебе сьогодні настрій?",
    options: [
      { label: "Природа та спокій", value: "nature", icon: "🌿" },
      { label: "Шопінг та ярмарки", value: "shopping", icon: "🛍️" },
      { label: "Шумне місто та архітектура", value: "urban", icon: "🏙️" },
      { label: "Історія та культура", value: "history", icon: "🏛️" },
      {
        label: "Інстаграмні місця / Фотолокації",
        value: "photoLocations",
        icon: "📸",
      },
      { label: "Їжа та гастрономія", value: "Food", icon: "🍕" },
      { label: "Затишна кав'ярня", value: "coffeeShop", icon: "☕" },
      { label: "Розваги & Ігри", value: "games", icon: "🎲" },
      {
        label: "Комп'ютерний клуб / Гемйпад",
        value: "computerСlub",
        icon: "🎮",
      },
      { label: "Активний відпочинок / Спорт", value: "sport", icon: "🚴‍♂️" },
      { label: "Таємне або незвичне місце", value: "secret", icon: "🕵️‍♂️" },
      { label: "Інше", value: "other", icon: "❓" },
    ],
  },
  {
    id: 2,
    key: "company",
    title: "З ким ти плануєш прогулянку?",
    options: [
      { label: "Гуляю сам/а", value: "solo", icon: "🚶‍♂️" },
      { label: "З друзями", value: "friends", icon: "👥" },
      { label: "З сім'єю", value: "family", icon: "👨‍👩‍👧‍👦" },
      { label: "Романтичне побачення", value: "couple", icon: "👩‍❤️‍👨" },
    ],
  },
  {
    id: 3,
    key: "duration",
    title: "Скільки у тебе є вільного часу?",
    options: [
      { label: "Швидка кава (до 1 години)", value: "short", icon: "⏱️" },
      {
        label: "Посиденьки та розваги (2-3 години)",
        value: "medium",
        icon: "🕒",
      },
      { label: "Повноцінний тріп (на пів дня)", value: "long", icon: "🗺️" },
    ],
  },
  {
    id: 4,
    key: "budget",
    title: "Який бюджет?",
    options: [
      { label: "Повzero (безкоштовно)", value: "free", icon: "🌳" },
      { label: "Студентський тариф (дешево)", value: "cheap", icon: "🪙" },
      {
        label: "Гуляємо на всі гроші! (premium)",
        value: "expensive",
        icon: "💳",
      },
    ],
  },
];

function App() {
  // 1. Додаємо стейт обраного міста
  const [selectedCity, setSelectedCity] = useState("Чернівці");

  // 2. Список доступних міст (можна розширювати)
  const CITIES = [
    { id: "chernivtsi", name: "Чернівці" },
    { id: "lviv", name: "Львів" },
    { id: "kyiv", name: "Київ" },
  ];

  const [currentStep, setCurrentStep] = useState(0);

  const [answers, setAnswers] = useState({
    vibe: "",
    company: "",
    duration: "",
  });

  const [filteredPlaces, setFilteredPlaces] = useState([]);

  const [allPlaces, setAllPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- ЛОГІЧНІ ФУНКЦІЇ ---

  // Функція для перезапуску тесту з самого початку
  const resetQuiz = () => {
    setAnswers({ vibe: "", company: "", duration: "" });
    setFilteredPlaces([]);
    setCurrentStep(0);
  };

  const handleAnswer = (questionKey, optionValue) => {
    const updatedAnswers = {
      ...answers,
      [questionKey]: optionValue,
    };
    setAnswers(updatedAnswers);

    const nextStep = currentStep + 1;

    if (nextStep === 5) {
      const currentCityObj = CITIES.find((c) => c.name === selectedCity);
    const currentCitySlug = currentCityObj ? currentCityObj.id : "chernivtsi";
      const results = allPlaces.filter((place) => {
        const matchCity = place.city === currentCitySlug;
        const matchVibe = place.vibe.includes(updatedAnswers.vibe);
        const matchCompany = place.company.includes(updatedAnswers.company);
        const matchDuration = place.duration === updatedAnswers.duration;
        const matchBudget = place.budget === updatedAnswers.budget;

        return matchCity && matchVibe && matchCompany && matchDuration && matchBudget;
      });

      setFilteredPlaces(results);
    }

    setCurrentStep(nextStep);
  };

  useEffect(() => {
    fetch("http://outta-boredom.local/wp-json/wp/v2/posts?_embed")
      .then((response) => response.json())
      .then((data) => {
        const formattedData = data.map((post) => {
          const mediaUrl =
            post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
            "https://images.unsplash.com/photo-1544192240-4a34feb0104a?w=500"; // fallback, якщо немає фото

          const citySlug =
            post._embedded?.["wp:term"]?.[0]?.[0]?.slug || "chernivtsi";

          return {
            id: post.id,
            name: post.title.rendered,
            description: post.content.rendered.replace(/<[^>]*>/g, ""),
            image: mediaUrl,
            address: post.acf?.address || "Адреса не вказана",
            vibe: post.acf?.vibe || [],
            company: post.acf?.company || [],
            duration: post.acf?.duration || "",
            budget: post.acf?.budget || "",
            city: citySlug,
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
      {currentStep === 0 && (
        <StartScreen
          onStart={() => setCurrentStep(1)}
          selectedCity={selectedCity}
          onSelectCity={setSelectedCity}
          cities={CITIES}
        />
      )}

      {/* 2. ЕКРАН ТЕСТУ (Кроки 1, 2, 3, 4) */}
      {currentStep > 0 && currentStep < 5 && (
        <QuizScreen
          currentStep={currentStep}
          questions={questions}
          onAnswer={handleAnswer}
          onBack={() => setCurrentStep(currentStep - 1)}
        />
      )}

      {/* 3. ЕКРАН РЕЗУЛЬТАТІВ (Крок 5) */}
      {currentStep === 5 && (
        <ResultsScreen filteredPlaces={filteredPlaces} onReset={resetQuiz} />
      )}
    </div>
  );
}

export default App;
