import GuessCountry from "./QuestionTypes/GuessCountry";
import FindCountry from "./QuestionTypes/FindCountry";

import GuessUnitedStates from "./QuestionTypes/GuessUnitedStates";
import FindUnitedStates from "./QuestionTypes/FindUnitedStates";
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
    case 'find-country':
      return <FindCountry
        question={questionData.question}
        description={`Question ${questionNum + 1}`}
        country={questionData.data.id}
        onSubmitAnswer={sendAnswer}
      />
    case 'guess-united-states':
      return <GuessUnitedStates
        question={questionData.question}
        description={`Question ${questionNum + 1}`}
        state={questionData.data.id}
        onSubmitAnswer={sendAnswer}
      />
    case 'find-united-states':
      return <FindUnitedStates
        question={questionData.question}
        description={`Question ${questionNum + 1}`}
        state={questionData.data.id}
        onSubmitAnswer={sendAnswer}
      />
    default:
      return null;
  }
};