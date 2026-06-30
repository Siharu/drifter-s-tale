#!/usr/bin/env bash
set -e

echo "── DRIFTER setup: writing config + source files ──"

cat > package.json << 'PKGEOF'
{
  "name": "drifter",
  "version": "0.0.1",
  "type": "module",
  "description": "Procedural investigation-survival RPG engine for Another Sky universe",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "type-check": "tsc --noEmit"
  },
  "keywords": ["another-sky", "investigation", "survival", "procedural", "isometric"],
  "author": "Siharu",
  "license": "MIT",
  "devDependencies": {
    "typescript": "^5.3.0"
  },
  "dependencies": {
    "three": "^r128"
  }
}
PKGEOF

cat > tsconfig.json << 'TSEOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2020", "DOM"],
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
TSEOF

cat > .gitignore << 'GITEOF'
node_modules/
dist/
*.js
*.d.ts
*.js.map
*.tsbuildinfo
.DS_Store
.env
.env.local
.vscode/
.idea/
*.swp
*.swo
*~
.turbo/
.cache/
GITEOF

mkdir -p src

cat > src/types.ts << 'TYPESEOF'
/**
 * DRIFTER ENGINE TYPE DEFINITIONS
 * No implementation — pure schema/contracts
 */

// ─── IDENTIFIERS ───
export type ZoneID = string & { readonly __brand: 'ZoneID' };
export type BuildingID = string & { readonly __brand: 'BuildingID' };
export type RoomID = string & { readonly __brand: 'RoomID' };
export type ItemID = string & { readonly __brand: 'ItemID' };
export type WeaponID = string & { readonly __brand: 'WeaponID' };
export type HazardID = string & { readonly __brand: 'HazardID' };
export type InteractableID = string & { readonly __brand: 'InteractableID' };
export type DrifterID = string & { readonly __brand: 'DrifterID' };
export type RunID = string & { readonly __brand: 'RunID' };
export type EntryID = string & { readonly __brand: 'EntryID' };
export type EvidenceChainID = string & { readonly __brand: 'EvidenceChainID' };
export type StoryHookID = string & { readonly __brand: 'StoryHookID' };

// ─── ENUMS ───
export enum ZoneType {
  RESIDENTIAL_DISTRICT = 'RESIDENTIAL_DISTRICT',
  INDUSTRIAL_COMPLEX = 'INDUSTRIAL_COMPLEX',
  RURAL_RELAY = 'RURAL_RELAY',
  SIGNAL_HUB = 'SIGNAL_HUB',
  ARCHIVE = 'ARCHIVE',
  RUINS = 'RUINS',
}

export enum BuildingType {
  RESIDENTIAL = 'RESIDENTIAL',
  INDUSTRIAL = 'INDUSTRIAL',
  SIGNAL_TOWER = 'SIGNAL_TOWER',
  ARCHIVE = 'ARCHIVE',
  MAINTENANCE = 'MAINTENANCE',
  RADIO_STATION = 'RADIO_STATION',
  POWER_PLANT = 'POWER_PLANT',
  WAREHOUSE = 'WAREHOUSE',
}

export enum RoomType {
  OFFICE = 'OFFICE',
  STORAGE = 'STORAGE',
  RADIO_STATION = 'RADIO_STATION',
  SERVER_ROOM = 'SERVER_ROOM',
  ARCHIVE = 'ARCHIVE',
  HALLWAY = 'HALLWAY',
  BASEMENT = 'BASEMENT',
  ROOFTOP = 'ROOFTOP',
  LIVING_QUARTERS = 'LIVING_QUARTERS',
  LABORATORY = 'LABORATORY',
}

export enum WeatherType {
  CLEAR = 'CLEAR',
  OVERCAST = 'OVERCAST',
  FOG_HEAVY = 'FOG_HEAVY',
  ACID_RAIN = 'ACID_RAIN',
  DEAD_CALM = 'DEAD_CALM',
  STATIC_STORM = 'STATIC_STORM',
  DUST_EVENT = 'DUST_EVENT',
}

export enum HazardType {
  HUSK_NEST = 'HUSK_NEST',
  FOG_POCKET = 'FOG_POCKET',
  SIGNAL_DEAD_ZONE = 'SIGNAL_DEAD_ZONE',
  STRUCTURAL_DECAY = 'STRUCTURAL_DECAY',
  ACID_RAIN_ZONE = 'ACID_RAIN_ZONE',
  ANOMALY = 'ANOMALY',
}

