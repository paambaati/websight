import URLResolver from './url-resolver';
import LinkExtractor, { Links } from './link-extractor';
import Sitemap from './sitemap';
import Logger from './logger';

const { logger } = new Logger('crawler');

export default class Crawler {
    public startingUrl: string;

    // ⚠️ Sitemap _can_ grow too big for very large sites.
    public sitemap: Sitemap;

    /**
     * Crawls a given website and builds a sitemap of all the links between pages.
     * @param url - Website address.
     * @example
     * ```
     * const crawler = new Crawler('www.example.com');
     * crawler.crawl();
     * // ..
     * // After you've determined crawl has completed, get sitemap.
     * crawler.sitemap.print();
     * ```
     */
    constructor(private url: string) {
        this.startingUrl = new URLResolver(url).startingUrl;
        this.sitemap = new Sitemap();
    }

    /**
     * Start crawling the given website.
     *
     * ⚡️**Does not ever resolve!**
     * @param url - Website address.
     * @param visitedUrls - URLs crawled so far (used for remembering recursion state).
     */
    public async crawl(url: string | null = this.startingUrl, visitedUrls: Set<string> = new Set([this.startingUrl])): Promise<void> { // eslint-disable-line max-len
        if (!url) return;
        let links: Links = {
            urls: new Set<string>(),
            assets: new Set<string>(),
        };
        const linkExtractor = new LinkExtractor(url);
        try {
            links = await linkExtractor.getLinks();
        } catch {
            return this.crawl(null, visitedUrls); // eslint-disable-line consistent-return
        }
        visitedUrls.add(url); // Getting outbound URLs was successful, so add it to visited URLs.
        this.sitemap.addLink(url, links);
        logger.debug(`Found ${links.urls.size} URLs and ${links.assets.size} static assets in ${url}`);
        links.urls.forEach(link => {
            if (!visitedUrls.has(link)) {
                logger.debug('New URL found', link);
                // Not await-ing this because we don't know when the recursion will complete.
                this.crawl(link, visitedUrls);
            }
        });
    }
}
