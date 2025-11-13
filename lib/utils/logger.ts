import { createLogger, format, transports } from 'winston'
import { consoleFormat } from 'winston-console-format'

export const logger = createLogger({
  level: 'silly',
  format: format.combine(
    format.timestamp(),
    format.ms(),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
  ),
  exitOnError: true,
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize({ all: true }),
        format.padLevels(),
        consoleFormat({
          showMeta: true,
          metaStrip: ['timestamp', 'service'],
          inspectOptions: {
            depth: Infinity,
            colors: true,
            maxArrayLength: Infinity,
            breakLength: 120,
            compact: Infinity,
          },
        }),
      ),
    }),
    // new transports.File({filename: 'logs/exceptions.log', level: 'error'}),
    // new transports.File({filename: 'logs/info.log', level: 'info'}),
  ],
})
