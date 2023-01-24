import { useState, lazy } from 'react'
import { createStyles, Loader, LoadingOverlay, Text, Stack, Transition } from '@mantine/core';

import { StartMenu, WaitingScreen, Question, RoundResults } from './components';

import { useGameStore } from './hooks';

import WorldTopo from '../../topojson/countries.json';

const useStyles = createStyles((theme) => ({
  resultOverlay: {
    position: 'fixed',
    top: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
    background: '#1a1b1ebf',
    backdropFilter: 'blur(.5px)',
  }
}));


function App() {
  const { classes } = useStyles();
  const loading = useGameStore(state => state.loading);
  const loadingText = useGameStore(state => state.loadingText);

  const inGame = useGameStore(state => state.connected);
  const gameState = useGameStore(state => state.state);
  const currentQuestion = useGameStore(state => state.currentQuestion);
  const questionData = useGameStore(state => state.questionData);

  console.log(WorldTopo)

  // Get the correct game component to display for the current game state
  const getGameComponent = () => {
    switch(gameState) {
      case 0:
        return <WaitingScreen />;
      case 1:
      case 2:
        return <Question
          questionNum={currentQuestion}
          questionData={questionData}
        />;
    }
  }

  return (
    <>
      <LoadingOverlay
        loader={
          <Stack style={{ width: '50vw' }}>
            <Loader style={{ margin: 'auto' }} size="xl" color="blue" variant="bars" />
            {loadingText && <Text align="center" size="lg" weight={500} style={{ width: '100%' }}>
              {loadingText}
            </Text>}
          </Stack>
        }
        visible={loading}
        overlayBlur={3}
        transitionDuration={500}
      />
      {!inGame && <StartMenu />}
      {inGame && getGameComponent()}
      <Transition mounted={inGame && gameState == 2} transition="fade" duration={400} timingFunction="ease">
        {(styles) => <div className={classes.resultOverlay} style={styles}>
          <RoundResults />
        </div>}
      </Transition>
      {/* {(inGame && gameState == 2) && (
        <div className={classes.resultOverlay}>
          <RoundResults />
        </div>
      )} */}
    </>
  )
}

export default App;
