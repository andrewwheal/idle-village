import type { ResourceId } from "./resources";

export type BuildingId = keyof typeof BUILDINGS;

export type Building = {
    id: BuildingId;
    name: string;
    cost: Partial<Record<ResourceId, number>>;
    consumes?: Partial<Record<ResourceId, number>>;
    produces: Partial<Record<ResourceId, number>>;
}

export const BUILDINGS: Record<string, Building> = {
    "woodcutter": {
        id: "woodcutter",
        name: "Woodcutter's Hut",
        cost: {
            "wood": 10,
        },
        produces: {
            "wood": 1,
        },
    },
    "farm": {
        id: "farm",
        name: "Farm",
        cost: {
            "wood": 20,
        },
        produces: {
            "food": 1,
        },
    },
    "sawmill": {
        id: "sawmill",
        name: "Sawmill",
        cost: {
            "wood": 30,
        },
        consumes: {
            "wood": 2,
        },
        produces: {
            "planks": 1,
        },
    },
}