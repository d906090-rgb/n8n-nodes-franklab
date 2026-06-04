import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { test } from 'node:test';

const packageRoot = new URL('..', import.meta.url);
const forbiddenFragments = [
	'process' + '.env',
	'from ' + "'fs'",
	'from ' + '"fs"',
	'require(' + "'fs'",
	'require(' + '"fs"',
	'BEGIN ' + 'PRIVATE KEY',
	'certificate' + 'ChainPem',
	'private' + 'KeyPem',
	'create' + '_from_pem',
	'rotate' + '_from_pem',
	'fl_' + 'live_',
	'eyJ' + 'hbGci',
];

async function collectFiles(dir) {
	const entries = await readdir(dir, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		if (entry.name === 'node_modules' || entry.name === 'dist') continue;
		if (entry.name === 'package-lock.json') continue;
		const path = join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...await collectFiles(path));
		} else if (/\.(ts|js|mjs|json|md|yml|yaml)$/.test(entry.name)) {
			files.push(path);
		}
	}
	return files;
}

test('package source contains no env, file-system, PEM, or credential leakage markers', async () => {
	const rootPath = packageRoot.pathname;
	const files = await collectFiles(rootPath);
	assert.ok(files.length > 0);

	for (const file of files) {
		const body = await readFile(file, 'utf8');
		for (const fragment of forbiddenFragments) {
			assert.equal(body.includes(fragment), false, `${relative(rootPath, file)} contains ${fragment}`);
		}
	}
});
