import assert from 'node:assert/strict';
import { test } from 'node:test';

const registry = await import('../dist/nodes/shared/registry.js');
const { FrankLab } = await import('../dist/nodes/FrankLab/FrankLab.node.js');

const description = new FrankLab().description;

test('unified FrankLab node exposes every registry module as a top-level resource', () => {
	const resourceProp = description.properties.find((property) => property.name === 'resource');
	assert.ok(resourceProp && Array.isArray(resourceProp.options), 'FrankLab has top-level resource options');
	const resourceValues = resourceProp.options.map((option) => option.value).sort();
	const registryModules = Object.keys(registry.MODULE_OPERATIONS).sort();
	assert.deepEqual(resourceValues, registryModules, 'resource dropdown must equal registry MODULE_OPERATIONS keys');
	assert.equal(resourceValues.length, 30);
});

test('every resource operation dropdown exactly matches its registry module operations', () => {
	const opsByResource = new Map();
	for (const property of description.properties) {
		if (property.name !== 'operation' || !Array.isArray(property.options)) continue;
		const shownResources = property.displayOptions?.show?.resource;
		assert.ok(Array.isArray(shownResources) && shownResources.length === 1, 'each operation property scopes to one resource');
		const resourceName = shownResources[0];
		const allowed = new Set(registry.MODULE_OPERATIONS[resourceName] ?? []);
		assert.ok(
			allowed.has(property.default),
			`resource '${resourceName}' default operation '${property.default}' must exist in registry`,
		);
		const bucket = opsByResource.get(resourceName) ?? new Set();
		for (const option of property.options) bucket.add(option.value);
		opsByResource.set(resourceName, bucket);
	}

	for (const [moduleName, registryOps] of Object.entries(registry.MODULE_OPERATIONS)) {
		const optionValues = opsByResource.get(moduleName);
		assert.ok(optionValues, `missing operation dropdown for resource '${moduleName}'`);
		assert.deepEqual(
			[...optionValues].sort(),
			[...registryOps].sort(),
			`FrankLab resource '${moduleName}' operations must equal registry MODULE_OPERATIONS.${moduleName}`,
		);
	}
});

test('every resource-scoped field displayOptions reference only real operation values of its resource', () => {
	const sharedPropertyNames = new Set(['resource', 'operation', 'jobId', 'waitForCompletion', 'payloadJson', 'profileId']);
	for (const property of description.properties) {
		if (sharedPropertyNames.has(property.name)) continue;
		const shownResources = property.displayOptions?.show?.resource;
		assert.ok(
			Array.isArray(shownResources) && shownResources.length === 1,
			`field '${property.name}' must be scoped to a single resource to avoid UI collisions`,
		);
		const moduleName = shownResources[0];
		const allowed = new Set(registry.MODULE_OPERATIONS[moduleName] ?? []);
		const shownOperations = property.displayOptions?.show?.operation;
		if (!Array.isArray(shownOperations)) continue;
		for (const shown of shownOperations) {
			assert.ok(
				allowed.has(shown),
				`resource '${moduleName}' field '${property.name}' shows for unknown operation '${shown}'`,
			);
		}
	}
});
