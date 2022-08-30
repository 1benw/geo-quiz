import GuessCountry from "./QuestionTypes/GuessCountry";
import { useGameStore } from '../hooks';

export default function ({ questionNum, questionData }) {
  const sendAnswer = useGameStore(state => state.sendAnswer);

  switch(questionData?.type) {
    case 'guess-country':
      return <GuessCountry
        question={questionData.question}
        description={`Question ${questionNum + 1}`}
        country={questionData.data.id}
        onSubmitAnswer={sendAnswer}
      />
    default:
      return null;
  }
};