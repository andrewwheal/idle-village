import type { ResourceId } from "./resources";

export type BuildingId = keyof typeof BUILDING_DEFINITIONS;

export type BuildingDefinitionMap = Record<BuildingId, BuildingDefinition>;

export type BuildingDefinition = {
    id: BuildingId;
    name: string;
    cost: Partial<Record<ResourceId, number>>;
    cycleSeconds: number;
    consumes?: Partial<Record<ResourceId, number>>;
    produces: Partial<Record<ResourceId, number>>;
}

export const BUILDING_DEFINITIONS: Record<string, BuildingDefinition> = {
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
    "quarry": {
        id: "quarry",
        name: "Quarry",
        cost: {
            "wood": 100,
        },
        cycleSeconds: 20,
        produces: {
            "stone": 5,
        },
    },
    "clay_pit": {
        id: "clay_pit",
        name: "Clay Pit",
        cost: {
            "wood": 20,
            "stone": 10,
        },
        cycleSeconds: 10,
        produces: {
            "clay": 3,
        },
    },
    "potter": {
        id: "potter",
        name: "Potter's Workshop",
        cost: {
            "wood": 10,
            "stone": 20,
        },
        cycleSeconds: 15,
        consumes: {
            "clay": 2,
        },
        produces: {
            "pottery": 1,
        },
    },
    "brick_kiln": {
        id: "brick_kiln",
        name: "Brick Kiln",
        cost: {
            "stone": 50,
        },
        cycleSeconds: 30,
        consumes: {
            "clay": 5,
        },
        produces: {
            "bricks": 5,
        },
    },
}
