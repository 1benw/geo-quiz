import { useState } from 'react'
import { createStyles, Text, Title, Button, Grid, NumberInput } from '@mantine/core';
import Earth from '../assets/earth.svg';

const useStyles = createStyles((theme) => ({
  container: {
    height: '90%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    textAlign: 'center',
  },
  quiz: {
    top: 0,
    height: '50%',
    padding: '2.5% 0',
  },
  actions: {
    bottom: 0,
    height: '10%',
    padding: '0 15%',
  },
  button: {
    marginTop: '1%',
  },
  image: {
    width: 350,
    height: 350,
  },
}));

export default function () {
  const { classes } = useStyles();
  const [menuState, setMenuState] = useState(false);
  const [gamePin, setGamePin] = useState(undefined);

  return (
    <div className={classes.container}>
      <div className={classes.quiz}>
        <img className={classes.image} src={Earth} />
        <Title order={1}>GeoQuiz</Title>
      </div>
      {(menuState === 'start' &&
        <div className={classes.actions}>
          <Grid>
            <Grid.Col span={6}>
              <Button className={classes.button} fullWidth color="dark" onClick={() => setMenuState(false)}>Go Back</Button>
            </Grid.Col>
            <Grid.Col span={6}>
              <Button className={classes.button} fullWidth color="green">Start New Game</Button>
            </Grid.Col>
          </Grid>
        </div>
      ) || (menuState === 'join' &&
        <div className={classes.actions}>
          <Grid>
            <Grid.Col span={12}>
              <NumberInput
                placeholder="Game Pin"
                label="Game Pin"
                hideControls
                value={gamePin}
                onChange={v => setGamePin(v)}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Button className={classes.button} fullWidth color="dark" onClick={() => setMenuState(false)}>Go Back</Button>
            </Grid.Col>
            <Grid.Col span={6}>
              <Button className={classes.button} fullWidth>Join Game</Button>
            </Grid.Col>
          </Grid>
        </div>
      ) || (!menuState &&
        <div className={classes.actions}>
          <Grid>
            <Grid.Col span={6}>
              <Button className={classes.button} fullWidth color="green" onClick={() => setMenuState('start')}>Start New Game</Button>
            </Grid.Col>
            <Grid.Col span={6}>
              <Button className={classes.button} fullWidth onClick={() => setMenuState('join')}>Join Game</Button>
            </Grid.Col>
          </Grid>
        </div>
      )}
    </div>
  )
}