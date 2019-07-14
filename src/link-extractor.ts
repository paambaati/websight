import URLResolver from './url-resolver';
import Fetcher from './fetcher';
import Parser from './parser';
import Logger from './logger';

const logger = new Logger('link-extractor').logger;

/**
 * All links (outbound URLs and static assets) found in a page.
 */
export type Links = {
    /**
     * Outbound page URLs.
     */
    urls: Set<string>,
    /**
     * Static asset URLs.
     */
    assets: Set<string>,
};

export default class LinkExtractor {
    public parser!: Parser;
    /**
     * Extracts all the same-domain hyperlinks and static assets in a given page URL.
     * @param url - URL to fetch and extract links out of.
     * @example
     * ```
     * const linkExtractor = new Fetcher('http://www.example.com/index.html');
     *
     * await linkExtractor.getLinks(); // All hyperlinks & assets on page.
     * ```
     */
    constructor(private url: string) { }
    /**
     * Get all outbound links and static asset URLs in the page.
     * For outbound links, only own-domain and followable URLs are returned.
     * @returns All hyperlinks and static asset URLs found.
     */
    public async getLinks(): Promise<Links> {
        return new Promise(async (resolve, reject) => {
            const urls: string[] = [];
            const assets: Set<string> = new Set();
            const resolver = new URLResolver(this.url);
            const fetcher = new Fetcher(resolver.startingUrl);
            const htmlStream = await fetcher.getUrlResponse();
            // Attach event listeners first.
            htmlStream.on('error', err => {
                const statusCode: number = err['statusCode'];
                // Perhaps handle statusCode === 429 with rate-limiting?
                logger.error('Error fetching HTML!', {
                    url: fetcher.url,
                    statusCode,
                    message: err.message,
                });
                return reject(err);
            });
            this.parser = new Parser(htmlStream);
            this.parser.on('error', err => {
                logger.error('Error parsing HTML stream!', err);
                return reject(err);
            });
            this.parser.on('link', link => {
                const fullUrl = resolver.getAbsoluteUrl(link);
                if (fullUrl !== resolver.startingUrl) { // Make sure the page doesn't add itself.
                    urls.push(fullUrl);
                }
            });
            this.parser.on('asset', link => {
                const fullUrl = resolver.getAbsoluteUrl(link);
                if (fullUrl !== resolver.startingUrl) { // Make sure the page doesn't add itself.
                    assets.add(fullUrl);
                }
            });
            this.parser.once('end', () => {
                htmlStream.removeAllListeners();
                this.parser.removeAllListeners();
                return resolve({
                    urls: new Set(resolver.filterUrlsByDomain(urls)),
                    assets,
                });
            });
            // Now start processing the incoming HTML stream for <a> tags.
            this.parser.parse();
        });
    }
}
