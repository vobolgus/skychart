import { getMessierData, getObjectsForDifficulty } from './dataService.js';

/**
 * Core game logic for Messier Object Quiz
 * Separated from UI logic to make future migration to React easier
 */
export class MessierGameLogic {
  constructor(difficulty = 'medium', language = 'en') {
    // Game variables
    this.difficulty = difficulty;
    this.lang = language;
    this.sequence = [];
    this.current_index = 0;
    this.correct_answers = 0;
    this.is_paused = false;
    this.time_per_question = 30; // seconds
    this.remaining_time = this.time_per_question;
    this.score = 0;
    this.start_time = Date.now();
    this.waiting_for_next_question = false;
    this.total_objects = 0;
    this.allowHints = true;
    this.data = []; // to be loaded
    
    // Initialize game based on difficulty
    this.adjustDifficultySettings();
  }

  /**
   * Initialize game data
   */
  async initialize() {
    // Load data
    this.data = await getMessierData();
    return this;
  }

  /**
   * Shuffle array using Fisher-Yates algorithm
   */
  shuffleArray(array) {
    // Fisher-Yates shuffle
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * Adjust game settings based on difficulty
   */
  adjustDifficultySettings() {
    switch (this.difficulty) {
      case 'easy':
        this.time_per_question = 45;
        this.allowHints = true;
        break;
      case 'medium':
        this.time_per_question = 30;
        this.allowHints = true;
        break;
      case 'hard':
        this.time_per_question = 15;
        this.allowHints = false;
        break;
      default:
        this.time_per_question = 30;
        this.allowHints = true;
    }

    this.remaining_time = this.time_per_question;
    const objectList = getObjectsForDifficulty(this.difficulty);
    this.total_objects = objectList.length;
    this.sequence = this.shuffleArray([...objectList]);
  }

  /**
   * Get current Messier object number
   */
  getCurrentMessierNumber() {
    if (this.current_index >= this.total_objects) {
      return null;
    }
    return this.sequence[this.current_index];
  }

  /**
   * Check if answer is correct
   */
  checkAnswer(userAnswer) {
    if (this.is_paused || this.waiting_for_next_question) {
      return null;
    }

    const correct_answer = this.sequence[this.current_index];
    let result = {
      isCorrect: userAnswer === correct_answer,
      correctAnswer: correct_answer,
      score: this.score
    };

    if (result.isCorrect) {
      this.correct_answers += 1;
      this.score += Math.floor(10 + (this.remaining_time / this.time_per_question) * 10);
    } else {
      this.score -= 5;
    }

    result.newScore = this.score;
    this.waiting_for_next_question = true;
    
    return result;
  }

  /**
   * Move to next question
   */
  nextQuestion() {
    if (this.is_paused) return false;
    
    this.current_index += 1;
    this.waiting_for_next_question = false;
    this.remaining_time = this.time_per_question;
    
    return this.current_index < this.total_objects;
  }

  /**
   * Get hint for current question
   */
  getHint() {
    if (this.is_paused || !this.allowHints) {
      return {
        available: false,
        reason: this.is_paused ? 'paused' : 'not_allowed'
      };
    }

    const mn = this.sequence[this.current_index];
    const objectInfo = this.data.find((obj) => obj.number === mn);

    if (objectInfo && objectInfo.hints && objectInfo.hints[this.lang]) {
      return {
        available: true,
        text: objectInfo.hints[this.lang]
      };
    } else {
      return {
        available: false,
        reason: 'not_available'
      };
    }
  }

  /**
   * Toggle pause state
   */
  togglePause() {
    this.is_paused = !this.is_paused;
    return this.is_paused;
  }

  /**
   * Update timer by one second
   */
  updateTimer() {
    if (this.is_paused || this.waiting_for_next_question) {
      return false;
    }

    this.remaining_time -= 1;
    return this.remaining_time <= 0;
  }

  /**
   * Get end game statistics
   */
  getGameStats() {
    const total_time = Math.floor((Date.now() - this.start_time) / 1000);
    
    return {
      score: this.score,
      correctAnswers: this.correct_answers,
      totalObjects: this.total_objects,
      timeTaken: total_time,
      difficulty: this.difficulty
    };
  }

  /**
   * Check if game is over
   */
  isGameOver() {
    return this.current_index >= this.total_objects;
  }
}