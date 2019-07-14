import test from 'tape';
import nock from 'nock';
import getStream from 'get-stream';
import toReadableStream from 'to-readable-stream';
import Fetcher from '../src/fetcher';

/**
 * Fetcher tests.
 */

nock.disableNetConnect();

test('🌐 Fetcher — getUrlResponse() should return the response as a Duplex stream.', async t => {
    t.plan(2);
    const url = 'http://www.example.com/lol';
    const mock = await nock('http://www.example.com')
        .get('/lol')
        .times(2)
        .reply(200, () => {
            return toReadableStream('<!DOCTYPE html><html><title>LOL</title><body></body></html>');
        });
    const fetcher = new Fetcher(url);
    const responseStream1 = fetcher.getUrlResponse();
    const response1 = await getStream(responseStream1);
    t.equal(response1, '<!DOCTYPE html><html><title>LOL</title><body></body></html>', 'should return the expected response as a stream.');
    const responseStream2 = fetcher.getUrlResponse(url, 'GET'); // Test with URL argument.
    const response2 = await getStream(responseStream2);
    t.equal(response2, '<!DOCTYPE html><html><title>LOL</title><body></body></html>', 'should return the expected response as a stream.');
    nock.cleanAll();
    t.end();
});

nock.enableNetConnect();
