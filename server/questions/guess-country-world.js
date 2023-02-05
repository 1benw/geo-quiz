import topoJson from '../../topojson/ne_50m_admin_0_countries2.json' assert {type: 'json'};
const nameProperties = ['NAME', 'NAME_LONG', 'NAME_EN', 'NAME_SORT', 'FORMAL_EN']; // The names to compare answers against
// Filter to countries that are fully recognized and exclude dependencies etc
const countries = topoJson.objects?.ne_50m_admin_0_countries?.geometries.filter(c => c.properties.FCLASS_ISO === "Admin-0 country");

const doesAnswerMatch = (a, s) => {
  // Replace St. and St with Saint so that even the abbrevation matches certain countries
  return a.replace('St.', 'Saint').replace('St ', 'Saint').localeCompare(s, 'en', {
    usage: 'search',
    sensitivity: 'base',
    ignorePunctuation: true,
  }) === 0;
}

const GuessCountryWorld = {
  id: 'GuessCountryWorld',
  type: 'guess-country',
  name: 'Guess the Country (World)',
  region: 'world',
  get() {
    const randomCountry = countries[Math.floor(Math.random() * countries.length)];

    return {
      time: Date.now(),
      id: this.id,
      type: this.type,
      question: `Name the Highlighted Country`,
      data: {
        id: randomCountry.properties.ADM0_A3_GB,
      },
      displayedAnswer: `The Correct Answer Was: ${randomCountry.properties.NAME_EN}`,
    }
  },
  checkAnswer(questionData, answer) {
    const countryData = countries.find(c => c.properties.ADM0_A3_GB === questionData.id);
    if (countryData) {
      // Check if the answer matches any of the possible known names for a country (long name, formal name, etc)
      for (const prop of nameProperties) {
        if (countryData.properties[prop].length > 0 && doesAnswerMatch(answer, countryData.properties[prop])) {
          return true;
        }
      }

      // Check if the answer matches any of the country codes too (e.g France === FRA)
      if (answer === countryData.properties.ADM0_A3_GB || answer === countryData.properties.ISO_A2_EH) {
        return true;
      }
    }
    return false;
  }
};

export default GuessCountryWorld;