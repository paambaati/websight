import pino from 'pino';

export default class Logger {
    private defaultOptions: pino.LoggerOptions = {
        serializers: {
            err: pino.stdSerializers.err,
        },
    };

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
            this.options = {
                name: this.appName,
                ...this.defaultOptions,
            };
        } else {
            this.options = {
                name: this.appName,
                ...this.defaultOptions,
                ...options,
            };
        }
        this.options.enabled = this.shouldEnable(options);
        this.logger = pino(this.options);
        // Log levels — https://github.com/pinojs/pino/blob/master/docs/api.md#loggerlevel-string-gettersetter
        this.logger.level = process.env.LOG_LEVEL || this.options.level || 'info';
        return this;
    }

    /**
     * Tells if pino should be enabled.
     *
     * If `options.enabled` is set, then its value is returned as-is.
     * If `options.level` is set and it's value is 'silent', then enabled is set to `false`.
     * If neither of these cases are met, then it defaults to `true`.
     * @param options Logger options.
     */
    /* eslint-disable class-methods-use-this */
    private shouldEnable(options: pino.LoggerOptions | undefined): boolean {
        if (options) {
            if (Object.prototype.hasOwnProperty.call(options, 'enabled')) {
                return Boolean(options.enabled);
            } if (Object.prototype.hasOwnProperty.call(options, 'level')) {
                return options.level !== 'silent';
            }
        }
        return true;
    }
}
