import assert from 'node:assert/strict';
import { test } from 'node:test';

const registry = await import('../dist/nodes/shared/registry.js');

const NODE_MODULES = [
	['Holst', 'holst'],
	['Kley', 'kley'],
	['Plastinka', 'plastinka'],
	['Volna', 'volna'],
	['C2pa', 'c2pa'],
	['Sufler', 'sufler'],
	['TextSticker', 'textSticker'],
	['Orkestr', 'orkestr'],
	['Jupiter', 'jupiter'],
	['Mars', 'mars'],
	['Saturn', 'saturn'],
	['Moon', 'moon'],
	['Venus', 'venus'],
	['X', 'x'],
	['Minimax', 'minimax'],
	['Dola', 'dola'],
	['Alibaba', 'alibaba'],
	['Omni', 'omni'],
	['Kusok', 'kusok'],
	['Mercury', 'mercury'],
	['Neptune', 'neptune'],
	['Pluto', 'pluto'],
	['Aries', 'aries'],
	['Titan', 'titan'],
	['HotCoffe', 'hotCoffe'],
];

test('every node operation dropdown exactly matches its registry module operations', async () => {
	for (const [dir, moduleName] of NODE_MODULES) {
		const nodeModule = await import(`../dist/nodes/${dir}/FrankLab${dir}.node.js`);
		const nodeClass = Object.values(nodeModule).find((value) => typeof value === 'function');
		assert.ok(nodeClass, `${dir} node class is exported`);
		const description = new nodeClass().description;
		const optionValues = new Set();
		for (const property of description.properties) {
			if (property.name === 'operation' && Array.isArray(property.options)) {
				for (const option of property.options) optionValues.add(option.value);
			}
		}
		const registryValues = new Set(registry.MODULE_OPERATIONS[moduleName]);
		assert.ok(registryValues.size > 0, `${moduleName} has registry operations`);
		assert.deepEqual(
			[...optionValues].sort(),
			[...registryValues].sort(),
			`${dir} node dropdown must equal registry MODULE_OPERATIONS.${moduleName}`,
		);
		assert.ok(optionValues.size > 0, `${dir} node has a non-empty operation list`);
	}
});

test('every node field displayOptions reference only real operation values', async () => {
	// Shared properties (jobId/wait/payload/profileId) are declared once for all nodes,
	// so their show-lists legitimately name operations other nodes use.
	const sharedPropertyNames = new Set(['jobId', 'waitForCompletion', 'payloadJson', 'profileId']);
	for (const [dir, moduleName] of NODE_MODULES) {
		const nodeModule = await import(`../dist/nodes/${dir}/FrankLab${dir}.node.js`);
		const nodeClass = Object.values(nodeModule).find((value) => typeof value === 'function');
		const description = new nodeClass().description;
		const allowed = new Set(registry.MODULE_OPERATIONS[moduleName]);
		for (const property of description.properties) {
			if (sharedPropertyNames.has(property.name)) continue;
			const shownOperations = property.displayOptions?.show?.operation;
			if (!Array.isArray(shownOperations)) continue;
			for (const shown of shownOperations) {
				assert.ok(
					allowed.has(shown),
					`${dir} field '${property.name}' shows for unknown operation '${shown}'`,
				);
			}
		}
	}
});
