import test from 'tape';
import nock from 'nock';
import toReadableStream from 'to-readable-stream';
import Crawler from '../src/crawler';
import { readFile } from './helpers/read-file';

/**
 * Crawler tests.
 */


test('🛠 setup', t => {
    nock.disableNetConnect();
    t.end();
});

test('🕷  Crawler — constructor() set up the starting URL.', async t => {
    t.plan(1);
    const url = 'www.example.com/';
    const crawler = new Crawler(url);
    t.equal(crawler.startingUrl, 'https://www.example.com', 'should set-up a well-formed starting URL.');
    t.end();
});

test('🕷  Crawler — crawl() should immediately return when no URL is provided.', async t => {
    t.plan(1);
    const url = 'www.example.com/';
    const crawler = new Crawler(url);
    t.equal(await crawler.crawl(null), undefined, 'should immediately return with nothing.');
    t.end();
});

test('🕷  Crawler — crawl() should halt when it encounters an error in linkExtractor.getLinks()', async t => {
    const url = 'http://www.example.com';
    nock(url)
        .persist()
        .get('/')
        .reply(429, () => { // We've made Got throw on non-2xx errors, so expect this to throw.
            return toReadableStream('Too Many Requests!');
        });

    const crawler = new Crawler(url);
    const crawlResult = await crawler.crawl();

    t.same(crawler.sitemap.sitemap, new Map(), 'should return an empty sitemap.');
    t.equal(crawlResult, undefined, 'should return with nothing.');
    nock.cleanAll();
    t.end();
});

test('🕷  Crawler — crawl() should crawl all URLs and build a sitemap.', { timeout: 6000 }, async t => {
    t.plan(1);

    const url = 'http://www.example.com';
    const html1 = await readFile('./fixtures/crawler_1.html');
    const html2 = await readFile('./fixtures/crawler_2.html');
    const html3 = await readFile('./fixtures/crawler_3.html');
    const html4 = await readFile('./fixtures/crawler_4.html');

    nock(url)
        .persist()
        .get('/')
        .reply(200, () => {
            return toReadableStream(html1);
        });

    nock(url)
        .persist()
        .get('/second-page')
        .reply(200, () => {
            return toReadableStream(html2);
        });

    nock(url)
        .persist()
        .get(/^\/third-page(.*)$/)
        .reply(200, () => {
            return toReadableStream(html3);
        });

    nock(url)
        .persist()
        .get('/fourth-page')
        .reply(200, () => {
            return toReadableStream(html4);
        });

    const crawler = new Crawler(url);
    crawler.crawl();

    setTimeout(() => {
        // Assume the sitemap building will complete in 5 seconds.
        // This is a wee bit hacky but we do this because we don't know when the recursive crawling actually ends.
        const sitemap = crawler.sitemap;
        t.same(sitemap.sitemap, new Map([
            ['http://www.example.com', new Set(['http://www.example.com/second-page', 'http://www.example.com/third-page/#readme'])],
            ['http://www.example.com/second-page', new Set(['http://www.example.com/second-page', 'http://www.example.com/third-page/#readme'])],
            ['http://www.example.com/third-page/#readme', new Set(['http://www.example.com', 'http://www.example.com/fourth-page'])],
            ['http://www.example.com/fourth-page', new Set(['http://www.example.com'])],
        ]), 'crawl should build the expected sitemap.');
        nock.cleanAll();
        t.end();
    }, 5000);
});

test('💣 teardown', t => {
    nock.cleanAll();
    nock.enableNetConnect();
    t.end();
});
