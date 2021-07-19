import winston from 'winston';
import {config} from './config';

// Imports the Google Cloud client library for Winston
const {LoggingWinston} = require('@google-cloud/logging-winston');

const loggingWinston = new LoggingWinston();

const transports = [];
transports.push(new winston.transports.Console());
if (config.environment === 'production') {
  transports.push(loggingWinston);
}

// Create a Winston logger that streams to Stackdriver Logging
// Logs will be written to: "projects/YOUR_PROJECT_ID/logs/winston_log"
export const logger = winston.createLogger({
  level: 'info',
  transports: transports,
});
