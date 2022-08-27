const charSet = `ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789`;

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
  while (generatedGameCodes[code]) {
    code = getRandomString(6);
  };

  return code;
}