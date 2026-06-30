/**
 * IsometricRenderer
 * Owns the fixed-pitch, non-rotating orthographic isometric camera and the
 * main game scene. Delegates actual resolution/upscale handling to
 * PixelPipeline (kept separate per DRIFTER_ENGINE_PLAN.md's class list).
 *
 * Scope (step 2.2 / milestone M2 only): empty isometric scene + sky wired
 * in via SkySystem, rendering at the correct dusk/atmosphere look. No
 * player, tiles, or buildings yet — those come once this is confirmed
 * visually solid (the "does it feel like Another Sky" checkpoint).
 *
 * Camera: classic 2:1 "game isometric" — 45° yaw, ~35.264° pitch (true
 * isometric, matches Octopath/HD-2D convention) rather than an actual 45°
 * pitch, which reads as too steep/top-down for this style. Fixed — no
 * rotation, per the locked DRIFTER lore/build decisions (non-rotating
 * camera was an explicit call in the player sprite system too).
 */

import * as THREE from 'three';
import { PixelPipeline, type PixelPipelineOptions } from './PixelPipeline.js';
import type { SkySystem } from './SkySystem.js';

const ISO_YAW_DEG = 45;
const ISO_PITCH_DEG = 35.264; // true isometric angle (atan(1/sqrt(2)))

export interface IsometricRendererOptions {
  canvas: HTMLCanvasElement;
  viewSize?: number;             // world units visible vertically, default 10
  cameraDistance?: number;       // default 30 (just needs to clear the scene)
  pixelPipeline?: PixelPipelineOptions;
}

export class IsometricRenderer {
  readonly scene: THREE.Scene;
  readonly camera: THREE.OrthographicCamera;
  readonly renderer: THREE.WebGLRenderer;
  readonly pixelPipeline: PixelPipeline;

  private canvas: HTMLCanvasElement;
  private viewSize: number;
  private cameraDistance: number;
  private skyDome: THREE.Mesh | null = null;
  private ambientLight: THREE.AmbientLight;
  private directionalLight: THREE.DirectionalLight | null = null;
  private attachedSky: SkySystem | null = null;

  constructor(options: IsometricRendererOptions) {
    this.canvas = options.canvas;
    this.viewSize = options.viewSize ?? 10;
    this.cameraDistance = options.cameraDistance ?? 30;

    this.scene = new THREE.Scene();

    const aspect = this.canvas.clientWidth / this.canvas.clientHeight || 16 / 9;
    this.camera = this.buildIsoCamera(aspect);
    this.scene.add(this.camera);

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: false });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.pixelPipeline = new PixelPipeline(options.pixelPipeline);

    // Minimal default lighting so geometry is visible before a SkySystem
    // is attached; attachSky() replaces these colors/intensities.
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(this.ambientLight);

    this.handleResize();
  }

  private buildIsoCamera(aspect: number): THREE.OrthographicCamera {
    const halfH = this.viewSize / 2;
    const halfW = halfH * aspect;
    const camera = new THREE.OrthographicCamera(-halfW, halfW, halfH, -halfH, 0.1, 1000);

    const yaw = THREE.MathUtils.degToRad(ISO_YAW_DEG);
    const pitch = THREE.MathUtils.degToRad(ISO_PITCH_DEG);
    const d = this.cameraDistance;

    // Standard isometric placement: equal distance on X/Z, elevated on Y.
    const x = d * Math.cos(pitch) * Math.sin(yaw);
    const y = d * Math.sin(pitch);
    const z = d * Math.cos(pitch) * Math.cos(yaw);
    camera.position.set(x, y, z);
    camera.lookAt(0, 0, 0);

    return camera;
  }

  /**
   * Wires a SkySystem in as the single source of truth for ambient/fog
   * color and the background dome, per the locked architecture decision.
   * Call once after both are constructed, then call syncSky() each frame
   * (or whenever the sky bakes a new texture/light state) to keep them
   * in sync — SkySystem.update() must be called separately beforehand.
   */
  attachSky(sky: SkySystem): void {
    this.attachedSky = sky;

    if (!this.skyDome) {
      // Large plane behind the scene, not a literal dome — fine for a
      // fixed-pitch non-rotating camera (locked decision: no rotation,
      // same call made for the player sprite system) where the dome's
      // edges are never visible. Positioned once, facing the camera —
      // it never needs to move again since the camera angle is fixed.
      const domeSize = this.viewSize * 12;
      const geometry = new THREE.PlaneGeometry(domeSize, domeSize);
      const material = new THREE.MeshBasicMaterial({
        map: sky.getTexture(),
        depthWrite: false,
        depthTest: false,
        fog: false,
      });
      this.skyDome = new THREE.Mesh(geometry, material);
      this.skyDome.renderOrder = -1000; // always drawn first/behind
      this.skyDome.position.set(0, this.viewSize * 0.5, -this.viewSize * 4);
      this.skyDome.lookAt(this.camera.position);
      this.scene.add(this.skyDome);
    }

    if (!this.directionalLight) {
      this.directionalLight = sky.getDirectionalLight();
      this.scene.add(this.directionalLight);
    }

    this.scene.fog = new THREE.Fog(sky.fogColor.getHex(), this.cameraDistance * 0.6, this.cameraDistance * 2.2);

    this.syncSky();
  }

  /** Call each frame after sky.update() to push the latest bake into the renderer. */
  syncSky(): void {
    if (!this.attachedSky) return;
    const sky = this.attachedSky;

    this.ambientLight.color.copy(sky.getAmbientLight());

    if (this.directionalLight) {
      const fresh = sky.getDirectionalLight();
      this.directionalLight.color.copy(fresh.color);
      this.directionalLight.intensity = fresh.intensity;
      this.directionalLight.position.copy(fresh.position);
    }

    if (this.scene.fog instanceof THREE.Fog) {
      this.scene.fog.color.copy(sky.fogColor);
    }

    this.renderer.setClearColor(sky.fogColor);
  }

  /** Renders the scene through PixelPipeline (low-res bake -> nearest blit). */
  render(): void {
    this.pixelPipeline.renderScene(this.renderer, this.scene, this.camera);
    this.pixelPipeline.blitToScreen(this.renderer, this.canvas.clientWidth, this.canvas.clientHeight);
  }

  /** Call on window resize / canvas size change. */
  handleResize(): void {
    const width = this.canvas.clientWidth || this.canvas.width || 1;
    const height = this.canvas.clientHeight || this.canvas.height || 1;
    const aspect = width / height;

    const halfH = this.viewSize / 2;
    const halfW = halfH * aspect;
    this.camera.left = -halfW;
    this.camera.right = halfW;
    this.camera.top = halfH;
    this.camera.bottom = -halfH;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height, false);
  }

  dispose(): void {
    this.pixelPipeline.dispose();
    this.renderer.dispose();
    if (this.skyDome) {
      this.skyDome.geometry.dispose();
      (this.skyDome.material as THREE.Material).dispose();
    }
  }
}
