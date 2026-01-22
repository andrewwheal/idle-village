import type { ResourceId } from "./resources";

export type ActionId = keyof typeof ACTIONS;

export type Action = {
    id: ActionId;
    name: string;
    produces: Partial<Record<ResourceId, number>>;
}

export const ACTIONS: Record<string, Action> = {
    "wood": {
        id: "wood",
        name: "Collect Wood",
        produces: {
            "wood": 1,
        },
    },
    "food": {
        id: "food",
        name: "Gather Food",
        produces: {
            "food": 1,
        },
    },
}