// Each type of question has its own file
import GuessCountryWorld from './guess-country-world.js';
import FindCountryWorld from './find-country-world.js';

const Questions = {
  GuessCountryWorld,
  FindCountryWorld,
};

export const QuestionTypes = Object.keys(Questions);

export const getQuestion = (possibleTypes) => {
  // Randomly choose a question from the selected possibilities by the game creator
  const randomType = possibleTypes[Math.floor(Math.random() * possibleTypes.length)];

  return Questions[randomType].get();
};

export const checkAnswer = (type, questionData, answer) => {
  return Questions[type].checkAnswer(questionData, answer);
}