import * as THREE from 'three';
import { IsometricRenderer } from '../render/IsometricRenderer.js';
import { SkySystem } from '../render/SkySystem.js';
export class GameRuntime {
    constructor(engine, zone) {
        this.heldKeys = new Set();
        this.animationFrame = null;
        this.lastTimestamp = performance.now();
        this.drifterMesh = null;
        this.sceneObjects = [];
        this.tick = (timestamp) => {
            const deltaSeconds = Math.min(0.05, (timestamp - this.lastTimestamp) / 1000);
            this.lastTimestamp = timestamp;
            const input = this.getInputVector();
            this.engine.update(deltaSeconds, input, []);
            const drifterPosition = this.engine.drifter.position;
            if (this.drifterMesh && drifterPosition) {
                const maxDimension = Math.max(this.zone.size.width, this.zone.size.height, 24);
                const sceneX = (drifterPosition.x / maxDimension) * 12 - 6;
                const sceneZ = (drifterPosition.y / maxDimension) * 12 - 6;
                this.drifterMesh.position.set(sceneX, 0.45, sceneZ);
            }
            this.sky.update(deltaSeconds, {
                timeOfDay: this.zone.timeOfDay,
                weatherState: this.zone.weatherState,
                fogIntensity: this.zone.fogIntensity,
                wrongnessState: this.zone.wrongnessState,
                zoneSeed: this.zone.seed,
            });
            this.renderer.syncSky(deltaSeconds);
            this.renderer.render();
            this.animationFrame = window.requestAnimationFrame(this.tick);
        };
        this.onKeyDown = (event) => {
            // Allow Escape to return to the main menu (if HomeScreen is present on window)
            if (event.key === 'Escape') {
                try {
                    const app = window.__DRIFTER_APP;
                    if (app && typeof app.showMenu === 'function') {
                        app.showMenu();
                    }
                }
                catch (e) {
                    // ignore
                }
                return;
            }
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(event.key)) {
                event.preventDefault();
            }
            this.heldKeys.add(event.key.toLowerCase());
        };
        this.onKeyUp = (event) => {
            this.heldKeys.delete(event.key.toLowerCase());
        };
        this.onResize = () => {
            this.handleResize();
        };
        this.engine = engine;
        this.zone = zone;
        this.canvas = document.createElement('canvas');
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.display = 'block';
        this.canvas.style.imageRendering = 'pixelated';
        this.renderer = new IsometricRenderer({
            canvas: this.canvas,
            viewSize: 14,
            cameraDistance: 30,
            pixelPipeline: { internalWidth: 384, internalHeight: 216 },
        });
        this.sky = new SkySystem({
            textureWidth: 512,
            textureHeight: 512,
            zoneSeed: this.zone.seed,
        });
    }
    start() {
        this.sky.init();
        this.renderer.attachSky(this.sky);
        this.sky.applyZone(this.zone);
        this.renderer.syncSky();
        this.buildScene();
        this.engine.zoneStreamer.moveTo({ col: 0, row: 0 });
        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);
        window.addEventListener('resize', this.onResize);
        this.lastTimestamp = performance.now();
        this.animationFrame = window.requestAnimationFrame(this.tick);
    }
    stop() {
        if (this.animationFrame !== null) {
            window.cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
        window.removeEventListener('resize', this.onResize);
        this.disposeSceneObjects();
        this.renderer.dispose();
    }
    handleResize() {
        this.renderer.handleResize();
    }
    getInputVector() {
        let x = 0;
        let y = 0;
        if (this.heldKeys.has('arrowright') || this.heldKeys.has('d'))
            x += 1;
        if (this.heldKeys.has('arrowleft') || this.heldKeys.has('a'))
            x -= 1;
        if (this.heldKeys.has('arrowdown') || this.heldKeys.has('s'))
            y += 1;
        if (this.heldKeys.has('arrowup') || this.heldKeys.has('w'))
            y -= 1;
        return { x, y };
    }
    buildScene() {
        this.disposeSceneObjects();
        const ground = new THREE.Mesh(new THREE.PlaneGeometry(24, 24, 24, 24), new THREE.MeshStandardMaterial({ color: 0x11151d, roughness: 1, metalness: 0.05 }));
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.renderer.scene.add(ground);
        this.sceneObjects.push(ground);
        const grid = new THREE.GridHelper(24, 24, 0x2f3948, 0x161c24);
        grid.position.y = 0.01;
        this.renderer.scene.add(grid);
        this.sceneObjects.push(grid);
        const maxDimension = Math.max(this.zone.size.width, this.zone.size.height, 24);
        const drifter = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.9, 0.45), new THREE.MeshStandardMaterial({ color: 0x8fd1ff, emissive: 0x17344d, emissiveIntensity: 0.4 }));
        drifter.position.set(0, 0.45, 0);
        this.renderer.scene.add(drifter);
        this.drifterMesh = drifter;
        this.sceneObjects.push(drifter);
        for (const building of this.zone.buildings ?? []) {
            const diorama = this.engine.buildingFactory.build(building, this.zone.id);
            const x = (building.position.x / maxDimension) * 12 - 6;
            const z = (building.position.y / maxDimension) * 12 - 6;
            diorama.group.position.set(x, 0, z);
            this.renderer.scene.add(diorama.group);
            this.sceneObjects.push(diorama.group);
        }
    }
    disposeSceneObjects() {
        for (const object of this.sceneObjects) {
            this.renderer.scene.remove(object);
            if (object instanceof THREE.Mesh) {
                object.geometry.dispose();
                if (Array.isArray(object.material)) {
                    for (const material of object.material) {
                        material.dispose();
                    }
                }
                else {
                    object.material.dispose();
                }
            }
        }
        this.sceneObjects.length = 0;
        this.drifterMesh = null;
    }
}
//# sourceMappingURL=GameRuntime.js.map