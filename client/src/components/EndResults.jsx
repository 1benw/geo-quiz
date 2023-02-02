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
    height: '60%',
    padding: '0 5%',
    textAlign: 'center',
  },
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

export default function () {
  const { classes } = useStyles();

  const playerId = useGameStore(state => state.playerId);
  const players = useGameStore(state => state.players);

  const myResults = players.find(p => p.id == playerId);

  return (
    <Stack justify="space-between" className={classes.container}>
      <div className={classes.quiz}>
        <Title align="center" order={1}>🌏 GeoQuiz 🌎</Title>
      </div>
      <Stack>
        <Title align="center" order={1}>You Came {myResults.score}{ordinal_suffix_of(myResults.score)}</Title>
      </Stack>
      <Divider my="md" size="sm" />
      <div className={classes.playerList}>
        <Title align="center" order={2}>Final Scoreboard</Title>
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
                        <Text size="xl" span color={"white"} weight={500}>
                            {`${i + 1}. `}
                        </Text>
                            {p.name}
                        <Text size="xl" span color={"white"} weight={500}>
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
    </Stack>
  )
}