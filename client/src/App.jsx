import { useState } from 'react'
import { Text } from '@mantine/core';

import { StartMenu, WaitingScreen } from './components';

import { useGameStore } from './hooks';

function App() {
  const inGame = useGameStore(state => state.connected);

  return (
    <>
      {inGame && <WaitingScreen />}
      {!inGame && <StartMenu />}
    </>
  )
}

export default App;
