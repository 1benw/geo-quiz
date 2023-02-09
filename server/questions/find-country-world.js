import topoJson from '../../topojson/ne_50m_admin_0_countries_shortened.json' assert {type: 'json'};

// Filter to countries that are fully recognized and exclude dependencies etc
// Also Exclude Vatican City (VAT) because it is too small to select properly
const countries = topoJson.objects?.ne_50m_admin_0_countries?.geometries.filter(c => c.properties.FCLASS_ISO === "Admin-0 country" && c.properties.ADM0_A3_GB !== "VAT");

const FindCountryWorld = {
  id: 'FindCountryWorld',
  type: 'find-country',
  name: 'Find the Country (World)',
  region: 'world',
  get(playedQuestions) {
    const playedQuestionsOfType = playedQuestions.filter(q => q.id === this.id);

    let randomCountry = countries[Math.floor(Math.random() * countries.length)];
     // If there has already been a question of this type with this country, randomly choose another.
    while (playedQuestionsOfType.find(q => q.data.id === randomCountry.properties.ADM0_A3_GB)) {
      randomCountry = countries[Math.floor(Math.random() * countries.length)];
    };

    return {
      time: Date.now(),
      id: this.id,
      type: this.type,
      question: `Select ${randomCountry.properties.NAME_EN} on the Map`,
      data: {
        id: randomCountry.properties.ADM0_A3_GB,
      },
      displayedAnswer: `The Correct Answer Is Now Highlighted`,
    }
  },
  checkAnswer(questionData, answer) {
    return questionData.id === answer;
  }
};

export default FindCountryWorld;