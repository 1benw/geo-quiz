import { createStyles, useMantineTheme } from '@mantine/core';
import { useState, useEffect } from 'react';
import { useGameStore } from '../../hooks';
import { Marker, ComposableMap, Geographies, Geography, Graticule } from 'react-simple-maps';

import ZoomableGroup from '../CustomZoomableGroup';
import WorldTopo from '../../../../topojson/ne_50m_admin_0_countries2.json';

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

const CountryTopos = WorldTopo?.objects?.ne_50m_admin_0_countries?.geometries ?? [];

export default function ({ highlightCountry, onSelect = null }) {
  const theme = useMantineTheme();
  const { classes } = useStyles();
  const answered = useGameStore(state => state.answered);
  const [state, setState] = useState({
    zoom: 30,
    center: [0, 0]
  });
  
  useEffect(() => {
    const countryProperties = CountryTopos.find(c => c.properties.ADM0_A3_GB === highlightCountry)?.properties;
    console.log(countryProperties?.scalerank)
    setState({
      zoom: countryProperties?.scalerank > 0 ? 50 : 6,
      center: countryProperties ? [countryProperties.LABEL_X, countryProperties.LABEL_Y] : [0, 0],
    });
  }, [highlightCountry, answered]);

  return (
    <div className={classes.container}>
      <ComposableMap
        width={1000}
        height={1000}
        style={{ height: '100%' }}
        projection="geoMercator"
        projectionConfig={{
          // rotate: [-100.0, 0, 0],
          // scale: 400
        }}
      >
        <ZoomableGroup center={state.center} maxZoom={30} minZoom={4} zoom={state.zoom}>
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
                          onSelect(geo.properties.ADM0_A3_GB);
                        } : null
                      }
                    />
                  )
                }
              })
            }
          </Geographies>
          {(highlightCountry && state.center) && <Marker coordinates={state.center}>
            <circle r={1} fill={`${theme.colors.red[8]}B2`} />
          </Marker>}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  )
}