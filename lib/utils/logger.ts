import pino from 'pino';

export const logger = pino({
  level: 'trace', // Pino uses 'trace' instead of 'silly'
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss.l',
      ignore: 'pid,hostname',
      singleLine: false,
      messageFormat: '{msg} {req.method} {req.url}', // optional
    },
  },
  base: undefined, // omit pid and hostname from logs
  timestamp: pino.stdTimeFunctions.isoTime, // can switch to epoch or custom
});
