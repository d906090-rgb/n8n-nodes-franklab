#!/usr/bin/env node

import { lstat, mkdir, readlink, stat, symlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const toolingDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.dirname(toolingDir);
const source = path.join(toolingDir, 'node_modules', '@n8n', 'node-cli');
const targetParent = path.join(packageRoot, 'node_modules', '@n8n');
const target = path.join(targetParent, 'node-cli');

const sourceStat = await stat(source).catch(() => null);
if (!sourceStat?.isDirectory()) {
	throw new Error('Private tooling is not installed; run npm --prefix tooling ci --ignore-scripts first');
}

await mkdir(targetParent, { recursive: true });

const targetStat = await lstat(target).catch((error) => {
	if (error?.code === 'ENOENT') return null;
	throw error;
});

if (targetStat) {
	if (!targetStat.isSymbolicLink()) {
		throw new Error(`Refusing to replace non-symlink path: ${target}`);
	}
	const current = path.resolve(targetParent, await readlink(target));
	if (current !== source) {
		throw new Error(`Refusing to replace unexpected node-cli symlink: ${target}`);
	}
	console.log('Private n8n node-cli link is current');
	process.exit(0);
}

const linkTarget = process.platform === 'win32' ? source : path.relative(targetParent, source);
await symlink(linkTarget, target, process.platform === 'win32' ? 'junction' : 'dir');
console.log('Linked private n8n node-cli into the public package development tree');
