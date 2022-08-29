import { useState } from 'react'
import { createStyles, useMantineTheme, Card, Text, Center, TextInput, Button } from '@mantine/core';
import { useFocusTrap } from '@mantine/hooks';

import { WorldMap } from '..';

const useStyles = createStyles((theme) => ({
  container: {
    height: '100vh',
    width: '100%',
  },
  infoCard: {
    position: 'fixed',
    top: 10,
  },
  inputCard: {
    position: 'fixed',
    bottom: 10,
  },
}));

export default function ({ question, description, country, onSubmitAnswer }) {
  const { classes } = useStyles();
  const focusTrapRef = useFocusTrap();
  const [answer, setAnswer] = useState('');

  const onInternalSubmit = () => {
    onSubmitAnswer(answer);
  }

  return (
    <div className={classes.container}>
      <Center style={{ width: '100%' }}>
        <Card
          className={classes.infoCard}
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
        </Card>
      </Center>
      <Center style={{ width: '100%' }}>
        <Card
          className={classes.inputCard}
          shadow="sm"
          p="md"
          ref={focusTrapRef}
        >
          <TextInput
            placeholder="Answer"
            value={answer}
            onChange={e => setAnswer(e.currentTarget.value)}
            data-autofocus
            autoComplete="off"
          />
          <Button fullWidth mt="sm" onClick={onInternalSubmit}>Submit</Button>
        </Card>
      </Center>
      <WorldMap highlightCountry={country} />
    </div>
  )
};