export enum InteractableType {
  ITEM = 'ITEM',
  DOOR = 'DOOR',
  ANOMALY = 'ANOMALY',
  HQ_ENTRANCE = 'HQ_ENTRANCE',
  INVESTIGATION_POINT = 'INVESTIGATION_POINT',
}

export enum LogbookEntryType {
  ITEM = 'ITEM',
  DOCUMENT = 'DOCUMENT',
  PHOTO = 'PHOTO',
  BROADCAST = 'BROADCAST',
  DEDUCTION = 'DEDUCTION',
  NOTE = 'NOTE',
}

export enum Direction {
  N = 'N',
  NE = 'NE',
  E = 'E',
  SE = 'SE',
  S = 'S',
  SW = 'SW',
  W = 'W',
  NW = 'NW',
}

export enum RunStatus {
  ACTIVE = 'ACTIVE',
  SUCCESS = 'SUCCESS',
  DEATH = 'DEATH',
}

// ─── VECTORS ───
export interface Vector2 {
  x: number;
  y: number;
}

export interface Vector2Int {
  x: number;
  y: number;
}

export interface Size2 {
  width: number;
  height: number;
}

// ─── ZONE ───
export interface Zone {
  id: ZoneID;
  name: string;
  type: ZoneType;
  position: Vector2;
  size: Size2;
  
  seed: number;
  timeOfDay: number; // 0–24 (hours)
  weatherState: WeatherType;
  fogIntensity: number; // 0–1, Fog of Medusa
  decayLevel: number; // 0–1
  
  buildings: Building[];
  hazards: Hazard[];
  storyHooks: StoryHook[];
  items: Item[];
  
  hqEntrance: {
    position: Vector2;
    interactable: boolean;
  } | null;
}

// ─── BUILDING ───
export interface Building {
  id: BuildingID;
  name: string;
  type: BuildingType;
  position: Vector2;
  size: Size2;
  
  rooms: Room[];
  collisionGrid: boolean[][]; // true = blocked
  
  items: Item[];
  hazards: Hazard[];
  storyHooks: StoryHook[];
  interactables: Interactable[];
  
  svgMesh: unknown; // THREE.Mesh, but avoid Three.js in types
  decayState: number; // 0–1
  exploredState: number; // 0–1
}

// ─── ROOM ───
export interface Room {
  id: RoomID;
  name: string;
  position: Vector2Int; // Building-relative grid coords
  size: Size2;
  type: RoomType;
  
  items: Item[];
  hazards: Hazard[];
  interactables: Interactable[];
  
  exploredState: number; // 0–1
  decayState: number; // 0–1
}

// ─── ITEM ───
export interface Item {
  id: ItemID;
  name: string;
  description: string;
  iconIndex: number; // References navigator/items/{index}.png
  
  isWeapon: false;
  value: number; // Resource value if extracted
  weight: number; // For inventory slots
  
  position: Vector2;
  buildingID: BuildingID;
  roomID: RoomID | null;
}

// ─── WEAPON ───
export interface Weapon {
  id: WeaponID;
  name: string;
  description: string;
  iconIndex: number; // References navigator/weps/{index}.png
  
  isWeapon: true;
  damage: number;
  
  position: Vector2;
  buildingID: BuildingID;
  roomID: RoomID | null;
}

// ─── HAZARD ───
export interface Hazard {
  id: HazardID;
  type: HazardType;
  position: Vector2;
  radius: number;
  intensity: number; // 0–1
  
  spawnTime: number; // World time when spawned
  maxIntensity: number;
  rampSpeed: number; // Intensity increase per second
  
  zoneID: ZoneID;
  buildingID: BuildingID | null;
}

// ─── INTERACTABLE ───
export interface Interactable {
  id: InteractableID;
  type: InteractableType;
  position: Vector2;
  
  linkedItem?: Item;
  linkedRoom?: RoomID;
  linkedStoryHook?: StoryHook;
  
  investigated: boolean;
}

// ─── STORY HOOK ───
export interface StoryHook {
  id: StoryHookID;
  name: string;
  description: string;
  
  linkedEntry: EntryID;
  linkedChain?: EvidenceChainID;
  
  position: Vector2;
  buildingID: BuildingID;
  roomID?: RoomID;
  
  discoveryCondition: 'PROXIMITY' | 'INVESTIGATION' | 'PICKUP';
}

