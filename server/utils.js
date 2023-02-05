const charSet = `ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789`;

// The `getRandomString` function is not written by me
export const getRandomString = (length, charSetOverride) => {
  let chars = charSetOverride;
  if (!chars) {
    chars = charSet;
  }
  let res = '';

  for (let i = 0; i < length; i++) {
    res += chars[Math.floor(Math.random() * chars.length)];
  }

  return res;
};

let generatedGameCodes = {};

export const generateGameCode = () => {
  let code = getRandomString(6);

  // If the Game code has been generated (and therefore possibly already an active game) then keep generating a new one until it isn't taken
  while (generatedGameCodes[code]) {
    code = getRandomString(6);
  };

  return code;
}

// The extra reward recieved for answering the question quickly e.g 1st, 2nd, 3rd fastest
const speedReward = {
  1: 5,
  2: 4,
  3: 3,
}

export const calculateScore = (playerId, correct, answerOrder) => {
  if (correct) {
    let pointBase = 5;

    const answerPos = answerOrder.findIndex(p => p == playerId) + 1;

    if (answerPos > 0 && speedReward[answerPos]) {
      pointBase += speedReward[answerPos]
    }

    return pointBase;
  } else {
    return 0;
  }
};