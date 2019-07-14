import { EventEmitter } from 'events';
import { Readable, Duplex } from 'stream';
import { Parser as HTMLParser } from 'htmlparser2';
import Logger from './logger';

const logger = new Logger('parser').logger;

export declare interface Parser {
    /**
     * Link found event - emitted whenever a URL link is found.
     * @event
     */
    on(event: 'link', listener: (url: string) => void): this;
    /**
     * Asset found event - emitted whenever a static asset is found.
     * @event
     */
    on(event: 'asset', listener: (url: string) => void): this;
    /**
     * Error event - emitted whenever the parser encounters an error.
     * @event
     */
    on(event: 'error', listener: (error: Error) => void): this;
    /**
     * End event - emitted when the parser has completed parsing the HTML stream.
     * @event
     */
    on(event: 'end', listener: () => void): this;
}

export class Parser extends EventEmitter implements Parser {
    public streamParser!: HTMLParser;
    /**
     * Parses a HTML stream for anchor (`<a></a>`) tags.
     * @param inputStream - `Readable` or `Duplex` stream of HTML.
     * @example
     * ```
     * const resolver = new URLResolver('http://www.example.com');
     * const fetcher = new Fetcher(resolver.startingUrl);
     * const htmlStream = await fetcher.getUrlResponse();
     * const parser = new Parser(htmlStream);
     *
     * // Set up event handlers to grab links.
     * parser.on('link', link => { // here's your link! });
     *
     * await parser.parse(); // Start parsing.
     * ```
     */
    constructor(private inputStream: Readable | Duplex) {
        super();
    }

    private isFollowableUrl(url: string): boolean {
        if (!url) return false;
        if (!url.trim().length) return false; // Make sure the href tag has SOME value.
        if (url.startsWith('//')) return false; // Filter out protocol-agnostic absolute URLs (these are probably 3rd party).
        if (url.startsWith('#')) return false; // Filter out hash URLs.
        if (url.includes(':') && !url.includes('://')) return false; // Filter out mailto:, tel:, etc.
        return true;
    }

    /**
     * Begin parsing the input HTML stream.
     *
     * Make sure to setup the `link`, `error` & `end` event listeners before you call this function.
     *
     * @event `link` when a hyperlink is found.
     * @event `asset` when a static asset is found.
     * @event `end` when parsing the HTML stream is done.
     * @returns HTMLParser instance.
     */
    public parse(): HTMLParser {
        this.streamParser = new HTMLParser({
            onopentag: (tagName: string, attribs: any) => {
                if (tagName === 'a') {
                    logger.trace('Found anchor tag!', attribs);
                    const href: string = attribs.href;
                    if (this.isFollowableUrl(href)) {
                        this.emit('link', href);
                    }
                } else if (['link', 'script', 'img'].includes(tagName)) {
                    const url = attribs.href || attribs.src;
                    if (url) {
                        this.emit('asset', url);
                    }
                }
            },
            onerror: /* istanbul ignore next (because this path is *LITERALLY* untestable) */ err => {
                this.emit('error', err);
            },
            onend: () => {
                this.emit('end');
            },
        }, { decodeEntities: true });

        this.inputStream.on('data', data => {
            this.streamParser.write(data);
        });
        this.inputStream.once('end', () => {
            this.inputStream.removeAllListeners();
            this.streamParser.end();
        });
        return this.streamParser;
    }
}

export default Parser;
