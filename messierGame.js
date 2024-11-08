import {translations} from "./translations.js";
import { messierData } from './messierData.js';

let currentLanguage = "en"; // Default language

export class MessierGame {
      constructor(difficulty) {
        // Game variables
        this.difficulty = difficulty || 'medium'; // Default to 'medium' if not specified
        this.total_objects = 0; // Will be set based on difficulty
        this.sequence = []; // Will be set based on difficulty
        this.sequence = this.shuffleArray(
            [...Array(110).keys()].map((i) => i + 1),
        ); // [1..110] shuffled
        this.current_index = 0;
        this.correct_answers = 0;
        this.total_objects = 110;
        this.is_paused = false;
        this.time_per_question = 30; // seconds
        this.remaining_time = this.time_per_question;
        this.score = 0;
        this.start_time = Date.now();
        this.waiting_for_next_question = false;
        this.feedback_timer = null;
        this.next_question_timer = null;
        this.timer_interval = null;

        // Translation
        this.lang = currentLanguage;

        // Data
        this.data = []; // to be loaded

        // Load data
        this.loadData();

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

        // Event listeners
        this.submit_button.addEventListener("click", () => this.onSubmit());
        this.pause_button.addEventListener("click", () => this.togglePause());
        this.next_button.addEventListener("click", () => this.nextQuestion());
        this.hint_button.addEventListener("click", () => this.showHint());
        document.addEventListener("keydown", (event) => this.onKeyDown(event));

        // Adjust game settings based on difficulty
        this.adjustDifficultySettings();

        // Start the timer
        this.timer_interval = setInterval(() => this.updateTimer(), 1000);

        // Load the first question
        this.loadQuestion();
      }

      toggleTheme() {
          const currentTheme = document.documentElement.getAttribute('data-theme');
          const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
          document.documentElement.setAttribute('data-theme', newTheme);
          localStorage.setItem('theme', newTheme);
      }

