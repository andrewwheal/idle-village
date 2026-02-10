import type { ResourceId } from "./resources";

export type BuildingId = keyof typeof BUILDINGS;

export type Building = {
    id: BuildingId;
    name: string;
    cost: Partial<Record<ResourceId, number>>;
    cycleSeconds: number;
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
        cycleSeconds: 10,
        produces: {
            "wood": 2,
        },
    },
    "farm": {
        id: "farm",
        name: "Farm",
        cost: {
            "wood": 20,
        },
        cycleSeconds: 20,
        produces: {
            "food": 5,
        },
    },
    "sawmill": {
        id: "sawmill",
        name: "Sawmill",
        cost: {
            "wood": 30,
        },
        cycleSeconds: 5,
        consumes: {
            "wood": 1,
        },
        produces: {
            "planks": 4,
        },
    },
}
