/**
 * PixelPipeline
 * Renders a scene at a fixed LOW internal resolution into an offscreen
 * render target (nearest-filtered, no mipmaps), then blits that texture
 * up to the real canvas size with nearest-neighbor sampling — the crisp
 * "pixel-perfect HD-2D" look (Octopath Traveler / 13 Sentinels style),
 * as opposed to a blurry bilinear upscale.
 *
 * Deliberately a separate class from IsometricRenderer (per the file
 * structure in DRIFTER_ENGINE_PLAN.md) — IsometricRenderer owns the
 * camera/scene, PixelPipeline only owns the resolution/blit concern, so
 * either can be swapped independently later (e.g. dynamic res scaling).
 */

import * as THREE from 'three';

export interface PixelPipelineOptions {
  internalWidth?: number;  // default 384 — low internal res, scaled up
  internalHeight?: number; // default 216 (16:9 at 384x216)
  pixelScale?: number;     // optional fixed integer scale; auto-fit if omitted
}

export class PixelPipeline {
  readonly internalWidth: number;
  readonly internalHeight: number;

  private renderTarget: THREE.WebGLRenderTarget;
  private blitScene: THREE.Scene;
  private blitCamera: THREE.OrthographicCamera;
  private blitMesh: THREE.Mesh;
  private blitMaterial: THREE.MeshBasicMaterial;
  private fixedPixelScale: number | null;

  constructor(options: PixelPipelineOptions = {}) {
    this.internalWidth = options.internalWidth ?? 384;
    this.internalHeight = options.internalHeight ?? 216;
    this.fixedPixelScale = options.pixelScale ?? null;

    this.renderTarget = new THREE.WebGLRenderTarget(this.internalWidth, this.internalHeight, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      generateMipmaps: false,
      colorSpace: THREE.SRGBColorSpace,
    });

    // Full-screen blit quad: its own minimal scene/camera, decoupled from
    // the game's IsometricRenderer scene entirely.
    this.blitScene = new THREE.Scene();
    this.blitCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.blitMaterial = new THREE.MeshBasicMaterial({
      map: this.renderTarget.texture,
      depthTest: false,
      depthWrite: false,
    });
    this.blitMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.blitMaterial);
    this.blitScene.add(this.blitMesh);
  }

  getRenderTarget(): THREE.WebGLRenderTarget {
    return this.renderTarget;
  }

  /**
   * Step 1: render the real scene at low internal resolution into the
   * offscreen target. Call this with the game's actual scene/camera.
   */
  renderScene(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera): void {
    renderer.setRenderTarget(this.renderTarget);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
  }

  /**
   * Step 2: blit the low-res target up to the canvas's actual size with
   * nearest-neighbor sampling. Computes an integer pixel scale that fits
   * the canvas (letterboxing if the aspect doesn't divide evenly) unless
   * a fixed pixelScale was passed in the constructor.
   */
  blitToScreen(renderer: THREE.WebGLRenderer, canvasWidth: number, canvasHeight: number): void {
    const scale = this.fixedPixelScale ?? Math.max(
      1,
      Math.floor(Math.min(canvasWidth / this.internalWidth, canvasHeight / this.internalHeight))
    );

    const drawWidth = this.internalWidth * scale;
    const drawHeight = this.internalHeight * scale;
    const offsetX = Math.floor((canvasWidth - drawWidth) / 2);
    const offsetY = Math.floor((canvasHeight - drawHeight) / 2);

    renderer.setRenderTarget(null);
    renderer.setScissorTest(true);
    renderer.setScissor(offsetX, offsetY, drawWidth, drawHeight);
    renderer.setViewport(offsetX, offsetY, drawWidth, drawHeight);
    renderer.render(this.blitScene, this.blitCamera);
    renderer.setScissorTest(false);
    renderer.setViewport(0, 0, canvasWidth, canvasHeight);
  }

  dispose(): void {
    this.renderTarget.dispose();
    this.blitMaterial.dispose();
    this.blitMesh.geometry.dispose();
  }
}
