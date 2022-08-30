import GuessCountryWorld from './guess-country-world.js';

const Questions = [
  GuessCountryWorld,
];

export const getQuestion = () => {
  return GuessCountryWorld.get();
};

export const checkAnswer = (type, questionData, answer) => {
  return GuessCountryWorld.checkAnswer(questionData, answer);
}