import { useState, useEffect } from 'react';
import { places } from './data/places';
import './index.css';

// Імпортуємо іконки з пакету lucide-react (вони зроблять наш інтерфейс дуже красивим)
import { MapPin, Compass, ArrowRight, ArrowLeft, RotateCcw } from 'lucide-react';

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
      { label: "Таємне або незвичне місце", value: "secret", icon: "🕵️‍♂️" }
    ]
  },
  {
    id: 2,
    key: "company",
    title: "З ким ти плануєш прогулянку?",
    options: [
      { label: "Гуляю сам/а", value: "solo", icon: "🚶‍♂️" },
      { label: "З друзями", value: "friends", icon: "👥" },
      { label: "Романтичне побачення", value: "couple", icon: "👩‍❤️‍👨" }
    ]
  },
  {
    id: 3,
    key: "duration",
    title: "Скільки у тебе є вільного часу?",
    options: [
      { label: "Швидка кава (до 1 години)", value: "short", icon: "⏱️" },
      { label: "Повноцінний тріп (на пів дня)", value: "long", icon: "🗺️" }
    ]
  }
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

  // 2. Відповіді користувача, які ми будемо збирати під час тесту
  const [answers, setAnswers] = useState({
    vibe: '',
    company: '',
    duration: ''
  });

  // 3. Збережені відфільтровані місця, які ми покажемо в кінці
  const [filteredPlaces, setFilteredPlaces] = useState([]);

  const [allPlaces, setAllPlaces] = useState([]); // сюди запишемо місця з WordPress
  const [isLoading, setIsLoading] = useState(true);

  // --- ЛОГІЧНІ ФУНКЦІЇ ---

  // Функція для перезапуску тесту з самого початку
  const resetQuiz = () => {
    setAnswers({ vibe: '', company: '', duration: '' });
    setFilteredPlaces([]);
    setCurrentStep(0);
  };

  useEffect(() => {
    // ЗАМІНИ aaa.local на свій домен з LocalWP, якщо він інший!
    fetch('http://outta-boredom.local/wp-json/wp/v2/posts?_embed')
      .then((response) => response.json())
      .then((data) => {
        // Трансформуємо дані з формату WordPress у формат нашого додатка
        const formattedData = data.map((post) => {
          // Безпечно беремо посилання на головну картинку поста
          const mediaUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url 
            || 'https://images.unsplash.com/photo-1544192240-4a34feb0104a?w=500'; // fallback, якщо немає фото

          return {
            id: post.id,
            name: post.title.rendered,
            // Очищаємо опис від HTML тегів <p>...</p>, які дає WordPress
            description: post.content.rendered.replace(/<[^>]*>/g, ''),
            image: mediaUrl,
            address: post.acf?.address || 'Адреса не вказана',
            vibe: post.acf?.vibe || [],
            company: post.acf?.company || [],
            duration: post.acf?.duration || ''
          };
        });

        setAllPlaces(formattedData);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Помилка завантаження даних з WordPress:', error);
        setIsLoading(false);
      });
  }, []);

  // --- РЕНДЕР СТОРІНКИ ---
  return (
    <div className="app-container">
      {/* 1. ГОЛОВНИЙ ЕКРАН (Крок 0) */}
      {currentStep === 0 && (
        <main className="hero-screen">
          <div className="icon-badge">
            <Compass className="animate-spin-slow" size={48} color="#38bdf8" />
          </div>
          <h1>Де Погуляти?</h1>
          <p>Нудно і не знаєш куди піти? Пройди швидкий тест на 3 питання, і ми підберемо для тебе ідеальне місце у місті!</p>
          <button className="btn-primary" onClick={() => setCurrentStep(1)}>
            Знайди мені пригоду! <ArrowRight size={20} />
          </button>
        </main>
      )}

      {/* 2. ЕКРАН ТЕСТУ (Кроки 1, 2, 3) */}
      {currentStep > 0 && currentStep < 4 && (
        <main className="quiz-screen">
          {/* Прогрес-бар */}
          <div className="progress-bar">
            <span className="step-indicator">Крок {currentStep} з 3</span>
            <div className="progress-line">
              <div className="progress-fill" style={{ width: `${(currentStep / 3) * 100}%` }}></div>
            </div>
          </div>

          {/* Картка поточного питання */}
          <div className="question-card">
            {/* Беремо питання з масиву за поточним кроком (індекс = крок - 1) */}
            <h2>{questions[currentStep - 1].title}</h2>

            <div className="options-grid">
              {questions[currentStep - 1].options.map((option) => (
                <button
                  key={option.value}
                  className="option-button"
                  onClick={() => {
                    // 1. Записуємо відповідь користувача
                    const questionKey = questions[currentStep - 1].key;
                    setAnswers({
                      ...answers,
                      [questionKey]: option.value
                    });

                    // 2. Перевіряємо, чи це був останній крок (Крок 3)
                    const nextStep = currentStep + 1;

                    if (nextStep === 4) {
                      // Формуємо фінальний об'єкт відповідей, враховуючи поточний останній клік
                      const finalAnswers = {
                        ...answers,
                        [questionKey]: option.value
                      };

                      // Фільтруємо нашу базу даних places
                      const results = allPlaces.filter((place) => {
                        // Перевіряємо, чи є обраний вайб серед масиву вайбів місця
                        const matchVibe = place.vibe.includes(finalAnswers.vibe);
                        // Перевіряємо компанію
                        const matchCompany = place.company.includes(finalAnswers.company);
                        // Перевіряємо тривалість (тут звичайне порівняння рядків)
                        const matchDuration = place.duration === finalAnswers.duration;

                        return matchVibe && matchCompany && matchDuration;
                      });

                      setFilteredPlaces(results);
                    }

                    setCurrentStep(nextStep);
                  }}
                >
                  <span className="option-icon">{option.icon}</span>
                  <span className="option-label">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button className="btn-secondary" onClick={() => setCurrentStep(currentStep - 1)}>
            <ArrowLeft size={18} /> Назад
          </button>
        </main>
      )}

      {/* 3. ЕКРАН РЕЗУЛЬТАТІВ (Крок 4) */}
      {currentStep === 4 && (
        <main className="results-screen">
          <div className="results-header">
            <h2>Твої ідеальні місця 🗺️</h2>
            <p>Ось що ми підібрали під твій сьогоднішній настрій:</p>
          </div>

          <div className="places-list">
            {filteredPlaces.length > 0 ? (
              filteredPlaces.map((place) => (
                <div key={place.id} className="place-card">
                  <img src={place.image} alt={place.name} className="place-image" />
                  <div className="place-info">
                    <h3>{place.name}</h3>
                    <p className="place-description">{place.description}</p>
                    <div className="place-address">
                      <MapPin size={16} color="#38bdf8" />
                      <span>{place.address}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Якщо жодне місце не підійшло під таку комбінацію фільтрів
              <div className="no-results">
                <p>Упс... На жаль, під таку комбінацію параметрів у нас поки немає місця. Спробуй обрати інші варіанти!</p>
              </div>
            )}
          </div>

          <button className="btn-primary reset-btn" onClick={resetQuiz}>
            <RotateCcw size={18} /> Пройти тест знову
          </button>
        </main>
      )}
    </div>
  );
}

export default App;