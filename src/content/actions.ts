import type { ResourceId } from "./resources";
import {RESOURCE_DEFINITIONS} from "./resources";

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
    }
}

if (import.meta.env.DEV) {
    const throwaway_amounts: Record<ResourceId, number> = {};
    for (const resourceId of Object.keys(RESOURCE_DEFINITIONS)) {
        throwaway_amounts[resourceId as ResourceId] = RESOURCE_DEFINITIONS[resourceId as ResourceId].baseCapacity * -0.2;
    }

    ACTIONS["throwaway"] = {
        id: "throwaway",
        name: "Throw Away",
        produces: throwaway_amounts,
    }
}
