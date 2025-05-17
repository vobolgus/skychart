import { MessierGameLogic } from '../utils/gameLogic.js';
import { preloadImages, getImagePathsForDifficulty } from '../utils/imageUtils.js';

/**
 * GameBoard component for Messier Object Quiz
 * This handles the UI interaction with the game logic
 */
export class GameBoard {
  /**
   * Initialize GameBoard component
   * @param {Object} options - Configuration options
   * @param {string} options.difficulty - Game difficulty
   * @param {string} options.language - Current language
   * @param {Object} options.translations - Translations object
   */
  constructor(options = {}) {
    this.difficulty = options.difficulty || 'medium';
    this.language = options.language || 'en';
    this.translations = options.translations || {};
    this.gameLogic = null;

    // UI Elements
    this.photo_image = document.getElementById("photo-image");
    this.map_image = document.getElementById("map-image");
    this.number_input = document.getElementById("number-input");
    this.submit_button = document.getElementById("submit-button");
    this.feedback_label = document.getElementById("feedback-label");
    this.progress_bar = document.getElementById("progress-bar");
    this.timer_label = document.getElementById("timer-label");
    this.score_label = document.getElementById("score-label");
    this.pause_button = document.getElementById("pause-button");
    this.next_button = document.getElementById("next-button");
    this.hint_button = document.getElementById("hint-button");
    this.loading_screen = document.getElementById("loading-screen");
    this.loading_progress = document.getElementById("loading-progress");
    this.game_container = document.getElementById("game-container");

    // Timers
    this.timer_interval = null;
    this.feedback_timer = null;
    this.next_question_timer = null;
  }

  /**
   * Initialize the game
   */
  async initialize() {
    // Preload images
    const imagePaths = getImagePathsForDifficulty(this.difficulty);
    preloadImages(
      imagePaths,
      (progress) => {
        this.loading_progress.value = progress;
      },
      async () => {
        // Initialize game logic
        this.gameLogic = await new MessierGameLogic(this.difficulty, this.language).initialize();
        
        // Hide loading screen and show game
        this.loading_screen.style.display = 'none';
        this.game_container.style.display = 'block';
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Start the timer
        this.timer_interval = setInterval(() => this.updateTimer(), 1000);
        
        // Load the first question
        this.loadQuestion();
      }
    );
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    this.submit_button.addEventListener("click", () => this.onSubmit());
    this.pause_button.addEventListener("click", () => this.togglePause());
    this.next_button.addEventListener("click", () => this.nextQuestion());
    this.hint_button.addEventListener("click", () => this.showHint());
    document.addEventListener("keydown", (event) => this.onKeyDown(event));
  }

  /**
   * Handle keyboard input
   */
  onKeyDown(event) {
    if (event.key === "Enter") {
      if (this.gameLogic.waiting_for_next_question) {
        this.skipToNextQuestion();
      } else {
        this.onSubmit();
      }
    } else if (event.key === " ") { // Space key
      this.togglePause();
    }
  }

  /**
   * Load the current question
   */
  loadQuestion() {
    if (this.gameLogic.isGameOver()) {
      this.endGame();
      return;
    }

    // Reset UI for next question
    this.number_input.value = '';
    this.feedback_label.textContent = "";
    this.feedback_label.className = "feedback-label";

    // Load images
    const mn = this.gameLogic.getCurrentMessierNumber();
    this.loadImages(mn, false);

    // Update progress bar
    this.progress_bar.value = this.gameLogic.current_index + 1;
    this.progress_bar.max = this.gameLogic.total_objects;

    // Update timer
    this.timer_label.textContent = 
      `${this.translations[this.language].timeRemaining}${this.gameLogic.remaining_time}${this.translations[this.language].seconds}`;

    // Focus input
    this.number_input.focus();
  }

  /**
   * Load images for current question
   */
  loadImages(mn, show_full_map) {
    let photo_path = `/public/photos_avif/M${mn}.avif`;
    let map_path = show_full_map
      ? `/public/maps_avif/M${mn}_map_full.avif`
      : `/public/maps_avif/M${mn}_map.avif`;

    this.photo_image.src = photo_path;
    this.map_image.src = map_path;
  }

