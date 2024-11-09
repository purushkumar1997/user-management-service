import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LoggerService {
  constructor(private readonly logger: Logger) {}

  error(message: any, context: string) {
    this.logger.error(message, context);
  }

  warn(message: any, context: string) {
    this.logger.warn(message, context);
  }

  log(message: any, context: string) {
    this.logger.log(message, context);
  }

  debug(message: any, context: string) {
    this.logger.debug(message, context);
  }

  verbose(message: any, context: string) {
    this.logger.verbose(message, context);
  }
}
