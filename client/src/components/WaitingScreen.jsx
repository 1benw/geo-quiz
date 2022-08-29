import { useState } from 'react'
import { createStyles, Text, Title, Button, Grid, Stack, Loader, Divider, Space } from '@mantine/core';

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
  playerList: {
    height: '50%',
    padding: '0 5%',
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

  const playerId = useGameStore(state => state.playerId);
  const isHost = useGameStore(state => state.isHost);
  const players = useGameStore(state => state.players);
  const gameCode = useGameStore(state => state.code);
  const startGame = useGameStore(state => state.start);

  return (
    <Stack justify="space-between" className={classes.container}>
      <div className={classes.quiz}>
        <Title align="center" order={1}>🌏 GeoQuiz 🌎</Title>
      </div>
      <Stack>
        <Loader style={{ margin: 'auto' }} size="xl" color="blue" variant="bars" />
        <Title align="center" order={2}>Invite Others Using the Code <Text span color="blue" weight={700}>{gameCode}</Text></Title>
      </Stack>
      <Divider my="md" size="sm" />
      <div className={classes.playerList}>
        <Title align="center" order={2}>Connected Players</Title>
        <Space h="md" />
        {(players && players.length > 0) ? (
          <Grid grow>
            {players.map(p => (
              <Grid.Col span={4} key={p.id}>
                <Text
                  size="xl"
                  color={p.id === playerId && "blue"}
                  weight={p.id === playerId ? 700 : 500}
                >
                  {p.name}
                </Text>
              </Grid.Col>
            ))}
          </Grid>
        ) : (
          <Grid grow>
            <Grid.Col span={4}>
              <Text
                size="xl"
                weight={700}
              >
                No Players
              </Text>
            </Grid.Col>
          </Grid>
        )}
      </div>
      <Divider my="md" size="sm" />
      <div className={classes.actions}>
        <Grid grow>
          <Grid.Col span={6}>
            <Button className={classes.button} fullWidth color="green" onClick={startGame} disabled={!isHost}>Start Game</Button>
          </Grid.Col>
        </Grid>
      </div>
    </Stack>
  )
}