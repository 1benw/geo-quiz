import topoJson from '../../topojson/countries.json';

const validTypes = ['Sovereign country', 'Country', 'Sovereignty']; // Filter out dependencies
const countries = topoJson.objects?.ne_10m_admin_0_countries_gbr?.geometries.filter(c => validTypes.some(t => t === c.properties.TYPE));

// countries.forEach(c => {
//   console.log(c.properties.NAME_EN, '|', c.properties.NE_ID)
// })

const GuessCountryWorld = {
  id: 'guess-country-world',
  type: 'guess-country',
  name: 'Guess the Country (World)',
  region: 'world',
  get() {
    const randomCountry = countries[Math.floor(Math.random() * countries.length)];

    console.log(randomCountry.properties.NAME_EN)

    return {
      type: this.type,
      question: `Name the Highlighted Country`,
      data: {
        id: randomCountry.properties.ADM0_A3_GB,
      }
    }
  }
};

export default GuessCountryWorld;