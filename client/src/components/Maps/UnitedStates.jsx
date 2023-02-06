import { createStyles, useMantineTheme } from '@mantine/core';
import { useState, useEffect } from 'react';
import { useGameStore } from '../../hooks';
import { Marker, ComposableMap, Geographies, Geography, Graticule } from 'react-simple-maps';

import ZoomableGroup from '../CustomZoomableGroup';
import ProvincesTopo from '../../../../topojson/ne_50m_admin_1_states_provinces_shortened.json';

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

const StateTopos = ProvincesTopo?.objects?.ne_50m_admin_1_states_provinces?.geometries?.filter(geo => geo.properties.adm0_a3 === "USA") ?? [];

export default function ({ highlightState, onSelect = null }) {
  const theme = useMantineTheme();
  const { classes } = useStyles();
  const answered = useGameStore(state => state.answered);
  const [center, setCenter] = useState([-100, 40]);
  const [zoom, setZoom] = useState(2);
  
  useEffect(() => {
    let interval;

    if (highlightState) {
      const stateProperties = StateTopos.find(c => c.properties.postal === highlightState)?.properties;
      setCenter(stateProperties ? [stateProperties.longitude, stateProperties.latitude] : [-100, 40]);
      setZoom(2);

      const zoomingTarget = stateProperties?.labelrank >= 6 ? 12 : 5;
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
      setZoom(2);
      setCenter([-100, 40]);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    }
  }, [highlightState, answered]);

  return (
    <div className={classes.container}>
      <ComposableMap
        width={1000}
        height={1000}
        style={{ height: '100%' }}
        projection="geoAlbersUsa"
        projectionConfig={{
          // rotate: [-100.0, 0, 0],
          // scale: 400
        }}
      >
        <ZoomableGroup center={center} maxZoom={12} minZoom={1.5} zoom={zoom}>
          <Geographies geography={ProvincesTopo}>
            {({ geographies }) =>
              geographies.map((geo) => {
                if (geo.properties.adm0_a3 === "USA") { // Don't Render Unless USA
                  return (
                    <Geography
                      key={geo.properties.name}
                      geography={geo}
                      strokeWidth={0.05}
                      style={{
                        default: {
                          fill: (highlightState && geo.properties.postal === highlightState) ? theme.colors.blue[8] : "#9998A3",
                          stroke: (highlightState && geo.properties.postal === highlightState) ? theme.colors.blue[8] : "#EAEAEC",
                          outline: "none"
                        },
                        hover: onSelect !== null ? {
                          fill: theme.colors.blue[8],
                          stroke: theme.colors.blue[8],
                          outline: "none"
                        } : {
                          fill: (highlightState && geo.properties.postal === highlightState) ? theme.colors.blue[8] : "#9998A3",
                          stroke: (highlightState && geo.properties.postal === highlightState) ? theme.colors.blue[8] : "#EAEAEC",
                          outline: "none"
                        },
                        pressed: {
                          fill: (highlightState && geo.properties.postal === highlightState) ? theme.colors.blue[8] : "#9998A3",
                          stroke: (highlightState && geo.properties.postal === highlightState) ? theme.colors.blue[8] : "#EAEAEC",
                          outline: "none"
                        }
                      }}
                      onClick={
                        onSelect !== null ? () => {
                          onSelect(geo.properties.postal);
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