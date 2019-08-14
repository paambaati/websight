import pino from 'pino';

export default class Logger {
    private options: pino.LoggerOptions;

    public logger: pino.Logger;

    /**
     * Logging wrapper for [`pino`](https://github.com/pinojs/pino).
     * @param appName - Unique identifier in log (used as a prefix).
     * @param options - Additional options (see [`pino` options API](https://github.com/pinojs/pino/blob/master/docs/api.md#options)).
     * @example
     * ```
     * const logger = new Logger('crawler', { level: 'debug' }).logger;
     * // ...
     * logger.debug('here!');
     * ```
     */
    constructor(private appName: string, options?: pino.LoggerOptions) {
        if (!options) {
            const logLevelEnv = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : '';
            this.options = {
                name: this.appName,
                // Log levels - https://github.com/pinojs/pino/blob/master/docs/API.md#discussion-3
                level: logLevelEnv.length ? logLevelEnv : 'info',
                useLevelLabels: true,
            };
        } else {
            this.options = {
                name: this.appName,
                ...options,
            };
        }
        this.options.enabled = (this.options.level !== 'silent');
        this.options.serializers = {
            err: pino.stdSerializers.err,
        };
        this.logger = pino(this.options);
        return this;
    }
}
