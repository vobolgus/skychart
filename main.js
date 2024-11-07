import { translations } from './translations.js?yu';
import { MessierGame } from './messierGame.js?uy';

document.addEventListener("DOMContentLoaded", () => {
    'use strict';

    let currentLanguage = "en"; // Default language

    let game = null;

    const setLanguage = (lang) => {
    currentLanguage = lang;

    // Common Elements
    document.getElementById("language-toggle").textContent =
        translations[lang].language;
    document.getElementById("nav-home").textContent = translations[lang].home;
    document.getElementById("nav-play-game").textContent =
        translations[lang].playGame;

    // Check if we're on the main page or game page
    if (document.getElementById("welcome-message")) {
      // Main Page
      document.getElementById("welcome-message").textContent =
          translations[lang].welcome;
      document.getElementById("start-button").textContent =
          translations[lang].startQuiz;
    } else if (document.getElementById("game-container")) {
      // Game Page
      document.getElementById("label-enter-number").textContent =
          translations[lang].enterNumber;
      document.getElementById("submit-button").textContent =
          translations[lang].submit;
      document.getElementById("pause-button").textContent =
          game && game.is_paused
              ? translations[lang].resume
              : translations[lang].pause;
      document.getElementById("next-button").textContent =
          translations[lang].next;
      document.getElementById("hint-button").textContent =
          translations[lang].hint;
      document.getElementById("timer-label").textContent =
          `${translations[lang].timeRemaining}${game ? game.remaining_time : "30"}${translations[lang].seconds}`;
      document.getElementById("score-label").textContent =
          `${translations[lang].score}${game ? game.score : "0"}`;

      // Update feedback if present
      const feedback = document.getElementById("feedback-label");
      if (feedback.textContent && game) {
        if (game.is_paused) {
          feedback.textContent = translations[lang].paused;
        }
      }
    }
  };

    document.getElementById("language-toggle").addEventListener("click", () => {
    setLanguage(currentLanguage === "en" ? "ru" : "en");

    // Update game texts if game is running
    if (game) {
      game.updateLanguage(currentLanguage);
    }
  });

    // Initialize language
    setLanguage(currentLanguage);

  // Добавим функцию для предзагрузки изображений
  const preloadImages = (imagePaths, callback) => {
    let loadedImages = 0;
    const totalImages = imagePaths.length;

    if (totalImages === 0) {
        callback();
        return;
    }

    const progressElement = document.getElementById('loading-progress');

    const updateProgress = () => {
        const percent = Math.floor((loadedImages / totalImages) * 100);
        progressElement.value = percent;
    };

    for (let i = 0; i < totalImages; i++) {
        const img = new Image();
        img.src = imagePaths[i];
        img.onload = () => {
            loadedImages++;
            updateProgress();
            if (loadedImages === totalImages) {
                callback();
            }
        };
        img.onerror = () => {
            console.error('Ошибка загрузки изображения:', imagePaths[i]);
            loadedImages++;
            updateProgress();
            if (loadedImages === totalImages) {
                callback();
            }
        };
    }
  };
  // Собираем пути ко всем изображениям, которые нужно предзагрузить
  const imagePaths = [];
  for (let i = 1; i <= 110; i++) {
      imagePaths.push(`photos_avif/M${i}.avif`);
      imagePaths.push(`maps_avif/M${i}_map.avif`);
      imagePaths.push(`maps_avif/M${i}_map_full.avif`);
  }

  // Функция инициализации игры
  const initGame = () => {
      // Скрываем загрузочный экран
      const loadingScreen = document.getElementById('loading-screen');
      loadingScreen.style.display = 'none';

      // Показываем контейнер игры
      const gameContainer = document.getElementById('game-container');
      gameContainer.style.display = 'block';

      // Инициализируем игру
      if (document.getElementById('game-container')) {
          game = new MessierGame()
          setLanguage(currentLanguage);
      }
  };

  // Начинаем предзагрузку изображений
  preloadImages(imagePaths, initGame);

});
