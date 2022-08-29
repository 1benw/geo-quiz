import GuessCountryWorld from './guess-country-world.js';

const Questions = [
  GuessCountryWorld,
];

export const getQuestion = () => {
  return GuessCountryWorld.get();
};