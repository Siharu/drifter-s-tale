# DRIFTER — Codespaces Setup

## OPTION 1: Automatic (recommended)

1. Create a new GitHub repo named `drifter`, push these files to it (including `.devcontainer/`).
2. Open it in GitHub Codespaces (`Code` → `Codespaces` → `Create codespace on main`).
3. Wait ~30 seconds — the devcontainer auto-runs `setup-folders.sh` + `setup-files.sh` + `npm install` on creation.
4. Folders + source files + dependencies are already there. Drag your SVGs/PNGs/audio into `assets/...` and start coding.

## OPTION 2: Manual (if you don't want the devcontainer auto-run, or already have a Codespace open)

```bash
bash setup-folders.sh   # creates all assets/ subfolders + .gitkeep placeholders
bash setup-files.sh     # writes package.json, tsconfig.json, .gitignore, src/*.ts
npm install
npm run build
```

## VERIFY IT WORKS

```bash
cat > test.mjs << 'EOF'
import { WorldGenerator } from './dist/index.js';
const gen = new WorldGenerator({ seed: 42, zoneCount: 6, difficulty: 5, era: 'Peak Decay' });
const { zones, hqPosition } = gen.generate();
console.log(`✓ ${zones.length} zones, HQ at (${hqPosition.x}, ${hqPosition.y})`);
EOF
node test.mjs
```

Expected: `✓ 6 zones, HQ at (256, 256)` (or similar — buildings/items counts will vary slightly by seed math but zone count is fixed).

## WHERE TO DROP YOUR ASSETS

Already-created folders, ready for drag-and-drop:

```
assets/characters/drifter/base/        ← 8-directional idle/walk PNGs
assets/characters/drifter/portraits/   ← reuse WNCORE handler/drifter portrait packs
assets/characters/husks/isometric/     ← isometric husk sprites (shambler/sprinter/bloated subfolders)
assets/tiles/ground|road|rubble/       ← reuse existing isometric tile PNGs
assets/props/                          ← relay_tower.svg, fence.svg, etc.
assets/items/                          ← reuse WNCORE item icon PNGs
assets/weapons/                        ← reuse WNCORE weapon icon PNGs
assets/ui/logbook|hud|fonts/           ← UI chrome
assets/audio/music/ambient|tension|extraction/
assets/audio/sfx/footsteps|ui|hazard|radio/
assets/fx/particles|noise/             ← dust motes, displacement noise textures
```

Every folder already has a `.gitkeep` so git tracks the empty structure — once you drop a real file in, you can delete the `.gitkeep` or just leave it, doesn't matter.

## NEXT STEPS

See `DRIFTER_ENGINE_PLAN.md` (the full plan doc) for:
- Build order (Phase 2 rendering, starting with `SkySystem`)
- First workable map plan (Relay Station 7, hand-authored data)
- What's already built (`WorldGenerator`, full type system, utils)

Immediate next action per the plan: hand-author `relay_station.json` (M1), no rendering code needed yet.
