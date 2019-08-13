import test from 'tape';
import nock from 'nock';
import toReadableStream from 'to-readable-stream';
import LinkExtractor from '../src/link-extractor';
import Parser from '../src/parser';
import { readFile } from './helpers/read-file';

/**
 * Link Extractor tests.
 */

test('🛠 setup', t => {
    nock.disableNetConnect();
    t.end();
});

test('🔗 LinkExtractor — getLinks() should return links on a page.', async t => {
    t.plan(1);
    const html = await readFile('./fixtures/link_extractor_1.html');
    const mock = await nock('http://www.example.com')
        .get('/')
        .reply(200, () => {
            return toReadableStream(html);
        });
    const linkExtractor = new LinkExtractor('http://www.example.com');
    const links = await linkExtractor.getLinks();
    t.same(links, {
        urls: new Set([
            'http://www.example.com/second-page',
            'http://www.example.com/third-page/#readme',
        ]),
        assets: new Set([
            'http://www.example.com/styles.css',
            'data:image/jpeg;base64,/9j/2wBDAAYEB/9k=',
        ]),
    }, 'should return followable links in page as absolute URLs.');
    nock.cleanAll();
    t.end();
});

test('🔗 LinkExtractor — getLinks() should throw an Error when Fetcher.getUrlResponse() fails.', async t => {
    t.plan(1);
    const mock = await nock('http://www.example.com')
        .get('/does-not-exist')
        .reply(404);
    const linkExtractor = new LinkExtractor('http://www.example.com/does-not-exist');
    linkExtractor.getLinks()
        .then(() => t.fail('cannot succeed.'))
        .catch(() => t.pass('should throw an error.'))
        .finally(() => {
            nock.cleanAll();
            t.end();
        });
});

test('🔗 LinkExtractor — getLinks() should throw an Error when Parser.parse() fails.', async t => {
    t.plan(1);
    const html = await readFile('./fixtures/link_extractor_1.html');
    const mock = await nock('http://www.example.com')
        .get('/')
        .reply(200, () => {
            return toReadableStream(html);
        });

    const linkExtractor = new LinkExtractor('http://www.example.com/');
    const getLinks = linkExtractor.getLinks();

    /** Simulate a parser error! */
    process.nextTick(() => {
        linkExtractor.parser.on('link', () => {
            linkExtractor.parser.emit('error', new Error('oops!'));
        });
    });

    getLinks.then(() => {
        t.fail('cannot succeed.');
    })
    .catch(err => {
        t.pass('should throw an error.');
    })
    .finally(() => {
        nock.cleanAll();
        t.end();
    });
});

test('💣 teardown', t => {
    nock.cleanAll();
    nock.enableNetConnect();
    t.end();
});
