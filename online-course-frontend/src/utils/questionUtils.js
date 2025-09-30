// src/utils/questionUtils.js

import { mockTestQuestions } from '../data/mockTestQuestions';

/**
 * Selects random questions from the question bank
 * @param {number} count - Number of questions to select (default: 10)
 * @param {Array} questionBank - The question bank to select from (default: mockTestQuestions)
 * @returns {Array} Randomly selected questions
 */
export const getRandomQuestions = (count = 10, questionBank = mockTestQuestions) => {
  if (!questionBank || questionBank.length === 0) {
    console.error('Question bank is empty or undefined');
    return [];
  }

  if (count > questionBank.length) {
    console.warn(`Requested ${count} questions but only ${questionBank.length} available. Returning all questions.`);
    return [...questionBank];
  }

  // Create a copy of the question bank to avoid mutating the original
  const shuffled = [...questionBank];
  
  // Fisher-Yates shuffle algorithm
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  // Take first 'count' questions
  const selectedQuestions = shuffled.slice(0, count);
  
  console.log(`🎯 Selected ${selectedQuestions.length} random questions from ${questionBank.length} total`);
  
  return selectedQuestions;
};

/**
 * Get questions by category
 * @param {string} category - Category to filter by
 * @param {number} count - Number of questions to return
 * @returns {Array} Filtered questions
 */
export const getQuestionsByCategory = (category, count = 10) => {
  const filtered = mockTestQuestions.filter(q => 
    q.category && q.category.toLowerCase() === category.toLowerCase()
  );
  return getRandomQuestions(count, filtered);
};

/**
 * Get questions by difficulty
 * @param {string} difficulty - 'easy', 'medium', 'hard'
 * @param {number} count - Number of questions to return
 * @returns {Array} Filtered questions
 */
export const getQuestionsByDifficulty = (difficulty, count = 10) => {
  const filtered = mockTestQuestions.filter(q => 
    q.difficulty && q.difficulty.toLowerCase() === difficulty.toLowerCase()
  );
  return getRandomQuestions(count, filtered);
};

/**
 * Get mixed questions from different categories
 * @param {number} count - Total number of questions
 * @returns {Array} Mixed questions
 */
export const getMixedQuestions = (count = 10) => {
  return getRandomQuestions(count, mockTestQuestions);
};