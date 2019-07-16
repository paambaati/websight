import { URL } from 'url';

export default class URLResolver {
    private urlObject: URL;
    /**
     * URL resolver utility.
     * Normalizes URLs and strips trailing slash.
     * @example
     * ```
     * const urlResolver = new URLResolver('www.example.com/');
     * urlResolver.startingUrl; // Prints 'https://www.example.com';
     * ```
     */
    constructor(public startingUrl: string) {
        if (!startingUrl.includes('://')) {
            this.startingUrl = `https://${startingUrl}`; // Always assume HTTPS by default because it is 2019.
        }
        this.startingUrl = this.stripTrailingSlash();
        this.urlObject = new URL(this.startingUrl);
    }

    /**
     * Strip trailing slash from given string.
     * @param url - String to strip trailing slash from.
     */
    public stripTrailingSlash(url: string = this.startingUrl): string {
        if (url.endsWith('/')) {
            return url.slice(0, -1);
        }
        return url;
    }

    /**
     * Resolves absolute URL for given URL and domain from `startingUrl`.
     * @param url - Relative URL to resolve.
     */
    public getAbsoluteUrl(url: string): string {
        if (url.includes('://')) return this.stripTrailingSlash(url);
        if (url.includes(':') && !url.includes('://')) return url;
        return this.stripTrailingSlash(`${this.urlObject.protocol}//${this.urlObject.hostname}${url}`);
    }

    /**
     * Checks if URL is part of the domain.
     * @param url - URL to check.
     */
    public isURLInDomain(url: string): boolean {
        return new URL(url).hostname === this.urlObject.hostname;
    }
}
