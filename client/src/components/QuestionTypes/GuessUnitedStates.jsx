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
  const focusTrapRef = useFocusTrap();
  const [answer, setAnswer] = useState('');
  const gameState = useGameStore(state => state.state);

  const onInternalSubmit = () => {
    onSubmitAnswer(answer);
    setAnswer('');
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
      <Center style={{ width: '100%' }}>
        <Transition mounted={gameState !== 2} transition="slide-up" duration={500} timingFunction="ease">
          {(styles) => <Card
            className={classes.inputCard}
            shadow="sm"
            p="md"
            style={styles}
            ref={focusTrapRef}
          >
            <TextInput
              placeholder="Answer"
              value={answer}
              onChange={e => setAnswer(e.currentTarget.value)}
              data-autofocus
              autoComplete="off"
              onKeyDown={e => {
                if (e.key === "Enter") {
                  onInternalSubmit();
                }
              }}
            />
            <Button fullWidth mt="sm" onClick={onInternalSubmit}>Submit</Button>
          </Card>}
        </Transition>
      </Center>
      <UnitedStatesMap highlightState={state} />
    </div>
  )
};