  /**
   * Handle submit button click
   */
  onSubmit() {
    if (this.gameLogic.is_paused) return;

    if (this.gameLogic.waiting_for_next_question) {
      this.skipToNextQuestion();
      return;
    }

    // Process answer
    const user_answer = parseInt(this.number_input.value);
    const result = this.gameLogic.checkAnswer(user_answer);
    
    if (!result) return;
    
    if (result.isCorrect) {
      this.feedback_label.textContent = this.translations[this.language].correct;
      this.feedback_label.className = 'feedback-label feedback-correct';
    } else {
      this.feedback_label.textContent = 
        `${this.translations[this.language].incorrect}${result.correctAnswer}.`;
      this.feedback_label.className = 'feedback-label feedback-incorrect';
    }

    // Update score label
    this.score_label.textContent = 
      `${this.translations[this.language].score}${this.gameLogic.score}`;

    // Display full map
    const mn = this.gameLogic.getCurrentMessierNumber();
    this.loadImages(mn, true);

    // Start timers for next question
    if (this.feedback_timer) clearTimeout(this.feedback_timer);
    if (this.next_question_timer) clearTimeout(this.next_question_timer);

    this.feedback_timer = setTimeout(() => this.clearFeedback(), 2000);
    this.next_question_timer = setTimeout(() => this.nextQuestion(), 2000);
  }

  /**
   * Clear feedback message
   */
  clearFeedback() {
    this.feedback_label.textContent = "";
  }

  /**
   * Skip to next question
   */
  skipToNextQuestion() {
    if (this.feedback_timer) clearTimeout(this.feedback_timer);
    if (this.next_question_timer) clearTimeout(this.next_question_timer);
    
    this.clearFeedback();
    this.nextQuestion();
  }

  /**
   * Handle next question button click
   */
  nextQuestion() {
    if (this.gameLogic.is_paused) return;
    
    const hasMoreQuestions = this.gameLogic.nextQuestion();
    if (hasMoreQuestions) {
      this.animateTransition();
    } else {
      this.endGame();
    }
  }

  /**
   * Animate transition to next question
   */
  animateTransition() {
    // This preserves the slide animation from the original code
    // Prepare next images
    let next_index = this.gameLogic.current_index;
    if (next_index >= this.gameLogic.total_objects) {
      this.endGame();
      return;
    }

    let mn = this.gameLogic.getCurrentMessierNumber();
    let next_photo_path = `/public/photos_avif/M${mn}.avif`;
    let next_map_path = `/public/maps_avif/M${mn}_map.avif`;

    // Create a new images container for next images
    let next_images_container = document.createElement('div');
    next_images_container.classList.add('images-container', 'slide-in');

    let next_photo_image = document.createElement('img');
    next_photo_image.classList.add('image');
    next_photo_image.src = next_photo_path;

    let next_map_image = document.createElement('img');
    next_map_image.classList.add('image');
    next_map_image.src = next_map_path;

    next_images_container.appendChild(next_photo_image);
    next_images_container.appendChild(next_map_image);

    let image_container = document.getElementById('image-container');
    image_container.appendChild(next_images_container);

    // Get the current images container
    let current_images_container = document.getElementById('current-images-container');

    // Add slide-out animation to current images
    current_images_container.classList.add('slide-out');

    // After animation, update current images container
    setTimeout(() => {
      // Remove old container
      image_container.removeChild(current_images_container);

      // Set id to new container
      next_images_container.id = 'current-images-container';

      // Update the UI for the new question
      this.loadQuestion();
    }, 500); // Duration matches the CSS animation duration
  }

  /**
   * Update timer display
   */
  updateTimer() {
    const timerExpired = this.gameLogic.updateTimer();
    
    if (timerExpired) {
      this.feedback_label.textContent = this.translations[this.language].timesUp;
      this.feedback_label.className = 'feedback-label feedback-incorrect';

      // Display full map
      const mn = this.gameLogic.getCurrentMessierNumber();
      this.loadImages(mn, true);

      // Start timers for next question
      this.gameLogic.waiting_for_next_question = true;

      if (this.feedback_timer) clearTimeout(this.feedback_timer);
      if (this.next_question_timer) clearTimeout(this.next_question_timer);

      this.feedback_timer = setTimeout(() => this.clearFeedback(), 2000);
      this.next_question_timer = setTimeout(() => this.nextQuestion(), 2000);
    } else {
      this.timer_label.textContent = 
        `${this.translations[this.language].timeRemaining}${this.gameLogic.remaining_time}${this.translations[this.language].seconds}`;
    }
  }

