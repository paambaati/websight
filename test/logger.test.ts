import test from 'tape';
import Logger from '../src/logger';

/**
 * Tests.
 */

test('🌲 Logger — Constructor should allow override of log level.', t => {
    t.plan(1);
    const { logger } = new Logger('tests', {
        level: 'silent',
    });
    t.equals(logger.level, 'silent', 'Default log level should be overridden.');
    t.end();
});

test('🌲 Logger — Constructor should default to log level \'info\' if LOG_LEVEL is unset.', t => {
    t.plan(1);
    process.env.LOG_LEVEL = ''; // No way to unset the LOG_LEVEL env var; see https://github.com/nodejs/node/issues/9248.
    const { logger } = new Logger('tests');
    t.equals(logger.level, 'info', 'Log level should fallback to default.');
    t.end();
});

test('🌲 Logger — Constructor should have logs enabled if set explicitly in options.', t => {
    t.plan(1);
    process.env.LOG_LEVEL = '';
    const { logger } = new Logger('tests', {
        enabled: true,
    });
    t.equals(logger.level, 'info', 'Log level should fallback to default.');
    t.end();
});

test('🌲 Logger — Constructor should have log level set correctly if a non-default level is set explicitly in options.', t => {
    t.plan(1);
    process.env.LOG_LEVEL = '';
    const { logger } = new Logger('tests', {
        level: 'error',
    });
    t.equals(logger.level, 'error', 'Log level should be correctly set.');
    t.end();
});
