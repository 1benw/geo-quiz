import { useState } from 'react'
import { createStyles, TextInput, Title, Button, Grid, Stack, NumberInput } from '@mantine/core';
import Earth from '../assets/earth.svg';

import { useGameStore } from '../hooks';

const useStyles = createStyles((theme) => ({
  container: {
    height: '90%',
    width: '100%',
  },
  quiz: {
    padding: '2.5% 0',
    textAlign: 'center',
  },
  actions: {
    padding: '0 15%',
  },
  button: {
    marginTop: '1%',
  },
  image: {
    width: '25vh',
    height: '25vh',
  },
}));

export default function () {
  const { classes } = useStyles();
  const [menuState, setMenuState] = useState(false);
  const [nickname, setNickname] = useState('');
  const [gamePin, setGamePin] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const connect = useGameStore(state => state.connect);

  const startGame = () => {
    connect(true, {
      nickname, 
      questions: numQuestions,
    });
    setMenuState(false);
    setNickname('');
  };

  const joinGame = () => {
    connect(false, {
      nickname,
      gamePin: gamePin,
      questions: numQuestions,
    });
    setMenuState(false);
    setNickname('');
    setGamePin('');
  };

  return (
    <Stack justify="space-between" className={classes.container}>
      <div className={classes.quiz}>
        <img className={classes.image} src={Earth} />
        <Title align="center" order={1}>🌏 GeoQuiz 🌎</Title>
      </div>
      {(menuState === 'start' &&
        <div className={classes.actions}>
          <Grid>
            <Grid.Col span={12}>
              <TextInput
                placeholder="Bob"
                label="Nickname"
                value={nickname}
                onChange={e => setNickname(e.currentTarget.value)}
                maxLength={20}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <NumberInput
                label="Number of Questions"
                value={numQuestions}
                onChange={num => setNumQuestions(parseInt(num))}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Button className={classes.button} fullWidth color="dark" onClick={() => setMenuState(false)}>Go Back</Button>
            </Grid.Col>
            <Grid.Col span={6}>
              <Button className={classes.button} fullWidth color="green" onClick={startGame}>New Game</Button>
            </Grid.Col>
          </Grid>
        </div>
      ) || (menuState === 'join' &&
        <div className={classes.actions}>
          <Grid>
            <Grid.Col span={12}>
              <TextInput
                placeholder="Game Pin"
                label="Game Pin"
                value={gamePin}
                onChange={e => setGamePin(e.currentTarget.value.toUpperCase())}
                maxLength={6}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <TextInput
                placeholder="Bob"
                label="Nickname"
                value={nickname}
                onChange={e => setNickname(e.currentTarget.value)}
                maxLength={20}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Button className={classes.button} fullWidth color="dark" onClick={() => setMenuState(false)}>Go Back</Button>
            </Grid.Col>
            <Grid.Col span={6}>
              <Button className={classes.button} fullWidth onClick={joinGame}>Join Game</Button>
            </Grid.Col>
          </Grid>
        </div>
        ) || (!menuState &&
          <div className={classes.actions}>
            <Grid>
              <Grid.Col span={6}>
                <Button className={classes.button} fullWidth color="green" onClick={() => setMenuState('start')}>New Game</Button>
              </Grid.Col>
              <Grid.Col span={6}>
                <Button className={classes.button} fullWidth onClick={() => setMenuState('join')}>Join Game</Button>
              </Grid.Col>
            </Grid>
          </div>
        )}
    </Stack>
  )
}