// ─── DISCOVERY / LOGBOOK ───
export interface LogbookEntry {
  id: EntryID;
  type: LogbookEntryType;
  
  title: string;
  text: string;
  timestamp: number;
  
  tags: string[];
  relatedEntries: EntryID[];
  chainID?: EvidenceChainID;
  
  image?: string;
  portraitEmotion?: string;
}

export interface EvidenceChain {
  id: EvidenceChainID;
  name: string;
  
  requiredEntries: EntryID[];
  deduction: LogbookEntry;
  
  progress: number; // 0–1
}

// ─── DRIFTER ───
export interface DrifterAppearance {
  variant: number; // 1–3 (from WNCORE portrait pack)
  emotion: string; // Handler portrait emotion
}

export interface Drifter {
  id: DrifterID;
  name: string;
  origin: string;
  appearance: DrifterAppearance;
  
  position: Vector2;
  facing: Direction;
  currentZone: ZoneID;
  currentBuilding: BuildingID | null;
  currentRoom: RoomID | null;
  
  health: number; // 0–100
  signalStrength: number; // 0–100
  airQuality: number; // 0–100
  
  inventory: (Item | Weapon)[];
  maxInventory: number;
  
  logbook: LogbookEntry[];
  evidenceChains: EvidenceChain[];
  
  runID: RunID;
  timeAlive: number; // Seconds
}

// ─── RUN / PERMADEATH ───
export interface Run {
  id: RunID;
  drifter: Drifter;
  
  startTime: number;
  endTime: number | null;
  
  worldSeed: number;
  worldTimeOfDay: number;
  
  resourcesCollected: Item[];
  logbookFinal: LogbookEntry[];
  deductionsMade: LogbookEntry[];
  
  status: RunStatus;
  causeOfDeath?: string;
}

export interface RunSummary {
  runID: RunID;
  drifterName: string;
  duration: number; // Seconds
  resourcesExtracted: number;
  deductionsMade: number;
  status: RunStatus;
  causeOfDeath?: string;
  timestamp: number;
}

// ─── WORLD ───
export interface World {
  seed: number;
  zones: Zone[];
  hqPosition: Vector2;
  
  timeOfDay: number; // 0–24
  era: string; // "Early Collapse" | "Peak Decay" | "Stabilization" etc.
  difficulty: number; // 1–10
}

// ─── GENERATION OPTIONS ───
export interface WorldGenOptions {
  seed: number;
  zoneCount: number;
  difficulty: number;
  era: string;
  hqPosition?: Vector2;
}

export interface BuildingGenOptions {
  seed: number;
  type: BuildingType;
  maxRooms: number;
  decayState: number;
}
TYPESEOF

cat > src/utils.ts << 'UTILSEOF'
/**
 * DRIFTER ENGINE UTILITIES
 * Seeded random, vector math, grid helpers
 */

import type { Vector2, Vector2Int, Size2 } from './types.js';

// ─── SEEDED RANDOM ───
/**
 * Mulberry32: Fast, minimal PRNG with seed
 * Returns value 0–1
 */
export class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed >>> 0; // Ensure 32-bit unsigned
  }

  next(): number {
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Random integer in range [min, max]
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Random element from array
   */
  pick<T>(arr: T[]): T {
    return arr[this.nextInt(0, arr.length - 1)];
  }

  /**
   * Random float in range [min, max)
   */
  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  /**
   * Shuffle array in-place (Fisher-Yates)
   */
  shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}

// ─── VECTOR MATH ───
export namespace Vec2 {
  export function create(x: number = 0, y: number = 0): Vector2 {
    return { x, y };
  }

  export function add(a: Vector2, b: Vector2): Vector2 {
    return { x: a.x + b.x, y: a.y + b.y };
  }

  export function subtract(a: Vector2, b: Vector2): Vector2 {
    return { x: a.x - b.x, y: a.y - b.y };
  }

  export function multiply(v: Vector2, scalar: number): Vector2 {
    return { x: v.x * scalar, y: v.y * scalar };
  }

  export function distance(a: Vector2, b: Vector2): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  export function magnitude(v: Vector2): number {
    return Math.sqrt(v.x * v.x + v.y * v.y);
  }

  export function normalize(v: Vector2): Vector2 {
    const mag = magnitude(v);
    if (mag === 0) return { x: 0, y: 0 };
    return { x: v.x / mag, y: v.y / mag };
  }

