import { useState } from 'react'
import { Loader, LoadingOverlay, Text, Stack } from '@mantine/core';

import { StartMenu, WaitingScreen, Question } from './components';

import { useGameStore } from './hooks';

function App() {
  const loading = useGameStore(state => state.loading);
  const loadingText = useGameStore(state => state.loadingText);

  const inGame = useGameStore(state => state.connected);
  const gameState = useGameStore(state => state.state);
  const currentQuestion = useGameStore(state => state.currentQuestion);
  const questionData = useGameStore(state => state.questionData);

  // Get the correct game component to display for the current game state
  const getGameComponent = () => {
    switch(gameState) {
      case 0:
        return <WaitingScreen />;
      case 1:
        return <Question
          questionNum={currentQuestion}
          questionData={questionData}
        />;
      case 2:
        
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
    </>
  )
}

export default App;
