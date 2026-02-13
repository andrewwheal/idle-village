export type ResourceId = keyof typeof RESOURCES;

export type Resource = {
    id: ResourceId;
    name: string;
    baseCapacity: number;
}

export const initialResources: ResourceId[] = ["wood", "food"];

export const RESOURCES: Record<string, Resource> = {
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
