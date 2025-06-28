import winston from 'winston';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// === Коренева директорія для логів ===
const baseLogDir = path.join(__dirname, '..', '..', 'Logs');

// === Створення підпапки з timestamp ===
const timestamp = new Date().toISOString().replace(/[:.]/g, '-'); // безпечна для папки
const runLogDir = path.join(baseLogDir, `${timestamp}.log`);

if (!fs.existsSync(baseLogDir)) {
  fs.mkdirSync(baseLogDir);
}
if (!fs.existsSync(runLogDir)) {
  fs.mkdirSync(runLogDir);
}

// === Формат для логів ===
const fmt = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(info => `[${info.timestamp}] ${info.level.toUpperCase()}: ${info.message}`)
);

// === Функція для створення логера ===
function createLogger(name: string, level: 'info' | 'debug', logToConsole: boolean): winston.Logger {
  const transports: winston.transport[] = [
    new winston.transports.File({
      filename: path.join(runLogDir, `${name}.log`),
      level,
      format: fmt
    })
  ];

  if (logToConsole) {
    transports.push(new winston.transports.Console({ level, format: fmt }));
  }

  return winston.createLogger({
    level,
    transports
  });
}

// === EXPRESS LOGGER ===
export const expressLogger =
  process.env.IS_EXPRESS_LOGGER_ON === 'true'
    ? createLogger('express', 'info', process.env.EXPRESS_LOG_TO_CONSOLE === 'true')
    : winston.createLogger({ silent: true });

// === SEQUELIZE LOGGER ===
export const sequelizeLogger =
  process.env.IS_SEQUELIZE_LOGGER_ON === 'true'
    ? createLogger('sequelize', 'debug', process.env.SEQUELIZE_LOG_TO_CONSOLE === 'true')
    : winston.createLogger({ silent: true });

export const logSequelizeMessage = (msg: string) => {
  sequelizeLogger.debug(`[Sequelize-MOVIES] ${msg}`);
};

// === SERVICE LOGGER ===
export const serviceLogger =
  process.env.IS_SERVICE_LOGGER_ON === 'true'
    ? createLogger('service', 'info', process.env.SERVICE_LOG_TO_CONSOLE === 'true')
    : winston.createLogger({ silent: true });
