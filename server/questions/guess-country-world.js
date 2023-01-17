import topoJson from '../../topojson/countries.json' assert {type: 'json'};

const validTypes = ['Sovereign country', 'Country', 'Sovereignty']; // Filter out dependencies
const nameProperties = ['NAME', 'NAME_LONG', 'NAME_EN', 'NAME_SORT', 'FORMAL_EN'] // The names to compare answers against
const countries = topoJson.objects?.ne_10m_admin_0_countries_gbr?.geometries.filter(c => validTypes.some(t => t === c.properties.TYPE));

const doesAnswerMatch = (a, s) => {
  // Replace St. and St with Saint so that even the abbrevation matches certain countries
  return a.replace('St.', 'Saint').replace('St ', 'Saint').localeCompare(s, 'en', {
    usage: 'search',
    sensitivity: 'base',
    ignorePunctuation: true,
  }) === 0;
}

const GuessCountryWorld = {
  id: 'guess-country-world',
  type: 'guess-country',
  name: 'Guess the Country (World)',
  region: 'world',
  get() {
    const randomCountry = countries[Math.floor(Math.random() * countries.length)];
    console.log(randomCountry.properties.NAME_EN)

    return {
      time: Date.now(),
      type: this.type,
      question: `Name the Highlighted Country`,
      data: {
        id: randomCountry.properties.ADM0_A3_GB,
      }
    }
  },
  checkAnswer(questionData, answer) {
    const countryData = countries.find(c => c.properties.ADM0_A3_GB === questionData.id);
    if (countryData) {
      for (const prop of nameProperties) {
        if (countryData.properties[prop].length > 0 && doesAnswerMatch(answer, countryData.properties[prop])) {
          return true;
        }
      }

      if (answer === countryData.properties.ADM0_A3_GB || answer === countryData.properties.ISO_A2_EH) {
        return true;
      }
    }
    return false;
  }
};

export default GuessCountryWorld;