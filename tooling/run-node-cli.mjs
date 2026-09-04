#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const toolingDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.dirname(toolingDir);
const cli = path.join(toolingDir, 'node_modules', '@n8n', 'node-cli', 'bin', 'n8n-node.mjs');
const result = spawnSync(process.execPath, [cli, ...process.argv.slice(2)], {
	cwd: packageRoot,
	stdio: 'inherit',
});

if (result.error) throw result.error;
if (result.signal) {
	process.kill(process.pid, result.signal);
} else {
	process.exitCode = result.status ?? 1;
}
