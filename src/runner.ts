import { spawn } from 'child_process';
import * as path from 'path';

import { Commands } from '.';

const EXEC_PATH = path.join(__dirname, '../bin/cachetool');

/**
 * Types
 */

export type CacheBackend = 'simple' | 'blockfile';

export interface CommonCachetoolOptions {
  cachePath: string;
  cacheBackendType?: CacheBackend;
  silent?: boolean;
}

export interface RunCommandOptions extends CommonCachetoolOptions{
  command: Commands;
  commandArgs?: Array<string>;
  parse?: boolean;
}

/**
 * Function
 */

export function runCommand<T>(
  { cachePath, cacheBackendType, command, commandArgs, silent, parse }: RunCommandOptions
): Promise<Array<string | T>> {
  return new Promise((resolve, reject) => {
    const args = [ cachePath, cacheBackendType || 'simple', command, ...(commandArgs || []) ];

    if (!silent) {
      console.log(`Cachetool: Running ${EXEC_PATH} ${args.join(' ')}`);
    }

    const child = spawn(EXEC_PATH, args);
    const result = [];
    const errors = [];
    const toString = parse === undefined ? true : parse;

    child.stdout.on('data', (data: Buffer) => {
      const entry = toString ? data.toString().trim() : data;
      result.push(entry)
    });
    child.stderr.on('data', (data: Buffer) => {
      errors.push(data.toString().trim())
    });

    child.on('close', (code) => {
      if (!silent) {
        console.log(`cachetool process exited with code ${code}`);
      }

      if (code !== 0 && errors.length > 0) {
        if (!silent) {
          console.log(`cachetool error: ${errors.join()}`);
        }

        return reject(errors);
      }

      return resolve(result);
    });
  });
}
