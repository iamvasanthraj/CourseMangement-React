import { mockTestQuestions } from '../data/mockTestQuestions';

export const getRandomQuestions = (num = 10) => {
  const questionsCopy = [...mockTestQuestions];

  // Shuffle using Fisher-Yates
  for (let i = questionsCopy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questionsCopy[i], questionsCopy[j]] = [questionsCopy[j], questionsCopy[i]];
  }

  return questionsCopy.slice(0, num);
};