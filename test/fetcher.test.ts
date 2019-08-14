import test from 'tape';
import nock from 'nock';
import getStream from 'get-stream';
import toReadableStream from 'to-readable-stream';
import Fetcher from '../src/fetcher';

/**
 * Fetcher tests.
 */

test('🛠 setup', t => {
    nock.disableNetConnect();
    t.end();
});

test('🌐 Fetcher — getUrlResponse() should return the response as a Duplex stream.', async t => {
    t.plan(2);
    const url = 'http://www.example.com/lol';
    await nock('http://www.example.com')
        .get('/lol')
        .times(2)
        .reply(200, () => toReadableStream('<!DOCTYPE html><html><title>LOL</title><body></body></html>'));
    const fetcher = new Fetcher(url);
    const responseStream1 = fetcher.getUrlResponse();
    try {
        const response1 = await getStream(responseStream1);
        t.equal(response1, '<!DOCTYPE html><html><title>LOL</title><body></body></html>', 'should return the expected response as a stream.');
        const responseStream2 = fetcher.getUrlResponse(url, 'GET'); // Test with URL argument.
        const response2 = await getStream(responseStream2);
        t.equal(response2, '<!DOCTYPE html><html><title>LOL</title><body></body></html>', 'should return the expected response as a stream.');
    } catch (err) {
        nock.cleanAll();
        t.fail(err);
    }
    nock.cleanAll();
    t.end();
});

test('💣 teardown', t => {
    nock.cleanAll();
    nock.enableNetConnect();
    t.end();
});
