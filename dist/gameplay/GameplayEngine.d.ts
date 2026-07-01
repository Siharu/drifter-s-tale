import type { Drifter, Item, Interactable, Run, StoryHook, Vector2, Zone } from '../types.js';
import { DrifterEntity } from './DrifterEntity.js';
import { MovementController } from './MovementController.js';
import { InteractionSystem } from './InteractionSystem.js';
import { CatalogSystem } from './CatalogSystem.js';
import { InventorySystem } from './InventorySystem.js';
import { HuskSystem, HuskSystemOptions } from './HuskSystem.js';
import { WorldInfoLayer, WorldInfoDeposit, WorldInfoLayerOptions } from './WorldInfoLayer.js';
import { RunManager } from './RunManager.js';
export interface GameplayEngineOptions {
    seed: number;
    zone: Zone;
    startPosition: Vector2;
    maxDepositsPerRun?: number;
    huskOptions?: HuskSystemOptions;
    worldInfoOptions?: WorldInfoLayerOptions;
    rosterSeed?: number;
}
export declare class GameplayEngine {
    drifterEntity: DrifterEntity;
    drifter: Drifter;
    movementController: MovementController;
    interactionSystem: InteractionSystem;
    catalogSystem: CatalogSystem;
    inventorySystem: InventorySystem;
    huskSystem: HuskSystem;
    worldInfoLayer: WorldInfoLayer;
    runManager: RunManager;
    currentRun: Run;
    private roster;
    private depositCountThisRun;
    private maxDepositsPerRun;
    constructor(options: GameplayEngineOptions);
    update(deltaSeconds: number, input: Vector2, obstacles: Array<{
        position: Vector2;
        size: {
            width: number;
            height: number;
        };
    }>): void;
    pickUpItem(item: Item | unknown): boolean;
    investigateInteractable(interactable: Interactable): void;
    investigateStoryHook(hook: StoryHook): void;
    addWorldInfoDeposit(deposit: Omit<WorldInfoDeposit, 'id' | 'createdAt'>): WorldInfoDeposit | null;
    getDepositsForZone(zoneType: string, region?: string): WorldInfoDeposit[];
    failRun(cause: string): Run | null;
    completeRun(): Run | null;
    getCurrentRunSummary(): import("../types.js").RunSummary[];
    getDrifter(): Drifter;
}
//# sourceMappingURL=GameplayEngine.d.ts.map