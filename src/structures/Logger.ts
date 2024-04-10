import pino from "pino";

/**
 * The `export class Logger {` statement is defining a TypeScript class called `Logger` that is being exported for use in other modules. This class contains methods for logging different levels of messages (fatal, error, warn, info, debug, trace) using the `pino` logging library. The constructor initializes a `pino` logger with the specified log level and configuration options.
 *
 * @class
 * @name Logger
 * @kind class
 * @exports
 */
export class Logger {
  private logger: pino.Logger;

  constructor(level: string = "info") {
    this.logger = pino({
      level: level,
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      },
    });
  }

  public fatal(message: string, obj?: object): void {
    this.logger.fatal(obj, message);
  }

  public error(message: string, obj?: object): void {
    this.logger.error(obj, message);
  }

  public warn(message: string, obj?: object): void {
    this.logger.warn(obj, message);
  }

  public info(message: string, obj?: object): void {
    this.logger.info(obj, message);
  }

  public debug(message: string, obj?: object): void {
    this.logger.debug(obj, message);
  }

  public trace(message: string, obj?: object): void {
    this.logger.trace(obj, message);
  }

  public getLogger(): pino.Logger {
    return this.logger;
  }
}