  export function clamp(v: Vector2, bounds: Size2): Vector2 {
    return {
      x: Math.max(0, Math.min(v.x, bounds.width)),
      y: Math.max(0, Math.min(v.y, bounds.height)),
    };
  }

  export function equals(a: Vector2, b: Vector2, epsilon: number = 0.0001): boolean {
    return Math.abs(a.x - b.x) < epsilon && Math.abs(a.y - b.y) < epsilon;
  }
}

// ─── GRID MATH ───
export namespace Grid {
  /**
   * Check if coordinate is within grid bounds
   */
  export function inBounds(pos: Vector2Int, size: Size2): boolean {
    return pos.x >= 0 && pos.x < size.width && pos.y >= 0 && pos.y < size.height;
  }

  /**
   * Convert world position to grid cell
   */
  export function worldToGrid(worldPos: Vector2, tileSize: number = 256): Vector2Int {
    return {
      x: Math.floor(worldPos.x / tileSize),
      y: Math.floor(worldPos.y / tileSize),
    };
  }

  /**
   * Convert grid cell to world position (center)
   */
  export function gridToWorld(gridPos: Vector2Int, tileSize: number = 256): Vector2 {
    return {
      x: gridPos.x * tileSize + tileSize / 2,
      y: gridPos.y * tileSize + tileSize / 2,
    };
  }

  /**
   * Get neighboring grid cells (4-connected or 8-connected)
   */
  export function getNeighbors(
    pos: Vector2Int,
    size: Size2,
    diagonal: boolean = false
  ): Vector2Int[] {
    const neighbors: Vector2Int[] = [];
    const directions = diagonal
      ? [
          { x: 0, y: -1 }, // N
          { x: 1, y: -1 }, // NE
          { x: 1, y: 0 },  // E
          { x: 1, y: 1 },  // SE
          { x: 0, y: 1 },  // S
          { x: -1, y: 1 }, // SW
          { x: -1, y: 0 }, // W
          { x: -1, y: -1 }, // NW
        ]
      : [
          { x: 0, y: -1 }, // N
          { x: 1, y: 0 },  // E
          { x: 0, y: 1 },  // S
          { x: -1, y: 0 }, // W
        ];

    for (const dir of directions) {
      const nx = pos.x + dir.x;
      const ny = pos.y + dir.y;
      if (inBounds({ x: nx, y: ny }, size)) {
        neighbors.push({ x: nx, y: ny });
      }
    }
    return neighbors;
  }

  /**
   * Bresenham's line algorithm (grid cells between two points)
   */
  export function lineBresenham(
    from: Vector2Int,
    to: Vector2Int
  ): Vector2Int[] {
    const line: Vector2Int[] = [];
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);
    const sx = from.x < to.x ? 1 : -1;
    const sy = from.y < to.y ? 1 : -1;
    let err = dx - dy;

    let x = from.x;
    let y = from.y;

    while (true) {
      line.push({ x, y });
      if (x === to.x && y === to.y) break;

      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }
    return line;
  }

  /**
   * Circle fill (Midpoint algorithm)
   */
  export function circleFill(center: Vector2Int, radius: number): Vector2Int[] {
    const cells: Vector2Int[] = [];
    const r2 = radius * radius;

    for (let x = -radius; x <= radius; x++) {
      for (let y = -radius; y <= radius; y++) {
        if (x * x + y * y <= r2) {
          cells.push({ x: center.x + x, y: center.y + y });
        }
      }
    }
    return cells;
  }
}

// ─── ID GENERATION ───
export namespace ID {
  /**
   * Generate branded type ID from base string
   */
  export function create<T extends string>(base: string): T {
    return `${base}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` as T;
  }

  /**
   * Generate deterministic ID from seed + type
   */
  export function deterministic(seed: number, type: string): string {
    const rng = new SeededRandom(seed);
    return `${type}-${rng.nextInt(100000, 999999)}`;
  }
}

// ─── NOISE (Perlin-like for world generation) ───
/**
 * Simple 2D value noise (not Perlin, but deterministic and smooth)
 * Returns 0–1
 */
export function valueNoise2D(x: number, y: number, seed: number): number {
  const rng = new SeededRandom(seed);
  
  // Hash the coordinates
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;

  // Get noise values at corners
  const n00 = rng.next();
  const n10 = rng.next();
  const n01 = rng.next();
  const n11 = rng.next();

  // Smooth interpolation (Hermite curve)
  const u = xf * xf * (3.0 - 2.0 * xf);
  const v = yf * yf * (3.0 - 2.0 * yf);

  const nx0 = n00 * (1.0 - u) + n10 * u;
  const nx1 = n01 * (1.0 - u) + n11 * u;
  return nx0 * (1.0 - v) + nx1 * v;
}

