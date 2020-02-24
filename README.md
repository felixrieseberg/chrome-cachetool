# chrome-cachetool
This repository contains Chrome &amp; Chromium's "cachetool", found in https://cs.chromium.org/chromium/src/net/tools/cachetool/. The only reason this repository exists is so that you can download the command line tool without having to have the whole Chromium repository on your machine just to create this tool.

This is _also_ a Node module, if you want to consume `cachetool` from Node.

:doughnut: **Download `cachetool` [here](https://github.com/felixrieseberg/chrome-cachetool/releases)**

## Usage (cachetool binary)

`cachetool <cache_path> <cache_backend_type> <subcommand>`

Available cache backend types: simple, blockfile

Available subcommands:
 * `batch`: Starts cachetool to process serialized commands passed down by the standard input and return commands output in the stdout until the stop command is received.
 * `delete_key <key>`: Delete key from cache.
 * `delete_stream <key> <index>`: Delete a particular stream of a given key.
 * `get_size`: Calculate the total size of the cache in bytes.
 * `get_stream <key> <index>`: Print a particular stream for a given key.
 * `list_keys`: List all keys in the cache.
 * `list_dups`: List all resources with duplicate bodies in the cache.
 * `update_raw_headers <key>`: Update stdin as the key’s raw response headers.
 * `stop`: Verify that the cache can be opened and return, confirming the cache exists and is of the right type.

Expected values of <index> are:
```
  0 (HTTP response headers)
  1 (transport encoded content)
  2 (compiled content)
```

## Usage (Node module)

```js
const cachetool = require('chrome-cachetool')

const options = {
  // Required: Path to your cache
  cachePath: '/Users/felix/Desktop/Cache',
  // 'simple' by default. Can either be 'simple' or 'blockfile'.
  cacheBackendType: 'simple',
  // False by default. Errors will be logged to console unless true.
  silent: true,
  // Required for commands that need a key
  key: 'https://my.key.com/asset.png',
  // 0 by default. Can optionally be another number.
  index: 0
}

await cachetool.deleteKey(options)
await cachetool.deleteStream(options)
await cachetool.getSize(options)
await cachetool.getStream(options)
await cachetool.listKeys(options)
await cachetool.listDups(options)
```

## How to build `cachetool`

1. Get `chromium`
2. `cd` into `gn`'s output directory (for instance `src/out/Testing`)
3. Run `ninja cachetool`

## License & Copyright

Copyright 2016 The Chromium Authors. All rights reserved.
