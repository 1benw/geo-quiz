import { useState } from 'react';
import { createStyles, Text, Title, Button, Grid, Stack, Loader, Divider, Space } from '@mantine/core';
import { useGameStore } from '../hooks';

const useStyles = createStyles((theme) => ({
  container: {
    height: '95%',
    width: '100%',
  },
  quiz: {
    padding: '2.5% 0',
    textAlign: 'center',
  },
  playerList: {
    display: 'flex',
    flexDirection: 'column',
    height: '35%',
    textAlign: 'center',
    width: '90%',
    margin: '0 5%',
  },
  podiumsContainer: {
    minHeight: '20%',
    width: '100%',
    padding: '0 10%',
  },
  podium: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  podiumText: {
    display: 'flex',
    height: '100%',
    width: '100%',
    bottom: 0,
    '&.pos1': {
      height: '10%',
    },
    '&.pos2': {
      height: '50%',
    },
    '&.pos3': {
      height: '100%',
    }
  },
  podiumStand: {
    display: 'flex',
    background: theme.colors.blue,
    height: '100%',
    width: '100%',
  },
  buttonContainer: {
    padding: '0 10%',
  }
}));

function ordinal_suffix_of(i) {
  let j = i % 10, k = i % 100;

  if (j == 1 && k != 11) {
    return i + "st";
  }
  if (j == 2 && k != 12) {
    return i + "nd";
  }
  if (j == 3 && k != 13) {
    return i + "rd";
  }
  return i + "th";
}

function Podium({ position, name }) {
  const { classes } = useStyles();

  return (
    <div className={classes.podium}>
      <div className={`${classes.podiumText} pos${position}`}>
        <Text
          size="xl"
          style={{ alignSelf: 'flex-end', width: '100%' }}
          align="center"
        >
          {name}
        </Text>
      </div>
      <div className={`${classes.podiumStand}`}>
        <Text size="xl" align="center" style={{ alignSelf: 'center', width: '100%' }}>
          {ordinal_suffix_of(position)}
        </Text>
      </div>
    </div>
  )
}

export default function () {
  const { classes } = useStyles();

  const playerId = useGameStore(state => state.playerId);
  const players = useGameStore(state => state.players);
  const leave = useGameStore(state => state.leaveGame);
  const myPlacement = players.findIndex(p => p.id == playerId);

  return (
    <Stack justify="space-between" className={classes.container}>
      <div className={classes.quiz}>
        <Title align="center" order={1}>🌏 GeoQuiz 🌎</Title>
      </div>
      <Stack>
        <Title align="center" order={1}>You Placed {ordinal_suffix_of(myPlacement + 1)}!</Title>
      </Stack>
      <Divider my="md" size="sm" />
      <Grid className={classes.podiumsContainer}>
        <Grid.Col span={4}>
          <Podium position={2} name={players[1]?.name} />
        </Grid.Col>
        <Grid.Col span={4}>
          <Podium position={1} name={players[0]?.name} />
        </Grid.Col>
        <Grid.Col span={4}>
          <Podium position={3} name={players[2]?.name} />
        </Grid.Col>
      </Grid>
      <Divider my="md" size="sm" />
      <div className={classes.playerList}>
        <Title align="center" order={2}>Final Full Scoreboard</Title>
        <Space h="md" />
        {(players && players.length > 0) ? (
          <Grid style={{ overflow: 'auto', maxHeight: '100%' }}>
            {players.map((p, i) => {
                return <Grid.Col span={12} key={p.id}>
                    <Text
                    size="xl"
                    color={p.id === playerId && "blue"}
                    weight={p.id === playerId ? 700 : 500}
                    >
                        <Text size="xl" span color={"dimmed"} weight={500}>
                            {`${i + 1}. `}
                        </Text>
                            {p.name}
                        <Text size="xl" span color={"dimmed"} weight={500}>
                            {` - ${p.score} Points`}
                        </Text>
                    </Text>
                </Grid.Col>
            })}
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
      <div className={classes.buttonContainer}>
        <Button fullWidth onClick={leave}>Leave Game</Button>
      </div>
    </Stack>
  )
}