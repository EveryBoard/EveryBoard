declare function require(moduleName: string): unknown;

// Load the entire package so coverage includes files that individual specs do not import.
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('./index');
