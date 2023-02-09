import topoJson from '../../topojson/ne_50m_admin_1_states_provinces_shortened.json' assert {type: 'json'};

// Filter to US States (exlude canadian provinces etc)
const states = topoJson.objects?.ne_50m_admin_1_states_provinces?.geometries.filter(c => c.properties.adm0_a3 === "USA");

const FindStateUSA = {
  id: 'FindStateUSA',
  type: 'find-united-states',
  name: 'Find the State (USA)',
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
      question: `Select ${randomState.properties.name} on the Map`,
      data: {
        id: randomState.properties.postal,
      },
      displayedAnswer: `The Correct Answer Is Now Highlighted`,
    }
  },
  checkAnswer(questionData, answer) {
    return questionData.id === answer;
  }
};

export default FindStateUSA;