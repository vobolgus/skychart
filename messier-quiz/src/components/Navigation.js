/**
 * Navigation component for Messier Object Quiz
 * This will help with future migration to React
 */
export class Navigation {
  /**
   * Initialize navigation component
   * @param {Object} options - Configuration options
   * @param {Function} options.onLanguageToggle - Function to call when language is toggled
   * @param {Function} options.onThemeToggle - Function to call when theme is toggled
   */
  constructor(options = {}) {
    this.onLanguageToggle = options.onLanguageToggle || (() => {});
    this.onThemeToggle = options.onThemeToggle || (() => {});
    
    this.languageToggleBtn = document.getElementById('language-toggle');
    this.themeToggleBtn = document.getElementById('theme-toggle');
    
    // Set up event listeners
    this.setupEventListeners();
  }
  
  /**
   * Set up event listeners for navigation elements
   */
  setupEventListeners() {
    if (this.languageToggleBtn) {
      this.languageToggleBtn.addEventListener('click', () => {
        this.onLanguageToggle();
      });
    }
    
    if (this.themeToggleBtn) {
      this.themeToggleBtn.addEventListener('click', () => {
        this.onThemeToggle();
      });
    }
  }
  
  /**
   * Update navigation text based on language
   * @param {string} lang - Language code
   * @param {Object} translations - Translations object
   */
  updateLanguage(lang, translations) {
    const elements = {
      'language-toggle': translations[lang].language,
      'nav-home': translations[lang].home,
      'nav-play-game': translations[lang].playGame,
      'theme-toggle': translations[lang].toggleTheme
    };
    
    Object.entries(elements).forEach(([id, text]) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = text;
      }
    });
  }
}