// ─── COLLISION ───
export namespace Collision {
  /**
   * AABB (axis-aligned bounding box) overlap
   */
  export function aabbOverlap(
    a: { pos: Vector2; size: Size2 },
    b: { pos: Vector2; size: Size2 }
  ): boolean {
    return (
      a.pos.x < b.pos.x + b.size.width &&
      a.pos.x + a.size.width > b.pos.x &&
      a.pos.y < b.pos.y + b.size.height &&
      a.pos.y + a.size.height > b.pos.y
    );
  }

  /**
   * Circle-circle distance check
   */
  export function circleDistance(
    a: { pos: Vector2; radius: number },
    b: { pos: Vector2; radius: number }
  ): number {
    return Vec2.distance(a.pos, b.pos) - (a.radius + b.radius);
  }

  /**
   * Point in circle
   */
  export function pointInCircle(
    point: Vector2,
    circle: { pos: Vector2; radius: number }
  ): boolean {
    return Vec2.distance(point, circle.pos) <= circle.radius;
  }

  /**
   * Point in rectangle
   */
  export function pointInRect(
    point: Vector2,
    rect: { pos: Vector2; size: Size2 }
  ): boolean {
    return (
      point.x >= rect.pos.x &&
      point.x <= rect.pos.x + rect.size.width &&
      point.y >= rect.pos.y &&
      point.y <= rect.pos.y + rect.size.height
    );
  }
}
UTILSEOF

cat > src/worldgen.ts << 'WORLDGENEOF'
/**
 * WORLD GENERATOR
 * Procedurally generates zones, buildings, rooms, hazards, content
 */

import {
  type Zone,
  type Building,
  type Room,
  type Item,
  type Hazard,
  type StoryHook,
  type Vector2,
  type Vector2Int,
  type WorldGenOptions,
  ZoneType,
  BuildingType,
  RoomType,
  WeatherType,
  HazardType,
  InteractableType,
  type ZoneID,
  type BuildingID,
  type RoomID,
  type ItemID,
  type HazardID,
  type InteractableID,
} from './types.js';

import { SeededRandom, ID, valueNoise2D } from './utils.js';
import type { Interactable } from './types.js';

export class WorldGenerator {
  private seed: number;
  private rng: SeededRandom;
  private options: WorldGenOptions;

  // Caches (avoid regenerating)
  private zones: Map<ZoneID, Zone> = new Map();
  private buildings: Map<BuildingID, Building> = new Map();
  private rooms: Map<RoomID, Room> = new Map();

  constructor(options: WorldGenOptions) {
    this.options = options;
    this.seed = options.seed;
    this.rng = new SeededRandom(this.seed);
  }

  /**
   * Generate entire world
   */
  public generate(): {
    zones: Zone[];
    hqPosition: Vector2;
  } {
    const zones: Zone[] = [];
    const hqPosition = this.options.hqPosition || { x: 256, y: 256 };

    // Generate zone grid layout
    const zoneGrid = this.generateZoneGrid(this.options.zoneCount);

    for (const zonePos of zoneGrid) {
      const zone = this.generateZone(zonePos);
      zones.push(zone);
      this.zones.set(zone.id, zone);
    }

    return { zones, hqPosition };
  }

