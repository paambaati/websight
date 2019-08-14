import { Links } from './link-extractor';

export default class Sitemap {
    public sitemap: Map<string, Links>;

    /**
     * Builds a sitemap of URLs and their child links.
     * @example
     * ```
     * const sitemap = new Sitemap();
     * sitemap.addLink('http://www.example.com', new Set([
     *  'http://www.example.com/page-1',
     *  'http://www.example.com/page-2'
     * ], new Set([
     *  'http://www.example.com/styles.css',
     * ])));
     *
     * sitemap.print(); // Print ASCII sitemap.
     * ```
     */
    constructor() {
        this.sitemap = new Map();
    }

    private static combineSets(sets: Set<any>[]): Set<any> {
        return sets.reduce((combined, list) => new Set([...combined, ...list]), new Set());
    }

    private getLinksInUrl(url: string): Links {
        if (this.sitemap.get(url)) return (this.sitemap.get(url) as Links);
        return {
            urls: new Set(),
            assets: new Set(),
        };
    }

    // ⚠️ console.log() is blocking on TTYs (but not on pipes) in POSIX systems.
    // This can possibly slow down execution on VERY large sites.
    private sitemapPrinter(url: string, alreadyPrinted: Set<string>, level: number): void {
        alreadyPrinted.add(url);
        const allLinks = this.getLinksInUrl(url);

        // Print assets.
        for (const asset of allLinks.assets) { // eslint-disable-line no-restricted-syntax
            console.log(`${'│ '.repeat(level + 1)}├📦 ${asset}`);
        }

        // Print page URLs.
        for (const link of allLinks.urls) { // eslint-disable-line no-restricted-syntax
            console.log(`${'│ '.repeat(level + 1)}└─🔗 ${link}`);
            if (!alreadyPrinted.has(link)) {
                this.sitemapPrinter(link, alreadyPrinted, level + 1);
            }
        }
    }

    /**
     * Add a parent URL and its child URLs to the sitemap.
     * @param url - Parent URL.
     * @param links - Links found in parent URL.
     * @param assets - Static assets found in parent URL.
     */
    public addLink(url: string, links: Links): void {
        if (this.sitemap.has(url)) {
            const currentLinks = (this.sitemap.get(url) as Links);

            this.sitemap.set(url, {
                urls: Sitemap.combineSets([currentLinks.urls, links.urls]),
                assets: Sitemap.combineSets([currentLinks.assets, links.assets]),
            });
        } else {
            this.sitemap.set(url, links);
        }
    }

    /**
     * Prints the sitemap on the console as a nice ASCII figure.
     */
    public print(): void {
        const initialUrl = this.sitemap.keys().next().value;
        if (!initialUrl) {
            console.log('🚨 Could not crawl the website!');
        } else {
            console.log(initialUrl);
            this.sitemapPrinter(initialUrl, new Set(), 0);
        }
    }
}
