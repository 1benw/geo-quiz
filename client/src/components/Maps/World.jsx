import { createStyles, useMantineTheme } from '@mantine/core';
import { useState, useEffect } from 'react';
import { useGameStore } from '../../hooks';
import { Marker, ComposableMap, Geographies, Geography, Graticule } from 'react-simple-maps';

import ZoomableGroup from '../CustomZoomableGroup';
import WorldTopo from '../../../../topojson/ne_50m_admin_0_countries_shortened.json';

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
  const [center, setCenter] = useState([0, 40]);
  const [zoom, setZoom] = useState(4);
  
  useEffect(() => {
    let interval;

    if (highlightCountry) {
      const countryProperties = CountryTopos.find(c => c.properties.ADM0_A3_GB === highlightCountry)?.properties;

      setCenter(countryProperties ? [countryProperties.LABEL_X, countryProperties.LABEL_Y] : [0, 0]);
      setZoom(2);

      const zoomingTarget = countryProperties?.LABELRANK >= 6 ? 40 : 6;
      let zooming = 2
      interval = setInterval(() => {
        if (zooming <= zoomingTarget) {
          zooming += 0.02;
          setZoom(zooming);
        } else {
          clearInterval(interval);
          interval = null;
        }
      }, 5);
    } else {
      setZoom(4);
      setCenter([0, 40]);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    }
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
        <ZoomableGroup center={center} maxZoom={100} minZoom={4} zoom={zoom}>
          <Geographies geography={WorldTopo}>
            {({ geographies }) =>
              geographies.map((geo) => {
                if (geo.properties.ADM0_A3_GB != "ATA") { // Don't Render Antartica
                  return (
                    <Geography
                      key={geo.properties.NAME}
                      geography={geo}
                      strokeWidth={0.05}
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
                          fill: (highlightCountry && geo.properties.ADM0_A3_GB === highlightCountry) ? theme.colors.blue[8] : "#9998A3",
                          stroke: (highlightCountry && geo.properties.ADM0_A3_GB === highlightCountry) ? theme.colors.blue[8] : "#EAEAEC",
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
          {(highlightCountry && center) && <Marker coordinates={center}>
            <circle r={1} fill={`${theme.colors.red[8]}B2`} />
          </Marker>}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  )
}