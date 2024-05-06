import PinoPretty from 'pino-pretty';

export default (): PinoPretty.PrettyStream =>
  PinoPretty({
    colorize: !process.env.NO_COLOR,
    levelFirst: true,
    translateTime: 'yyyy-mm-dd HH:MM:ss o',
  });
