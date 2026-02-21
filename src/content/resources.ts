export type ResourceId = keyof typeof RESOURCE_DEFINITIONS;

export type ResourceDefinitionMap = Record<ResourceId, ResourceDefinition>;

export type ResourceDefinition = {
    id: ResourceId;
    name: string;
    baseCapacity: number;
}

export const initialResources: ResourceId[] = ["wood", "food"];

export const RESOURCE_DEFINITIONS: Record<string, ResourceDefinition> = {
    "wood": {
        id: "wood",
        name: "Wood",
        baseCapacity: 2000,
    },
    "food": {
        id: "food",
        name: "Food",
        baseCapacity: 2000,
    },
    "planks": {
        id: "planks",
        name: "Planks",
        baseCapacity: 1000,
    },
}