  /**
   * Generate zone grid positions
   * Layout: sqrt(count) × sqrt(count) grid
   */
  private generateZoneGrid(count: number): Vector2[] {
    const gridSize = Math.ceil(Math.sqrt(count));
    const zoneSize = 2048; // World units per zone
    const positions: Vector2[] = [];

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (positions.length >= count) break;
        positions.push({
          x: i * zoneSize,
          y: j * zoneSize,
        });
      }
      if (positions.length >= count) break;
    }

    return positions;
  }

  /**
   * Generate single zone
   */
  private generateZone(position: Vector2): Zone {
    const zoneSeed = this.rng.nextInt(0, 1000000);
    const zoneRng = new SeededRandom(zoneSeed);
    const zoneID = ID.create<ZoneID>(`zone-${position.x}-${position.y}`);

    const zoneType = this.selectZoneType(zoneRng);
    const weatherState = zoneRng.pick(Object.values(WeatherType));

    // Generate buildings for this zone
    const buildingCount = zoneRng.nextInt(8, 12);
    const buildings: Building[] = [];
    const hazards: Hazard[] = [];
    const items: Item[] = [];
    const storyHooks: StoryHook[] = [];

    for (let i = 0; i < buildingCount; i++) {
      const buildingPos: Vector2 = {
        x: position.x + zoneRng.nextFloat(100, 1900),
        y: position.y + zoneRng.nextFloat(100, 1900),
      };

      const building = this.generateBuilding(buildingPos, zoneRng);
      buildings.push(building);
      this.buildings.set(building.id, building);

      // Extract building's items and hazards
      items.push(...building.items);
      hazards.push(...building.hazards);
      storyHooks.push(...building.storyHooks);
    }

    // Generate environmental hazards
    const envHazards = this.generateEnvironmentalHazards(zoneID, position, zoneRng);
    hazards.push(...envHazards);

    const zone: Zone = {
      id: zoneID,
      name: this.generateZoneName(zoneType, zoneRng),
      type: zoneType,
      position,
      size: { width: 2048, height: 2048 },

      seed: zoneSeed,
      timeOfDay: zoneRng.nextFloat(0, 24),
      weatherState,
      fogIntensity: valueNoise2D(position.x, position.y, zoneSeed) * 0.8,
      decayLevel: this.calculateDecayLevel(zoneType, this.options.difficulty),

      buildings,
      hazards,
      storyHooks,
      items,

      hqEntrance: null, // Set separately if needed
    };

    return zone;
  }

  /**
   * Generate single building
   */
  private generateBuilding(position: Vector2, rng: SeededRandom): Building {
    const buildingID = ID.create<BuildingID>('building');
    const buildingType = this.selectBuildingType(rng);

    const roomCount = rng.nextInt(4, 8);
    const rooms: Room[] = [];
    const items: Item[] = [];
    const hazards: Hazard[] = [];
    const storyHooks: StoryHook[] = [];
    const interactables: Interactable[] = [];

    // Generate rooms for building
    for (let i = 0; i < roomCount; i++) {
      const roomPos: Vector2Int = {
        x: i % 2,
        y: Math.floor(i / 2),
      };

      const room = this.generateRoom(buildingID, roomPos, rng);
      rooms.push(room);
      this.rooms.set(room.id, room);

      // Aggregate room content
      items.push(...room.items);
      hazards.push(...room.hazards);
      interactables.push(...room.interactables);
    }

    // Generate building-level hazards
    const buildingHazards = this.generateBuildingHazards(buildingID, rng);
    hazards.push(...buildingHazards);

    // Generate collision grid (simplified: blocked cells)
    const collisionGrid = this.generateCollisionGrid(roomCount, rng);

    const building: Building = {
      id: buildingID,
      name: this.generateBuildingName(buildingType, rng),
      type: buildingType,
      position,
      size: { width: 512, height: 512 },

      rooms,
      collisionGrid,

      items,
      hazards,
      storyHooks,
      interactables,

      svgMesh: null, // Assigned by renderer

      decayState: rng.nextFloat(0, 1),
      exploredState: 0,
    };

    return building;
  }

  /**
   * Generate single room
   */
  private generateRoom(
    buildingID: BuildingID,
    position: Vector2Int,
    rng: SeededRandom
  ): Room {
    const roomID = ID.create<RoomID>('room');
    const roomType = rng.pick(Object.values(RoomType));

    const items: Item[] = [];
    const hazards: Hazard[] = [];
    const interactables: Interactable[] = [];

    // Random items in room
    const itemCount = rng.nextInt(1, 5);
    for (let i = 0; i < itemCount; i++) {
      const item = this.generateItem(buildingID, roomID, rng);
      if (item) items.push(item);
    }

    // Random hazards in room
    if (rng.next() > 0.7) {
      const hazard = this.generateRoomHazard(roomID, rng);
      hazards.push(hazard);
    }

    // Interactables
    interactables.push(
      ...this.generateInteractables(roomID, roomType, rng)
    );

    const room: Room = {
      id: roomID,
      name: `${roomType} (${position.x}, ${position.y})`,
      position,
      size: { width: 256, height: 256 },
      type: roomType,

      items,
      hazards,
      interactables,

      exploredState: 0,
      decayState: rng.nextFloat(0, 1),
    };

    return room;
  }

  /**
   * Generate item (chance to be weapon)
   */
  private generateItem(
    buildingID: BuildingID,
    roomID: RoomID,
    rng: SeededRandom
  ): Item | null {
    const isWeapon = rng.next() > 0.8;
    const iconIndex = rng.nextInt(1, isWeapon ? 20 : 100);

    const item: Item = {
      id: ID.create<ItemID>('item'),
      name: isWeapon ? `Weapon #${iconIndex}` : `Item #${iconIndex}`,
      description: 'Evidence of the world before.',
      iconIndex,

      isWeapon: false,
      value: rng.nextInt(1, 50),
      weight: rng.nextFloat(0.5, 5),

      position: { x: rng.nextFloat(0, 256), y: rng.nextFloat(0, 256) },
      buildingID,
      roomID,
    };

    return item;
  }

  /**
   * Generate room hazard (husk nest, anomaly, etc)
   */
  private generateRoomHazard(_roomID: RoomID, rng: SeededRandom): Hazard {
    const hazardType = rng.pick([
      HazardType.HUSK_NEST,
      HazardType.FOG_POCKET,
      HazardType.STRUCTURAL_DECAY,
    ]);

    const hazard: Hazard = {
      id: ID.create<HazardID>('hazard'),
      type: hazardType,
      position: { x: rng.nextFloat(50, 200), y: rng.nextFloat(50, 200) },
      radius: rng.nextFloat(30, 100),
      intensity: rng.nextFloat(0.3, 1),

      spawnTime: rng.nextFloat(0, 24),
      maxIntensity: rng.nextFloat(0.5, 1),
      rampSpeed: rng.nextFloat(0.1, 0.5),

      zoneID: 'zone-0-0' as ZoneID, // Updated during zone generation
      buildingID: null,
    };

    return hazard;
  }

  /**
   * Generate building-level hazards
   */
  private generateBuildingHazards(
    buildingID: BuildingID,
    rng: SeededRandom
  ): Hazard[] {
    const hazards: Hazard[] = [];
    const hazardCount = rng.nextInt(0, 2);

    for (let i = 0; i < hazardCount; i++) {
      const hazard: Hazard = {
        id: ID.create<HazardID>('hazard'),
        type: HazardType.STRUCTURAL_DECAY,
        position: {
          x: rng.nextFloat(50, 450),
          y: rng.nextFloat(50, 450),
        },
        radius: rng.nextFloat(50, 150),
        intensity: rng.nextFloat(0.2, 0.7),

        spawnTime: 0,
        maxIntensity: 1,
        rampSpeed: 0.1,

        zoneID: 'zone-0-0' as ZoneID,
        buildingID,
      };
      hazards.push(hazard);
    }

    return hazards;
  }

  /**
   * Generate environmental hazards (zone-wide anomalies)
   */
  private generateEnvironmentalHazards(
    zoneID: ZoneID,
    zonePos: Vector2,
    rng: SeededRandom
  ): Hazard[] {
    const hazards: Hazard[] = [];

    // Fog pockets
    if (rng.next() > 0.5) {
      const fogCount = rng.nextInt(1, 3);
      for (let i = 0; i < fogCount; i++) {
        hazards.push({
          id: ID.create<HazardID>('hazard'),
          type: HazardType.FOG_POCKET,
          position: {
            x: zonePos.x + rng.nextFloat(200, 1800),
            y: zonePos.y + rng.nextFloat(200, 1800),
          },
          radius: rng.nextFloat(200, 400),
          intensity: rng.nextFloat(0.4, 1),

          spawnTime: rng.nextFloat(0, 12),
          maxIntensity: 1,
          rampSpeed: 0.05,

          zoneID,
          buildingID: null,
        });
      }
    }

    // Anomalies
    if (rng.next() > 0.7) {
      hazards.push({
        id: ID.create<HazardID>('hazard'),
        type: HazardType.ANOMALY,
        position: {
          x: zonePos.x + rng.nextFloat(600, 1400),
          y: zonePos.y + rng.nextFloat(600, 1400),
        },
        radius: rng.nextFloat(100, 300),
        intensity: rng.nextFloat(0.5, 1),

        spawnTime: 0,
        maxIntensity: 1,
        rampSpeed: 0.2,

        zoneID,
        buildingID: null,
      });
    }

    return hazards;
  }

  /**
   * Generate interactables in room (doors, investigation points, etc)
   */
  private generateInteractables(
    _roomID: RoomID,
    roomType: RoomType,
    rng: SeededRandom
  ): Interactable[] {
    const interactables: Interactable[] = [];

    // Always a door
    interactables.push({
      id: ID.create<InteractableID>('interactable'),
      type: InteractableType.DOOR,
      position: { x: rng.nextFloat(0, 256), y: rng.nextFloat(0, 256) },

      investigated: false,
    });

    // Investigation points in certain rooms
    if ([RoomType.ARCHIVE, RoomType.OFFICE, RoomType.SERVER_ROOM].includes(roomType)) {
      if (rng.next() > 0.5) {
        interactables.push({
          id: ID.create<InteractableID>('interactable'),
          type: InteractableType.INVESTIGATION_POINT,
          position: {
            x: rng.nextFloat(50, 200),
            y: rng.nextFloat(50, 200),
          },

          investigated: false,
        });
      }
    }

    return interactables;
  }

  /**
   * Generate collision grid for building
   */
  private generateCollisionGrid(_roomCount: number, rng: SeededRandom): boolean[][] {
    const size = 8; // 8×8 grid
    const grid: boolean[][] = Array(size)
      .fill(null)
      .map(() => Array(size).fill(false));

    // Randomly block some cells
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (rng.next() > 0.7) {
          grid[i][j] = true; // Blocked
        }
      }
    }

    return grid;
  }

  /**
   * Select zone type based on difficulty/seed
   */
  private selectZoneType(rng: SeededRandom): ZoneType {
    const types = Object.values(ZoneType);
    return rng.pick(types);
  }

  /**
   * Select building type
   */
  private selectBuildingType(rng: SeededRandom): BuildingType {
    const types = Object.values(BuildingType);
    return rng.pick(types);
  }

  /**
   * Generate zone name
   */
  private generateZoneName(type: ZoneType, rng: SeededRandom): string {
    const adjectives = [
      'Decayed',
      'Forgotten',
      'Silent',
      'Lost',
      'Haunted',
      'Ravaged',
      'Empty',
    ];
    const nouns = [
      'District',
      'Quarter',
      'Zone',
      'Sector',
      'Area',
      'Expanse',
      'Wastes',
    ];

    const adj = rng.pick(adjectives);
    const noun = rng.pick(nouns);

    return `${adj} ${type} ${noun}`;
  }

  /**
   * Generate building name
   */
  private generateBuildingName(type: BuildingType, rng: SeededRandom): string {
    const prefixes = [
      'Old',
      'Rusted',
      'Abandoned',
      'Former',
      'Derelict',
    ];
    const prefix = rng.pick(prefixes);

    return `${prefix} ${type}`;
  }

  /**
   * Calculate decay level based on zone type and difficulty
   */
  private calculateDecayLevel(zoneType: ZoneType, difficulty: number): number {
    const base = difficulty / 10;
    const typeModifier = zoneType === ZoneType.RUINS ? 1.0 : 0.7;
    return Math.min(base * typeModifier, 1);
  }

  /**
   * Get zone by ID
   */
  public getZone(id: ZoneID): Zone | undefined {
    return this.zones.get(id);
  }

  /**
   * Get building by ID
   */
  public getBuilding(id: BuildingID): Building | undefined {
    return this.buildings.get(id);
  }

  /**
   * Get room by ID
   */
  public getRoom(id: RoomID): Room | undefined {
    return this.rooms.get(id);
  }

  /**
   * Get all zones
   */
  public getAllZones(): Zone[] {
    return Array.from(this.zones.values());
  }
}
WORLDGENEOF

cat > src/index.ts << 'INDEXEOF'
/**
 * DRIFTER ENGINE
 * Main export point
 * 
 * Usage:
 * import { WorldGenerator, type WorldGenOptions } from './index.js';
 * 
 * const gen = new WorldGenerator({
 *   seed: 12345,
 *   zoneCount: 12,
 *   difficulty: 5,
 *   era: 'Peak Decay',
 * });
 * 
 * const { zones, hqPosition } = gen.generate();
 */

// ── Types ──
export * from './types.js';

// ── Utilities ──
export { SeededRandom, Vec2, Grid, ID, valueNoise2D, Collision } from './utils.js';

// ── Core Classes ──
export { WorldGenerator } from './worldgen.js';
INDEXEOF

echo "✓ package.json, tsconfig.json, .gitignore written"
echo "✓ src/types.ts, utils.ts, worldgen.ts, index.ts written"
echo ""
echo "Next: npm install && npm run build"
