import type { INodeProperties } from 'n8n-workflow';
import { scopePropertiesToResource } from '../../shared/node-utils';
import type { FrankLabModule } from '../../shared/registry';
import { alibabaResource } from './alibaba';
import { ariesResource } from './aries';
import { c2paResource } from './c2pa';
import { dolaResource } from './dola';
import { fluxResource } from './flux';
import { heygenAgentResource } from './heygenAgent';
import { holstResource } from './holst';
import { hotCoffeResource } from './hotCoffe';
import { jupiterResource } from './jupiter';
import { kleyResource } from './kley';
import { kusokResource } from './kusok';
import { marsResource } from './mars';
import { mercuryResource } from './mercury';
import { minimaxResource } from './minimax';
import { moonResource } from './moon';
import { narezkaResource } from './narezka';
import { neptuneResource } from './neptune';
import { omniResource } from './omni';
import { orkestrResource } from './orkestr';
import { plastinkaResource } from './plastinka';
import { plutoResource } from './pluto';
import { saturnResource } from './saturn';
import { socialResource } from './social';
import { suflerResource } from './sufler';
import { textStickerResource } from './textSticker';
import { titanResource } from './titan';
import type { FrankLabResourceDefinition } from './types';
import { variantPackResource } from './variantPack';
import { venusResource } from './venus';
import { volnaResource } from './volna';
import { xResource } from './x';

export const FRANKLAB_RESOURCES: readonly FrankLabResourceDefinition[] = [
	alibabaResource,
	ariesResource,
	c2paResource,
	dolaResource,
	fluxResource,
	heygenAgentResource,
	holstResource,
	hotCoffeResource,
	jupiterResource,
	kleyResource,
	kusokResource,
	marsResource,
	mercuryResource,
	minimaxResource,
	moonResource,
	narezkaResource,
	neptuneResource,
	omniResource,
	orkestrResource,
	plastinkaResource,
	plutoResource,
	saturnResource,
	socialResource,
	suflerResource,
	textStickerResource,
	titanResource,
	variantPackResource,
	venusResource,
	volnaResource,
	xResource,
].sort((a, b) => a.displayName.toLowerCase().localeCompare(b.displayName.toLowerCase()));

export const FRANKLAB_RESOURCE_MAP: Record<FrankLabModule, FrankLabResourceDefinition> = Object.fromEntries(
	FRANKLAB_RESOURCES.map((resource) => [resource.moduleName, resource]),
) as Record<FrankLabModule, FrankLabResourceDefinition>;

export const RESOURCE_PROPERTY: INodeProperties = {
	displayName: 'Resource',
	name: 'resource',
	type: 'options',
	noDataExpression: true,
	default: 'mars',
	options: FRANKLAB_RESOURCES.map((resource) => ({
		name: resource.displayName,
		value: resource.moduleName,
	})),
};

export const OPERATION_PROPERTIES: INodeProperties[] = FRANKLAB_RESOURCES.map((resource) => resource.operationProperty);

export const RESOURCE_FIELD_PROPERTIES: INodeProperties[] = FRANKLAB_RESOURCES.flatMap((resource) =>
	scopePropertiesToResource(resource.moduleName, resource.fields),
);
