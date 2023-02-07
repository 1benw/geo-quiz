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
    height: '60%',
    padding: '0 5%',
    textAlign: 'center',
  },
}));

export default function () {
  const { classes } = useStyles();

  const playerId = useGameStore(state => state.playerId);
  const players = useGameStore(state => state.players);
  const gameCode = useGameStore(state => state.code);

  const question = useGameStore(state => state.questionData);
  const results = useGameStore(state => state.latestResults);
  const answer = useGameStore(state => state.latestAnswer);

  const myResults = results?.[playerId];

  const getResultComponent = () => {
    // They answered in time and was correct
    if (myResults?.correct) {
      return <Title align="center" order={1}>Your Answer Was <Text span color="blue" weight={700}>Correct</Text>!  🎉</Title>;
    } else if (myResults?.timeOut) { // They did not answer in time
      return <Title align="center" order={1}>You <Text span color="red" weight={700}>Ran Out of Time</Text>  ⏰</Title>;
    } else { // They answered in time but were wrong
      return <Title align="center" order={1}>Your Answer Was <Text span color="red" weight={700}>Incorrect</Text>  😢</Title>;
    }
  };

  return (
    <Stack justify="space-between" className={classes.container}>
      <div className={classes.quiz}>
        <Title align="center" order={1}>🌏 GeoQuiz 🌎</Title>
      </div>
      <Stack>
        <Title align="center" order={2}>{question?.question}</Title>
        {getResultComponent()}
        <Title align="center" order={2}>{answer}</Title>
      </Stack>
      <Divider my="md" size="sm" />
      <div className={classes.playerList}>
        <Title align="center" order={2}>Current Scoreboard</Title>
        <Space h="md" />
        {(players && players.length > 0) ? (
          <Grid style={{ overflow: 'auto', maxHeight: '100%' }}>
            {players.map((p, i) => {
                const pointsEarned = results[p.id]?.score;

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
                        <Text size="xl" span color={pointsEarned > 0 ? "green" : "red"} weight={500}>
                            {` (+${pointsEarned}${results[p.id].timeOut ? " - Timed Out" : ""})`}
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