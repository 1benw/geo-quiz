import { createStyles, useMantineTheme } from '@mantine/core';

import { ComposableMap, Geographies, Geography, Graticule, ZoomableGroup } from 'react-simple-maps';

import WorldTopo from '../../../../topojson/countries.json';

const useStyles = createStyles((theme) => ({
  container: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    textAlign: 'center',
    transition: '0.5s',
  },
}));

const CountryTopos = WorldTopo?.objects?.ne_10m_admin_0_countries_gbr?.geometries ?? [];

export default function ({ highlightCountry, onSelect = null }) {
  const theme = useMantineTheme();
  const { classes } = useStyles();

  let countryProperties = null;
  if (highlightCountry) {
    countryProperties = CountryTopos.find(c => c.properties.ADM0_A3_GB === highlightCountry)?.properties;
    console.log(countryProperties);
  }

  const mapCenter = countryProperties ? [countryProperties.LABEL_X, countryProperties.LABEL_Y] : [0, 0];

  return (
    <div className={classes.container}>
      <ComposableMap
        width={1000}
        height={1000}
        style={{ height: '100%' }}
        projection="geoMercator"
        projectionConfig={{
          //rotate: [-100.0, 0, 0],
          //scale: 400
        }}
      >
        <ZoomableGroup center={mapCenter} maxZoom={30} minZoom={4} zoom={countryProperties?.scalerank > 0 ? 30 : 6}>
          <Geographies geography={WorldTopo}>
            {({ geographies }) =>
              geographies.map((geo) => {
                if (geo.properties.ADM0_A3_GB != "ATA") {
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      strokeWidth={0.1}
                      style={{
                        default: {
                          fill: (highlightCountry && geo.properties.ADM0_A3_GB === highlightCountry) ? theme.colors.blue[8] : "#9998A3",
                          stroke: (highlightCountry && geo.properties.ADM0_A3_GB === highlightCountry) ? theme.colors.blue[8] : "#EAEAEC",
                          outline: "none"
                        },
                        hover: onSelect !== null ? {
                          fill: theme.colors.blue[8],
                          stroke: theme.colors.blue[8],
                          outline: "none"
                        } : {
                          fill: (highlightCountry && geo.properties.ADM0_A3_GB === highlightCountry) ? theme.colors.blue[8] : "#9998A3",
                          stroke: (highlightCountry && geo.properties.ADM0_A3_GB === highlightCountry) ? theme.colors.blue[8] : "#EAEAEC",
                          outline: "none"
                        },
                        pressed: {
                          outline: "none"
                        }
                      }}
                      onClick={
                        onSelect !== null ? () => {
                          console.log(geo.properties.ADM0_A3_GB);
                          onSelect(geo.properties.ADM0_A3_GB);
                        } : null
                      }
                    />
                  )
                }
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  )
}