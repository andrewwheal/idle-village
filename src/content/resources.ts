export type ResourceId = keyof typeof RESOURCES;

export type Resource = {
    id: ResourceId;
    name: string;
    baseCap: number;
}

export const initialResources: ResourceId[] = ["wood", "food"];

export const RESOURCES: Record<string, Resource> = {
    "wood": {
        id: "wood",
        name: "Wood",
        baseCap: 200,
    },
    "food": {
        id: "food",
        name: "Food",
        baseCap: 200,
    },
    "planks": {
        id: "planks",
        name: "Planks",
        baseCap: 100,
    },
}