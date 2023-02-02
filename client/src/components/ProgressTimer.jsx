import { useState, useEffect } from 'react'
import { createStyles, Progress, Transition } from '@mantine/core';
import { useGameStore } from '../hooks';

const useStyles = createStyles((theme) => ({
  progressBar: {
    position: 'fixed',
    top: 0,
    height: 10,
    width: '100%',
    zIndex: 10000,
  },
  bar: {
    transition: 'width .5s linear',
    backgroundColor: theme.colors.grape,
  }
}));

export default function () {
  const { classes } = useStyles();
  const timerEnd = useGameStore(state => state.progressTimerEnd);
  const timerLength = useGameStore(state => state.progressTimer);
  const clearTimer = useGameStore(state => state.clearProgressTimer);

  const [val, setVal] = useState(100);

  useEffect(() => {
    let interval;
    if (timerEnd) {
      interval = setInterval(() => {
        if (timerLength) {
          const percent = Math.floor((timerEnd - Date.now()) / timerLength * 100);
          if (percent >= 0) {
            setVal(percent);
          } else {
            clearTimer();
          }
        }
      }, 500);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
        setVal(100);
        interval = null;
      }
    }
  }, [timerEnd]);

  return (
    <Transition mounted={timerLength} transition="slide-down" duration={500} timingFunction="ease">
      {(styles) => <Progress
        style={styles}
        classNames={{
          root: classes.progressBar,
          bar: classes.bar,
        }}
        radius="xs"
        value={val}
      />}
    </Transition>
  )
}