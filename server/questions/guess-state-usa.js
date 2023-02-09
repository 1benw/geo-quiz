import topoJson from '../../topojson/ne_50m_admin_1_states_provinces_shortened.json' assert {type: 'json'};
const nameProperties = ['name', 'postal']; // The names to compare answers against

// Filter to countries that are fully recognized and exclude dependencies etc
const states = topoJson.objects?.ne_50m_admin_1_states_provinces?.geometries.filter(c => c.properties.adm0_a3 === "USA");

const doesAnswerMatch = (a, s) => {
  return a.localeCompare(s, 'en', {
    usage: 'search',
    sensitivity: 'base',
    ignorePunctuation: true,
  }) === 0;
}

const GuessStateUSA = {
  id: 'GuessStateUSA',
  type: 'guess-united-states',
  name: 'Guess the State (USA)',
  region: 'usa',
  get(playedQuestions) {
    const playedQuestionsOfType = playedQuestions.filter(q => q.id === this.id);

    let randomState = states[Math.floor(Math.random() * states.length)];
    // If there has already been a question of this type with this state, randomly choose another.
    while (playedQuestionsOfType.find(q => q.data.id === randomState.properties.postal)) {
      randomState = states[Math.floor(Math.random() * states.length)];
    };

    return {
      time: Date.now(),
      id: this.id,
      type: this.type,
      question: `Name the Highlighted US State`,
      data: {
        id: randomState.properties.postal,
      },
      displayedAnswer: `The Correct Answer Was: ${randomState.properties.name}`,
    }
  },
  checkAnswer(questionData, answer) {
    const stateData = states.find(c => c.properties.postal === questionData.id);
    if (stateData) {
      for (const prop of nameProperties) {
        if (stateData.properties[prop].length > 0 && doesAnswerMatch(answer, stateData.properties[prop])) {
          return true;
        }
      }
    }
    return false;
  }
};

export default GuessStateUSA;