  /**
   * Toggle pause state
   */
  togglePause() {
    const isPaused = this.gameLogic.togglePause();
    
    if (isPaused) {
      clearInterval(this.timer_interval);
      if (this.feedback_timer) clearTimeout(this.feedback_timer);
      if (this.next_question_timer) clearTimeout(this.next_question_timer);
      
      this.pause_button.textContent = this.translations[this.language].resume;
      this.feedback_label.textContent = this.translations[this.language].paused;
      this.feedback_label.className = 'feedback-label feedback-paused';
    } else {
      this.timer_interval = setInterval(() => this.updateTimer(), 1000);
      
      if (this.gameLogic.waiting_for_next_question) {
        // Restart timers
        this.feedback_timer = setTimeout(() => this.clearFeedback(), 2000);
        this.next_question_timer = setTimeout(() => this.nextQuestion(), 2000);
      }
      
      this.pause_button.textContent = this.translations[this.language].pause;
      this.feedback_label.textContent = "";
      this.feedback_label.className = 'feedback-label';
      this.number_input.focus();
    }
  }

  /**
   * Show hint for current question
   */
  showHint() {
    if (this.gameLogic.is_paused) return;

    const hint = this.gameLogic.getHint();
    
    if (!hint.available) {
      if (hint.reason === 'not_allowed') {
        this.feedback_label.textContent = this.translations[this.language].hintsNotAllowed;
      } else {
        this.feedback_label.textContent = this.translations[this.language].noHintAvailable;
      }
      
      this.feedback_label.className = 'feedback-label feedback-incorrect';
      return;
    }
    
    this.feedback_label.textContent = 
      `${this.translations[this.language].hintText}${hint.text}`;
    this.feedback_label.className = 'feedback-label feedback-hint';

    // Clear hint after 5 seconds
    setTimeout(() => this.clearFeedback(), 5000);
  }

  /**
   * End the game and display results
   */
  endGame() {
    const stats = this.gameLogic.getGameStats();
    
    // Display game over message with stats
    this.feedback_label.textContent =
      `${this.translations[this.language].gameOver}${stats.score}` +
      `${this.translations[this.language].correctAnswers}${stats.correctAnswers}/${stats.totalObjects}` +
      `${this.translations[this.language].timeTaken}${stats.timeTaken}${this.translations[this.language].secondsSuffix}` +
      `\n${this.translations[this.language].difficultyLevel}${this.translations[this.language][stats.difficulty]}`;
    
    this.feedback_label.style.color = "black";
    
    // Clean up
    clearInterval(this.timer_interval);
    
    // Disable controls
    this.submit_button.disabled = true;
    this.next_button.disabled = true;
    this.pause_button.disabled = true;
    this.hint_button.disabled = true;
    this.number_input.disabled = true;
  }

  /**
   * Update UI for language change
   */
  updateLanguage(lang, translations) {
    this.language = lang;
    this.translations = translations;
    
    if (this.gameLogic) {
      this.gameLogic.lang = lang;
    }

    // Update UI texts
    const elements = {
      'label-enter-number': translations[lang].enterNumber,
      'submit-button': translations[lang].submit,
      'next-button': translations[lang].next,
      'hint-button': translations[lang].hint
    };
    
    // Update pause button based on state
    elements['pause-button'] = this.gameLogic && this.gameLogic.is_paused
      ? translations[lang].resume
      : translations[lang].pause;
    
    // Update timer and score
    if (this.gameLogic) {
      this.timer_label.textContent = 
        `${translations[lang].timeRemaining}${this.gameLogic.remaining_time}${translations[lang].seconds}`;
      this.score_label.textContent = 
        `${translations[lang].score}${this.gameLogic.score}`;
    }
    
    // Update all text elements
    Object.entries(elements).forEach(([id, text]) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = text;
      }
    });
    
    // Update feedback if showing a hint
    if (this.feedback_label.textContent.startsWith(translations[lang === 'en' ? 'ru' : 'en'].hintText)) {
      this.showHint(); // Re-display the hint in the new language
    }
  }
}