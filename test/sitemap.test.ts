import test from 'tape';
import { stdout } from 'test-console';
import Sitemap from '../src/sitemap';
import { Links } from '../src/link-extractor';

/**
 * Sitemap tests.
 */

test('🗺  Sitemap — addLink() should add links that were found on a page.', t => {
    t.plan(2);
    const startingUrl = 'http://www.example.com';

    const input1 = {
        url: startingUrl,
        links: {
            urls: new Set([
                'http://www.example.com/second-page',
                'http://www.example.com/third-page',
            ]),
            assets: new Set([
                'http://www.example.com/favicon.ico',
                'http://www.example.com/styles/main.css',
            ]),
        },
    };

    const input2 = {
        url: startingUrl,
        links: {
            urls: new Set([
                'http://www.example.com/third-page',
                'http://www.example.com/fourth-page',
            ]),
            assets: new Set([
                'http://www.example.com/favicon.ico',
                'http://www.example.com/styles/main.css',
                'http://www.example.com/js/main.min.js',
            ]),
        },
    };

    const sitemap = new Sitemap();
    sitemap.addLink(input1.url, input1.links);
    sitemap.addLink(input2.url, input2.links);
    const links = sitemap.sitemap.get(startingUrl) as Links;
    t.same(links.urls, new Set([
        'http://www.example.com/second-page',
        'http://www.example.com/third-page',
        'http://www.example.com/fourth-page',
    ]), 'sitemap should have deduplicated and added URLs on the same level.');
    t.same(links.assets, new Set([
        'http://www.example.com/favicon.ico',
        'http://www.example.com/styles/main.css',
        'http://www.example.com/js/main.min.js',
    ]), 'sitemap should have added deduplicated and added asset URLs on the same level.');
    t.end();
});

test('🗺  Sitemap — print() should print only an alert when we have no crawl-able URLs.', t => {
    t.plan(2);
    const sitemap = new Sitemap();
    const output: readonly string[] = stdout.inspectSync(() => {
        sitemap.print();
    });

    t.equal(output.length, 1, 'should print only one alert line.');
    t.equal(output[0], '🚨 Could not crawl the website!\n', 'should print the alert message');
    t.end();
});

test('🗺  Sitemap — print() should print an ASCII sitemap.', t => {
    t.plan(5);
    const input1 = {
        url: 'http://www.example.com',
        links: {
            urls: new Set([
                'http://www.example.com/second-page',
                'http://www.example.com/third-page',
            ]),
            assets: new Set([
                'http://www.example.com/favicon.ico',
            ]),
        },
    };

    const input2 = {
        url: 'http://www.example.com/third-page',
        links: {
            urls: new Set([
                'http://www.example.com/hidden-page',
            ]),
            assets: new Set() as Set<string>,
        },
    };

    const input3 = {
        url: 'http://www.example.com/third-page',
        links: {
            urls: new Set([
                'http://www.example.com/hidden-page',
                'http://www.example.com/fifth-page',
                'http://www.example.com',
            ]),
            assets: new Set([
                'http://www.example.com/styles/main.min.css',
            ]),
        },
    };

    const sitemap = new Sitemap();
    sitemap.addLink(input1.url, input1.links);
    sitemap.addLink(input2.url, input2.links);
    sitemap.addLink(input3.url, input3.links);

    const output: readonly string[] = stdout.inspectSync(() => {
        sitemap.print();
    });

    t.equal(output.length, 8, 'should print all the links found.');
    t.notEqual(output[0].charAt(0), ' ', 'starting URL should be on level zero and have no leading spaces.');
    t.equal(output[1].slice(0, 3), '│ ├', 'asset link should have the `├` character prefixed.');
    t.equal(output[2].slice(0, 3), '│ └', 'first level link should have 1 leading space and the `└` character prefixed.');
    t.equal(output[5].slice(0, 5), '│ │ └', 'second level link should have 2 leading spaces and the `└` character prefixed..');
    t.end();
});
