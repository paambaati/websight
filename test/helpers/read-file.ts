import { readFile as read } from 'fs';
import { join, resolve } from 'path';
import { promisify } from 'util';

const readFileAsync = promisify(read);

/**
 * Read file asynchronously.
 * @param filename - Filename to read.
 * @param encoding - (Optional) file encoding; defaults to 'utf-8'.
 * @example
 * ```
 * const contents = await readFile('/tmp/example.txt');
 * console.log(contents); // Prints contents of /tmp/example.txt
 * ```
 */
export default async function readFile(filename: string, encoding: string = 'utf-8'): Promise<string> {
    const absolutePath = resolve(join(__dirname, '../', filename));
    return readFileAsync(absolutePath, { encoding });
}
