import type { Zone } from '../types.js';
import type { GameplayEngine } from '../gameplay/index.js';
export declare class GameRuntime {
    readonly canvas: HTMLCanvasElement;
    private readonly engine;
    private readonly zone;
    private readonly renderer;
    private readonly sky;
    private readonly heldKeys;
    private animationFrame;
    private lastTimestamp;
    private drifterMesh;
    private sceneObjects;
    constructor(engine: GameplayEngine, zone: Zone);
    start(): void;
    stop(): void;
    handleResize(): void;
    private getInputVector;
    private buildScene;
    private disposeSceneObjects;
    private tick;
    private onKeyDown;
    private onKeyUp;
    private onResize;
}
//# sourceMappingURL=GameRuntime.d.ts.map