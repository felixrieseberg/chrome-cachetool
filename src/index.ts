import { runCommand, CacheBackend, CommonCachetoolOptions } from "./runner";

// Available cache backend types: simple, blockfile
//
// Available subcommands:
//   batch: Starts cachetool to process serialized commands passed down by the standard input and return commands output in the stdout until the stop command is received.
//   delete_key <key>: Delete key from cache.
//   delete_stream <key> <index>: Delete a particular stream of a given key.
//   get_size: Calculate the total size of the cache in bytes.
//   get_stream <key> <index>: Print a particular stream for a given key.
//   list_keys: List all keys in the cache.
//   list_dups: List all resources with duplicate bodies in the cache.
//   update_raw_headers <key>: Update stdin as the key's raw response headers.
//   stop: Verify that the cache can be opened and return, confirming the cache exists and is of the right type.
export enum Commands {
  deleteKey = 'delete_key',
  deleteStream = 'delete_stream',
  getSize = 'get_size',
  getStream = 'get_stream',
  listKeys = 'list_keys',
  listDups = 'list_dups',
  updateRawHeaders = 'update_raw_headers',
}

/**
 * delete_key
 */

export interface DeleteKeyOptions extends CommonCachetoolOptions {
  key: string;
}

export async function deleteKey(options: DeleteKeyOptions): Promise<void> {
  const commandArgs = [ options.key ];
  await runCommand({ command: Commands.deleteKey, commandArgs, ...options });
}

/**
 * delete_stream
 */

export interface DeleteStreamOptions extends CommonCachetoolOptions {
  key: string;
  index?: number;
}

export async function deleteStream(options: DeleteStreamOptions): Promise<void> {
  const commandArgs = [ options.key, options.index?.toString() || '0' ];
  await runCommand({ command: Commands.deleteStream, commandArgs, ...options });
}

/**
 * get_size
 */
export interface GetSizeOptions extends CommonCachetoolOptions {}

export async function getSize(options: GetSizeOptions): Promise<number> {
  const result = await runCommand({ command: Commands.getSize, ...options });

  return parseInt(result.join(''), 10);
}

/**
 * get_stream
 */

export interface GetStreamOptions extends CommonCachetoolOptions {
  key: string;
  index?: number;
}

export async function getStream(options: GetStreamOptions): Promise<string | Array<Buffer>> {
  const parse = options.index > 0;
  const commandArgs = [ options.key, options.index?.toString() || '0' ];
  const result = await runCommand({ command: Commands.getStream, commandArgs, parse, ...options });

  return parse ? result.join() : result as Array<Buffer>;
}

/**
 * list_keys
 */

export interface ListKeysOptions extends CommonCachetoolOptions {}

export function listKeys(options: ListKeysOptions): Promise<Array<string>> {
  return runCommand({ command: Commands.listKeys, ...options });
}

/**
 * list_dups
 */

export interface ListDupsOptions extends CommonCachetoolOptions {}

export async function listDups(options: ListDupsOptions) {
  const result = await runCommand<string>({ command: Commands.listDups, ...options });
  const unparsedEntries = [];
  const parsedEntries = [];

  // Some output will contain multiple entries
  for (const entry of result) {
    const innerArray = entry.split('\n');
    unparsedEntries.push(...innerArray);
  }

  // Entries will now be in the following format:
  // 10497, https://emoji.slack-edge.com/T12KS1G65/blob-csm/eb4c7fecd8c216c5.png, image/png'
  const rgx = /^(\d*), ([^,]*), (\S*)$/i;
  for (const entry of unparsedEntries) {
    rgx.lastIndex = 0;
    const rgxResult = rgx.exec(entry);

    parsedEntries.push({
      size: rgxResult[1],
      key: rgxResult[2],
      mime: rgxResult[3]
    })
  }

  return parsedEntries;
}
