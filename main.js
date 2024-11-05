 document.addEventListener('DOMContentLoaded', () => {
         if (document.getElementById('game-container')) {
             class MessierGame {
                 constructor() {
                     // Game variables
                     this.sequence = this.shuffleArray([...Array(110).keys()].map(i => i + 1)); // [1..110] shuffled
                     this.current_index = 0;
                     this.correct_answers = 0;
                     this.total_objects = 110;
                     this.is_paused = false;
                     this.time_per_question = 30;  // seconds
                     this.remaining_time = this.time_per_question;
                     this.score = 0;
                     this.start_time = Date.now();
                     this.waiting_for_next_question = false;
                     this.feedback_timer = null;
                     this.next_question_timer = null;
                     this.timer_interval = null;

                     // Data
                     this.data = [];  // to be loaded

                     // UI Elements
                     this.photo_image = document.getElementById('photo-image');
                     this.map_image = document.getElementById('map-image');
                     this.number_input = document.getElementById('number-input');
                     this.submit_button = document.getElementById('submit-button');
                     this.feedback_label = document.getElementById('feedback-label');
                     this.progress_bar = document.getElementById('progress-bar');
                     this.timer_label = document.getElementById('timer-label');
                     this.score_label = document.getElementById('score-label');
                     this.pause_button = document.getElementById('pause-button');
                     this.next_button = document.getElementById('next-button');
                     this.hint_button = document.getElementById('hint-button');

                     // Event listeners
                     this.submit_button.addEventListener('click', () => this.onSubmit());
                     this.pause_button.addEventListener('click', () => this.togglePause());
                     this.next_button.addEventListener('click', () => this.nextQuestion());
                     this.hint_button.addEventListener('click', () => this.showHint());
                     document.addEventListener('keydown', (event) => this.onKeyDown(event));

                     // Load data
                     this.loadData();

                     // Start the timer
                     this.timer_interval = setInterval(() => this.updateTimer(), 1000);

                     // Load the first question
                     this.loadQuestion();
                 }

                 shuffleArray(array) {
                     // Fisher-Yates shuffle
                     for (let i = array.length - 1; i > 0; i--) {
                         let j = Math.floor(Math.random() * (i + 1));
                         [array[i], array[j]] = [array[j], array[i]];
                     }
                     return array;
                 }

                 loadData() {
                     // Load data from table.txt
                     // Simulate the data
                     this.data = [];  // index 0 corresponds to M1, index 1 to M2, etc.

                     for (let i = 1; i <= 110; i++) {
                         this.data.push(`Hint for M${i}`);
                     }
                 }

                 loadQuestion() {
                     if (this.current_index >= this.total_objects) {
                         this.endGame();
                         return;
                     }

                     this.waiting_for_next_question = false;

                     // Reset timer
                     this.remaining_time = this.time_per_question;
                     this.timer_label.textContent = `Time Remaining: ${this.remaining_time}s`;

                     // Clear input
                     this.number_input.value = 1;

                     // Clear feedback
                     this.feedback_label.textContent = '';
                     this.feedback_label.style.color = 'green';

                     // Load images
                     let mn = this.sequence[this.current_index];
                     this.loadImages(mn, false);

                     // Update progress bar
                     this.progress_bar.value = this.current_index + 1;

                     // Focus input
                     this.number_input.focus();
                 }

                 loadImages(mn, show_full_map) {
                     let photo_path = `photos/M${mn}.jpg`;
                     let map_path = show_full_map ? `maps/M${mn}_map_full.png` : `maps/M${mn}_map.png`;

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
                 let next_photo_path = `photos/M${mn}.jpg`;
                 let next_map_path = `maps/M${mn}_map.png`;

                 // Create a new images container for next images

                 let next_images_container = document.createElement('div');
                 next_images_container.classList.add('images-container');
                 next_images_container.style.left = `${document.getElementById('image-container').offsetWidth}px`;  // Start to the right

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

                 // Force reflow
                 next_images_container.offsetHeight;

                 // Start animation
                 let current_images_container = document.getElementById('current-images-container');
                 current_images_container.style.left = `-${image_container.offsetWidth}px`;  // Move to the left
                 next_images_container.style.left = '0px';  // Move to center

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
                 }, 500);  // Duration matches the CSS transition duration
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
                         this.feedback_label.textContent = 'Correct!';
                         this.feedback_label.style.color = 'green';
                         this.score += Math.floor(10 + this.remaining_time / this.time_per_question * 10);
                     } else {
                         this.feedback_label.textContent = `Incorrect! The correct answer was M${correct_answer}.`;
                         this.feedback_label.style.color = 'red';
                         this.score -= 5;
                     }

                     // Update score label
                     this.score_label.textContent = `Score: ${this.score}`;

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
                     this.feedback_label.textContent = '';
                 }

                 updateTimer() {
                     if (this.is_paused || this.waiting_for_next_question) return;

                     this.remaining_time -= 1;
                     if (this.remaining_time <= 0) {
                         this.feedback_label.textContent = "Time's up! Moving to the next object.";
                         this.feedback_label.style.color = 'red';

                         // Display full map
                         let mn = this.sequence[this.current_index];
                         this.loadImages(mn, true);

                         // Start timers
                         this.waiting_for_next_question = true;

                         if (this.feedback_timer) clearTimeout(this.feedback_timer);
                         if (this.next_question_timer) clearTimeout(this.next_question_timer);

                         this.feedback_timer = setTimeout(() => this.clearFeedback(), 2000);
                         this.next_question_timer = setTimeout(() => this.nextQuestion(), 2000);
                     } else {
                         this.timer_label.textContent = `Time Remaining: ${this.remaining_time}s`;
                     }
                 }

                 togglePause() {
                     if (!this.is_paused) {
                         this.is_paused = true;
                         clearInterval(this.timer_interval);
                         if (this.feedback_timer) clearTimeout(this.feedback_timer);
                         if (this.next_question_timer) clearTimeout(this.next_question_timer);
                         this.pause_button.textContent = 'Resume';
                         this.feedback_label.textContent = 'Paused';
                         this.feedback_label.style.color = 'blue';
                     } else {
                         this.is_paused = false;
                         this.timer_interval = setInterval(() => this.updateTimer(), 1000);
                         if (this.waiting_for_next_question) {
                             // Restart timers
                             this.feedback_timer = setTimeout(() => this.clearFeedback(), 2000);
                             this.next_question_timer = setTimeout(() => this.nextQuestion(), 2000);
                         }
                         this.pause_button.textContent = 'Pause';
                         this.feedback_label.textContent = '';
                         this.number_input.focus();
                     }
                 }

                 showHint() {
                     if (this.is_paused) return;

                     let mn = this.sequence[this.current_index];
                     let info = this.data[mn - 1];  // Assuming first element is the hint
                     this.feedback_label.textContent = `Hint: ${info}`;
                     this.feedback_label.style.color = 'orange';

                     // Clear hint after 5 seconds
                     setTimeout(() => this.clearFeedback(), 5000);
                 }

                 endGame() {
                     let total_time = Math.floor((Date.now() - this.start_time) / 1000);
                     let end_message = `Game Over\nYour score: ${this.score}\n` +
                         `Correct answers: ${this.correct_answers}/${this.total_objects}\n` +
                         `Time taken: ${total_time} seconds`;
                     this.feedback_label.textContent = end_message;
                     this.feedback_label.style.color = 'black';
                     clearInterval(this.timer_interval);
                     this.submit_button.disabled = true;
                     this.next_button.disabled = true;
                     this.pause_button.disabled = true;
                     this.hint_button.disabled = true;
                     this.number_input.disabled = true;
                 }

                 onKeyDown(event) {
                     if (event.key === 'Enter') {
                         if (this.waiting_for_next_question) {
                             this.skipToNextQuestion();
                         } else {
                             this.onSubmit();
                         }
                     } else if (event.key === ' ') {
                         this.togglePause();
                     }
                 }
             }

             // Start the game
             let game = new MessierGame();
         }
     }
        );