      shuffleArray(array) {
        // Fisher-Yates shuffle
        for (let i = array.length - 1; i > 0; i--) {
          let j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
      }


      adjustDifficultySettings() {
          switch (this.difficulty) {
            case 'easy':
              this.time_per_question = 45;
              this.allowHints = true;
              this.objectList = this.getEasyObjects();
              break;
            case 'medium':
              this.time_per_question = 30;
              this.allowHints = true;
              this.objectList = this.getMediumObjects();
              break;
            case 'hard':
              this.time_per_question = 15;
              this.allowHints = false;
              this.objectList = this.getHardObjects();
              break;
            default:
              this.time_per_question = 30;
              this.allowHints = true;
              this.objectList = this.getMediumObjects();
          }

          this.remaining_time = this.time_per_question;
          this.total_objects = this.objectList.length;
          this.sequence = this.shuffleArray([...this.objectList]);
          this.progress_bar.max = this.total_objects;
      }

        // Define methods to get object lists for each difficulty level
      getEasyObjects() {
        // Return an array of Messier numbers for easy difficulty
        return [1, 13, 31, 42, 45, 51, 57, 81, 82, 104]; // Example objects
      }

      getMediumObjects() {
        // Return an array of Messier numbers for medium difficulty
        return Array.from({ length: 50 }, (_, i) => i + 1); // M1 to M50
      }

      getHardObjects() {
        // Return an array of Messier numbers for hard difficulty
        return Array.from({ length: 110 }, (_, i) => i + 1); // M1 to M110
      }

      updateLanguage(lang) {
        this.lang = lang;

        // Update UI texts
        document.getElementById('label-enter-number').textContent =
            translations[lang].enterNumber;
        this.submit_button.textContent = translations[lang].submit;
        this.pause_button.textContent = this.is_paused
            ? translations[lang].resume
            : translations[lang].pause;
        this.next_button.textContent = translations[lang].next;
        this.hint_button.textContent = translations[lang].hint;
        this.timer_label.textContent = `${translations[lang].timeRemaining}${this.remaining_time}${translations[lang].seconds}`;
        this.score_label.textContent = `${translations[lang].score}${this.score}`;
        this.theme_toggle_button = translations[lang].toggleTheme;

        // Update feedback label if it's showing a hint
        if (this.feedback_label.textContent.startsWith(translations[lang === 'en' ? 'ru' : 'en'].hintText)) {
          // Re-display the hint in the new language
          this.showHint();
        }
      }


      loadData() {
        // Load the Messier data with hints
        this.data = messierData;
      }

      loadQuestion() {
        if (this.current_index >= this.total_objects) {
          this.endGame();
          return;
        }

        this.waiting_for_next_question = false;

        // Reset timer
        this.remaining_time = this.time_per_question;
        this.timer_label.textContent = `${translations[this.lang].timeRemaining}${this.remaining_time}${translations[this.lang].seconds}`;

        // Clear input
        this.number_input.value = '';

        // Clear feedback
        this.feedback_label.textContent = "";
        this.feedback_label.style.color = "green";

        // Load images
        let mn = this.sequence[this.current_index];
        this.loadImages(mn, false);

        // Update progress bar
        this.progress_bar.value = this.current_index + 1;

        // Focus input
        this.number_input.focus();
      }

      loadImages(mn, show_full_map) {
        let photo_path = `photos_avif/M${mn}.avif`;
        let map_path = show_full_map
            ? `maps_avif/M${mn}_map_full.avif`
            : `maps_avif/M${mn}_map.avif`;

        // Set image sources
        this.photo_image.src = photo_path;
        this.map_image.src = map_path;
      }

      animateTransition() {
            // Prepare next images
            let next_index = this.current_index + 1;
            if (next_index >= this.total_objects) {
                this.endGame();
                return;
            }

            let mn = this.sequence[next_index];
            let next_photo_path = `photos_avif/M${mn}.avif`;
            let next_map_path = `maps_avif/M${mn}_map.avif`;

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

                // Update index and load question
                this.current_index += 1;
                this.loadQuestion();

                // Now set waiting_for_next_question to false
                this.waiting_for_next_question = false;
            }, 500); // Duration matches the CSS animation duration
        }

      nextQuestion() {
        if (this.is_paused) return;

        this.animateTransition();

        // Remove this line
        // this.waiting_for_next_question = false;
      }

      onSubmit() {
        if (this.is_paused) return;

        if (this.waiting_for_next_question) {
          this.skipToNextQuestion();
          return;
        }

        // Process answer
        let user_answer = parseInt(this.number_input.value);
        let correct_answer = this.sequence[this.current_index];

        if (user_answer === correct_answer) {
          this.correct_answers += 1;
          this.feedback_label.textContent = translations[this.lang].correct;
          this.feedback_label.className = 'feedback-label feedback-correct';
          this.score += Math.floor(
              10 + (this.remaining_time / this.time_per_question) * 10,
          );
        } else {
          this.feedback_label.textContent = `${translations[this.lang].incorrect}${correct_answer}.`;
          this.feedback_label.className = 'feedback-label feedback-incorrect';
          this.score -= 5;
        }

        // Update score label
        this.score_label.textContent = `${translations[this.lang].score}${this.score}`;

        // Display full map
        let mn = this.sequence[this.current_index];
        this.loadImages(mn, true);

        // Start timers
        this.waiting_for_next_question = true;

        if (this.feedback_timer) clearTimeout(this.feedback_timer);
        if (this.next_question_timer) clearTimeout(this.next_question_timer);

        this.feedback_timer = setTimeout(() => this.clearFeedback(), 2000);
        this.next_question_timer = setTimeout(() => this.nextQuestion(), 2000);
      }

      skipToNextQuestion() {
        // Stop timers
        if (this.feedback_timer) clearTimeout(this.feedback_timer);
        if (this.next_question_timer) clearTimeout(this.next_question_timer);

        // Clear feedback
        this.clearFeedback();

        // Proceed to next question
        this.nextQuestion();
      }

      clearFeedback() {
        this.feedback_label.textContent = "";
      }

      updateTimer() {
        if (this.is_paused || this.waiting_for_next_question) return;

        this.remaining_time -= 1;
        if (this.remaining_time <= 0) {
          this.feedback_label.textContent = translations[this.lang].timesUp;
          this.feedback_label.style.color = "red";

          // Display full map
          let mn = this.sequence[this.current_index];
          this.loadImages(mn, true);

          // Start timers
          this.waiting_for_next_question = true;

          if (this.feedback_timer) clearTimeout(this.feedback_timer);
          if (this.next_question_timer) clearTimeout(this.next_question_timer);

          this.feedback_timer = setTimeout(() => this.clearFeedback(), 2000);
          this.next_question_timer = setTimeout(
              () => this.nextQuestion(),
              2000,
          );
        } else {
          this.timer_label.textContent = `${translations[this.lang].timeRemaining}${this.remaining_time}${translations[this.lang].seconds}`;
        }
      }

      togglePause() {
        if (!this.is_paused) {
          this.is_paused = true;
          clearInterval(this.timer_interval);
          if (this.feedback_timer) clearTimeout(this.feedback_timer);
          if (this.next_question_timer) clearTimeout(this.next_question_timer);
          this.pause_button.textContent = translations[this.lang].resume;
          this.feedback_label.textContent = translations[this.lang].paused;
          this.feedback_label.className = 'feedback-label feedback-paused';
        } else {
          this.is_paused = false;
          this.timer_interval = setInterval(() => this.updateTimer(), 1000);
          if (this.waiting_for_next_question) {
            // Restart timers
            this.feedback_timer = setTimeout(() => this.clearFeedback(), 2000);
            this.next_question_timer = setTimeout(
                () => this.nextQuestion(),
                2000,
            );
          }
          this.pause_button.textContent = translations[this.lang].pause;
          this.feedback_label.textContent = "";
          this.feedback_label.className = 'feedback-label';
          this.number_input.focus();
        }
      }

      showHint() {
        if (this.is_paused) return;

        if (!this.allowHints) {
          this.feedback_label.textContent = translations[this.lang].hintsNotAllowed;
          this.feedback_label.className = 'feedback-label feedback-incorrect';
          return;
        }

        const mn = this.sequence[this.current_index];
        const objectInfo = this.data.find((obj) => obj.number === mn);

        if (objectInfo && objectInfo.hints && objectInfo.hints[this.lang]) {
          this.feedback_label.textContent = `${translations[this.lang].hintText}${objectInfo.hints[this.lang]}`;
          this.feedback_label.className = 'feedback-label feedback-hint';

          // Clear hint after 5 seconds
          setTimeout(() => this.clearFeedback(), 5000);
        } else {
          this.feedback_label.textContent = translations[this.lang].noHintAvailable;
          this.feedback_label.className = 'feedback-label feedback-hint';
        }
      }

      endGame() {
        let total_time = Math.floor((Date.now() - this.start_time) / 1000);
        this.feedback_label.textContent =
            `${translations[this.lang].gameOver}${this.score}` +
            `${translations[this.lang].correctAnswers}${this.correct_answers}/${this.total_objects}` +
            `${translations[this.lang].timeTaken}${total_time}${translations[this.lang].secondsSuffix}` +
            `\n${translations[this.lang].difficultyLevel}${translations[this.lang][this.difficulty]}`;
        this.feedback_label.style.color = "black";
        clearInterval(this.timer_interval);
        this.submit_button.disabled = true;
        this.next_button.disabled = true;
        this.pause_button.disabled = true;
        this.hint_button.disabled = true;
        this.number_input.disabled = true;
      }

      onKeyDown(event) {
        if (event.key === "Enter") {
          if (this.waiting_for_next_question) {
            this.skipToNextQuestion();
          } else {
            this.onSubmit();
          }
        } else if (event.key === " ") {
          this.togglePause();
        }
      }
    }
