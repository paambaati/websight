/**
 * CLI (main entrypoint).
 * Simply run this file to start crawling.
 */

import Crawler from './crawler';

const args = process.argv;

if ((args.length !== 3) || (args.length > 2 && !args[2].trim().length)) {
    console.error('Usage: node lib/index.js <site-to-crawl>');
    process.exit(1);
}

const input = args[2];
const crawler = new Crawler(input);

// Print sitemap when the event loop is finally empty (i.e. when crawl recursion completes).
process.on('beforeExit', () => {
    crawler.sitemap.print();
});

crawler.crawl();
