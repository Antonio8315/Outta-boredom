import { useState, useEffect } from "react";
import { places } from "./data/places";
import "./index.css";

import { StartScreen } from "./components/StartScreen";
import { QuizScreen } from "./components/QuizScreen";
import { ResultsScreen } from "./components/ResultsScreen";

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
      { label: "До 1 години", value: "short", icon: "⏱️" },
      {
        label: "2-3 години",
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
  const [selectedCity, setSelectedCity] = useState("Чернівці");

  const CITIES = [
    { id: "chernivtsi", name: "Чернівці" },
    { id: "lviv", name: "Львів" },
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

        return (
          matchCity && matchVibe && matchCompany && matchDuration && matchBudget
        );
      });

      setFilteredPlaces(results);
    }

    setCurrentStep(nextStep);
  };

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(API_URL)
      .then((response) => response.json())
      .then((data) => {
        const formattedData = data.map((post) => {
          const mediaUrl =
            post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
            "https://images.unsplash.com/photo-1544192240-4a34feb0104a?w=500"; // fallback, якщо немає фото

          const citySlug =
            post._embedded?.["wp:term"]?.[0]?.[0]?.slug || "chernivtsi";

          const cleanDescription = post.content.rendered
            .replace(/<[^>]*>/g, "")
            .replace(/&#8211;/g, "–")
            .replace(/&#8212;/g, "—")
            .replace(/&nbsp;/g, " ")
            .replace(/&amp;/g, "&");

          let addressArray = [];

          if (Array.isArray(post.acf?.address)) {
            addressArray = post.acf.address.map(
              (item) => item.address_line || item,
            );
          } else if (
            typeof post.acf?.address === "string" &&
            post.acf.address.trim() !== ""
          ) {
            addressArray = post.acf.address
              .split("\n")
              .map((addr) => addr.trim())
              .filter((addr) => addr.length > 0);
          } else {
            addressArray = ["Адреса не вказана"];
          }

          return {
            id: post.id,
            name: post.title.rendered.replace(/&#8211;/g, "–"),
            description: post.content.rendered.replace(/<[^>]*>/g, ""),
            image: mediaUrl,
            address: addressArray,
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
