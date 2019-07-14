import { spawn } from 'child_process';

/**
 * Runs a given program and returns its exit code and output.
 * @param program - Executable to run.
 * @param args - Arguments to the executable.
 * @param stream - Stream to listen to, allowed are `stdout` and `stderr`.
 * @example
 * ```
 * const result = await run('npm', ['install', 'express']);
 * console.log(result); // Prints { code: 0, output: '<npm install output>' }
 * ```
 */
export async function run(program: string, args: string[], stream: 'stdout' | 'stderr' = 'stdout'): Promise<{ code: number, output: string }> {
    return new Promise((resolve, reject) => {
        let output = '';
        const prc = spawn(program, args);
        prc[stream].setEncoding('utf8');
        prc[stream].on('data', data => {
            output += data.toString();
        });
        prc.on('close', code => {
            return resolve({
                code,
                output,
            });
        });
        prc.on('error', err => {
            return reject(err);
        });
    });
}
