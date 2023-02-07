import { useState, useEffect } from 'react'
import { createStyles, useMantineTheme, Card, Text, Center, TextInput, Button, Transition } from '@mantine/core';
import { useFocusTrap } from '@mantine/hooks';

import { UnitedStatesMap } from '..';
import { useGameStore } from '../../hooks';

const useStyles = createStyles((theme) => ({
  container: {
    height: '100vh',
    width: '100%',
  },
  infoCard: {
    position: 'fixed',
    top: 20,
  },
  inputCard: {
    position: 'fixed',
    bottom: 10,
  },
}));

export default function ({ question, description, state, onSubmitAnswer }) {
  const { classes } = useStyles();
  const gameState = useGameStore(state => state.state);

  const onInternalSubmit = (selected) => {
    onSubmitAnswer(selected);
  };

  return (
    <div className={classes.container}>
      <Center style={{ width: '100%' }}>
        <Transition mounted={gameState !== 2} transition="slide-down" duration={500} timingFunction="ease">
          {(styles) => <Card
            className={classes.infoCard}
            style={styles}
            shadow="sm"
            p="md"
            mx="md"
          >
            <Text weight={500} size="lg">
              {question}
            </Text>

            {description && (
              <Text mt="xs" color="dimmed" size="sm">
                {description}
              </Text>
            )}
          </Card>}
        </Transition>
      </Center>
      <UnitedStatesMap highlightState={gameState === 2 ? state : null} onSelect={gameState === 1 ? onInternalSubmit : null} />
    </div>
  )
};