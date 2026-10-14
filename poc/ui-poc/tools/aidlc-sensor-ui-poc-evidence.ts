// The pinned dispatcher requires aidlc-sensor-<id>.ts and invokes it with its runtime.
// This adapter intentionally has no upstream imports or third-party dependencies.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { main } = require('./ui-poc-evidence.cjs');
main(process.argv.slice(2));
