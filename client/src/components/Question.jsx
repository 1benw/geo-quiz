import GuessCountry from "./QuestionTypes/GuessCountry";

export default function ({ questionNum, questionData }) {
  switch(questionData?.type) {
    case 'guess-country':
      return <GuessCountry
        question={questionData.question}
        description={`Question ${questionNum + 1}`}
        country={questionData.data.id}
        onSubmitAnswer={a => console.log(a)}
      />
    default:
      return null;
  }
};