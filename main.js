import { translations } from './translations.js';
import { MessierGame } from './messierGame.js';

document.addEventListener("DOMContentLoaded", () => {
    'use strict';

    // At the beginning of main.js
    const urlParams = new URLSearchParams(window.location.search);
    const difficulty = urlParams.get('difficulty') || 'medium'; // Default to 'medium' if not specified


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

    if (document.getElementById("difficulty-select")) {
        document.getElementById("label-select-difficulty").textContent = translations[lang].selectDifficulty;
        document.getElementById("option-easy").textContent = translations[lang].easy;
        document.getElementById("option-medium").textContent = translations[lang].medium;
        document.getElementById("option-hard").textContent = translations[lang].hard;
    }

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

  // Collect image paths to preload based on difficulty
    const getImagePaths = (difficulty) => {
      let objectList = [];
      switch (difficulty) {
        case 'easy':
          objectList = [1, 13, 31, 42, 45, 51, 57, 81, 82, 104]; // Same as in getEasyObjects()
          break;
        case 'medium':
          objectList = Array.from({ length: 50 }, (_, i) => i + 1);
          break;
        case 'hard':
          objectList = Array.from({ length: 110 }, (_, i) => i + 1);
          break;
        default:
          objectList = Array.from({ length: 50 }, (_, i) => i + 1);
      }

      const paths = [];
      for (const i of objectList) {
        paths.push(`photos_avif/M${i}.avif`);
        paths.push(`maps_avif/M${i}_map.avif`);
        paths.push(`maps_avif/M${i}_map_full.avif`);
      }
      return paths;
    };
  // Собираем пути ко всем изображениям, которые нужно предзагрузить
    const imagePaths = getImagePaths(difficulty);

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
          game = new MessierGame(difficulty)
          setLanguage(currentLanguage);
      }
  };

  // Начинаем предзагрузку изображений
  preloadImages(imagePaths, initGame);

});
