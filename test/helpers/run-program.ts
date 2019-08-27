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
export default async function run(program: string, args: string[], stream: 'stdout' | 'stderr' = 'stdout'): Promise<{ code: number, output: string }> {
    return new Promise((resolve, reject) => {
        let output = '';
        const prc = spawn(program, args);
        prc[stream].setEncoding('utf8');
        prc[stream].on('data', data => {
            output += data.toString();
        });
        prc.on('error', err => {
            reject(err);
        });
        prc.on('exit', (code, signal) => {
            if (code) {
                const err = new Error(`Program exited with code ${code}`);
                err['exitCode'] = code;
                err['output'] = output;
                reject(err);
            } else if (signal) {
                const err = new Error(`Program was killed with signal ${signal}`);
                err['signal'] = signal;
                err['output'] = output;
                reject(err);
            } else {
                resolve({ code, output });
            }
        });
    });
}
