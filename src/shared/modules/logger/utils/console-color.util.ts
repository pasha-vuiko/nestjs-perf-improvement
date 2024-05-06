type ColorTextFn = (text: string | object) => string;

const isColorAllowed = (): boolean => !process.env.NO_COLOR;
const colorIfAllowed =
  (colorFn: ColorTextFn) =>
  (msg: string | object): string => {
    const text = typeof msg === 'object' ? JSON.stringify(msg) : msg;

    return isColorAllowed() ? colorFn(text) : text;
  };

export const blueConsole = colorIfAllowed(
  (text: string | object) => `\x1B[34m${text}\x1B[39m`,
);
export const greenConsole = colorIfAllowed(
  (text: string | object) => `\x1B[32m${text}\x1B[39m`,
);
export const yellowConsole = colorIfAllowed(
  (text: string | object) => `\x1B[33m${text}\x1B[39m`,
);
export const redConsole = colorIfAllowed(
  (text: string | object) => `\x1B[31m${text}\x1B[39m`,
);
export const magentaBrightConsole = colorIfAllowed(
  (text: string | object) => `\x1B[95m${text}\x1B[39m`,
);
export const cyanBrightConsole = colorIfAllowed(
  (text: string | object) => `\x1B[96m${text}\x1B[39m`,
);
export const cyanConsole = colorIfAllowed(
  (text: string | object) => `\x1B[36m${text}\x1B[39m`,
);
