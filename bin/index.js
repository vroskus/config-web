#! /usr/bin/env node

/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');

const source = process.argv[2]; // Path to input config.js file
const target = process.argv[3]; // Path to output config.js file
const startEnd = process.argv[4]; // Start, End identifier overrides

const successExitCode = 1;

const cleanString = (input) => (typeof input !== 'string' ? '' : input.replace(
  /\\n/g,
  '\\n',
)
  .replace(
    /'/g,
    "\\'",
  )
  .replace(
    /"/g,
    '\\"',
  )
  .replace(
    /&/g,
    '\\&',
  )
  .replace(
    /\\r/g,
    '\\r',
  )
  .replace(
    /\\t/g,
    '\\t',
  )
  .replace(
    /\\b/g,
    '\\b',
  )
  .replace(
    /\\f/g,
    '\\f',
  ));

const ensureDirectoryExistence = (filePath) => {
  const dirname = path.dirname(filePath);

  if (fs.existsSync(dirname)) {
    return true;
  }

  ensureDirectoryExistence(dirname);

  fs.mkdirSync(dirname);

  return false;
};

const getStartEnd = () => {
  // Default start, end identifiers
  let output = [
    'const params: Array<keyof $Config> = [',
    '];',
  ];

  if (startEnd) {
    output = startEnd.split(',');
  }

  return output;
};

const getConfigParams = () => {
  const configFile = fs.readFileSync(
    source,
    'utf8',
  );
  const [
    start,
    end,
  ] = getStartEnd();

  let read = false;
  const params = [
  ];
  const lineIncrement = 1;

  configFile.split(/\r?\n/).forEach((line) => {
    if (read === true) {
      if (line.startsWith(end)) {
        read = false;

        return;
      }

      const param = line.substring(
        line.indexOf('\'') + lineIncrement,
        line.lastIndexOf('\''),
      );

      params.push(param);
    }

    if (line.startsWith(start)) {
      read = true;
    }
  });

  return params;
};

const writeConfig = (params) => {
  ensureDirectoryExistence(target);

  const stream = fs.createWriteStream(target);

  if (!stream) {
    throw new Error(`Unable to write to target file '${target}'`);
  }

  stream.once(
    'open',
    () => {
      stream.write('var config = {\n');
      params.forEach((variable) => {
        let value = '';

        if (variable in process.env) {
          value = cleanString(process.env[variable].replace(
            /^\s+$/g,
            '',
          ));
        }

        stream.write(`\t${variable}: "${value}", \n`);
      });
      stream.write('};');
      stream.end();
    },
  );
};

try {
  const params = getConfigParams();

  writeConfig(params);

  console.log(`Config file prepared '${target}'`);
} catch (error) {
  console.error(error);
  process.exit(successExitCode);
}
