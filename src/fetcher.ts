import { Duplex } from 'stream';
import got from 'got';
import HttpAgent, { HttpsAgent } from 'agentkeepalive';
import Logger from './logger';

const httpAgent = new HttpAgent({ keepAlive: true });
const httpsAgent = new HttpsAgent({ keepAlive: true });
const logger = new Logger('fetcher').logger;

export default class Fetcher {
    public response!: Duplex;
    /**
     * Fetches a given URL as a `Duplex` stream.
     * @param url - URL to fetch.
     * @example
     * ```
     * const fetcher = new Fetcher('http://www.example.com/index.html');
     *
     * await fetcher.getUrlResponse(); // HTTP `GET` response as Duplex stream.
     * ```
     */
    constructor(public url: string) { }

    /**
     * Send a request and return its response as a `Duplex` stream.
     * @param url - (Optional) URL to stream; defaults to `this.url`.
     * @param method - (Optional) HTTP method; defaults to `GET`.
     * @throws Will throw an error on non-200 responses.
     * @returns HTTP response as a stream.
     */
    public getUrlResponse(url = this.url, method = 'GET'): Duplex {
        logger.debug('Fetching', url);
        // @ts-ignore TS2345 (let us assign `null` to user-agent header).
        this.response = got.stream(url, {
            method,
            agent: { // Use a keep-alive agent because we're crawling just the one domain.
                http: httpAgent,
                https: httpsAgent,
            },
            timeout: 30000, // Timeout after 30 seconds.
            throwHttpErrors: true, // Throw on non-2xx errors.
            headers: {
                'user-agent': null, // Empty out the user-agent.
            },
        });
        return this.response;
    }
}
