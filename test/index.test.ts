import test from 'tape';
import { EOL } from 'os';
import run from './helpers/run-program';

/**
 * CLI tests.
 * (Does not affect coverage because we're just running the CLI as an external program).
 */

test('👩🏻‍💻  CLI — should return an error on missing arguments.', async t => {
    t.plan(2);
    try {
        await run('node', ['lib/'], 'stderr');
        t.fail('Should error out and exit with error code 1');
    } catch (err) {
        t.equal(err['output'], 'Usage: node lib/index.js <site-to-crawl>\n', 'should print usage message.');
        t.equal(err['exitCode'], 1, 'should exit with code 1.');
    } finally {
        t.end();
    }
});

test('👩🏻‍💻  CLI — should crawl the website and print a sitemap.', { timeout: 10000 }, async t => {
    t.plan(2);
    try {
        const result = await run('node', ['lib/', 'www.example.com']); // ⚠️ Somewhat brittle test; should not depend on an external website we don't own!
        t.equal(result.code, 0, 'should exit cleanly with code 0.');
        t.equal(result.output, `https://www.example.com${EOL}`, 'should print the sitemap of www.example.com'); // This essentially tests the process.on('beforeExit', ()) hook.
    } catch (err) {
        t.comment('⚠️ Could not run lib/index.js - Make sure you run \'yarn build\' before running tests!');
        t.fail(err);
    } finally {
        t.end();
    }
});
