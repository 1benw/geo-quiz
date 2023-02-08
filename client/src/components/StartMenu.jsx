import { useState } from 'react'
import { createStyles, TextInput, Title, Button, Grid, Stack, NumberInput, MultiSelect } from '@mantine/core';
import Earth from '../assets/earth.svg';

import { useGameStore } from '../hooks';
import { useEffect } from 'react';

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

const availableQuestionTypes = [
  { value: 'GuessCountryWorld', label: 'Guess the Country (World)', group: 'World' },
  { value: 'FindCountryWorld', label: 'Find the Country (World)', group: 'World' },
  { value: 'GuessStateUSA', label: 'Guess the State (USA)', group: 'United States' },
  { value: 'FindStateUSA', label: 'Find the State (USA)', group: 'United States' },
];

const defaultQuestionTypes = [
  "GuessCountryWorld"
];

export default function () {
  const { classes } = useStyles();
  const [menuState, setMenuState] = useState(false);
  const [options, setOptions] = useState({});
  const [questionTypeErr, setQuestionTypeErr] = useState(null);

  const changeMenu = (state) => {
    if (state === 'start') {
      setOptions({
        nickname: '',
        numQuestions: 5,
        questionTypes: [...defaultQuestionTypes],
      });
    } else if (state === 'join') {
      setOptions({
        nickname: '',
        joinCode: '',
      });
    } else {
      setOptions({});
    }

    setMenuState(state);
  };

  const changeOption = (option, val) => {
    setOptions({
      ...options,
      [option]: val,
    });
  };

  const connect = useGameStore(state => state.connect);
  const startGame = () => {
    connect(true, options);

    changeMenu(false);
  };

  const joinGame = () => {
    connect(false, options);

    changeMenu(false);
  };

  useEffect(() => {
    if (options?.questionTypes?.length <= 0) {
      setQuestionTypeErr(true);
    } else {
      setQuestionTypeErr(null);
    }
  }, [options]);

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
                value={options.nickname}
                onChange={e => changeOption('nickname', e.currentTarget.value)}
                maxLength={20}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <NumberInput
                label="Number of Questions"
                value={options.numQuestions}
                onChange={num => changeOption('numQuestions', parseInt(num))}
                min={5}
                max={30}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <MultiSelect
                label="Question Types"
                data={availableQuestionTypes}
                value={options.questionTypes}
                description="What types of question would you like to be included?"
                onChange={val => changeOption('questionTypes', val)}
                error={questionTypeErr}
                dropdownPosition="top"
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Button className={classes.button} fullWidth color="dark" onClick={() => changeMenu(false)}>Go Back</Button>
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
                value={options.joinCode}
                onChange={e => changeOption('joinCode', e.currentTarget.value.toUpperCase())}
                maxLength={6}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <TextInput
                placeholder="Bob"
                label="Nickname"
                value={options.nickname}
                onChange={e => changeOption('nickname', e.currentTarget.value)}
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
                <Button className={classes.button} fullWidth color="green" onClick={() => changeMenu('start')}>New Game</Button>
              </Grid.Col>
              <Grid.Col span={6}>
                <Button className={classes.button} fullWidth onClick={() => changeMenu('join')}>Join Game</Button>
              </Grid.Col>
            </Grid>
          </div>
        )}
    </Stack>
  )
}