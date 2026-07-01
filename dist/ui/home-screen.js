import { WrongnessState } from '../types.js';
import { WorldGenerator } from '../worldgen.js';
import { GameplayEngine } from '../gameplay/index.js';
// ─── Constants ───────────────────────────────────────────────────────────────
const MENU_BACKGROUND_FOLDERS = [
    'background 1',
    'background 2',
    'background 3',
    'background 4',
];
// Fixed path — was '/assets/ui/menu' (wrong), now '/assets/ui/menubackground' (correct)
const MENU_BACKGROUND_PATH_ROOT = '/assets/ui/menubackground';
// Wrongness state → visual palette for UI panels
const WRONGNESS_PALETTE = {
    [WrongnessState.SUNNY]: {
        panelBg: 'rgba(12, 18, 28, 0.72)',
        borderColor: 'rgba(180, 210, 255, 0.18)',
        accentColor: '#8bbfff',
        textPrimary: '#ddeeff',
        textSecondary: '#8aaccc',
        noiseOpacity: 0.03,
        scanlineOpacity: 0.0,
        glitch: false,
        label: 'SUNNY',
        skyFilter: 'brightness(0.85) saturate(1.1)',
    },
    [WrongnessState.BLUE]: {
        panelBg: 'rgba(8, 16, 32, 0.76)',
        borderColor: 'rgba(100, 160, 255, 0.22)',
        accentColor: '#6aadff',
        textPrimary: '#cce0ff',
        textSecondary: '#6a96c0',
        noiseOpacity: 0.04,
        scanlineOpacity: 0.03,
        glitch: false,
        label: 'BLUE',
        skyFilter: 'brightness(0.8) hue-rotate(-10deg) saturate(1.15)',
    },
    [WrongnessState.GREY]: {
        panelBg: 'rgba(10, 14, 20, 0.8)',
        borderColor: 'rgba(140, 160, 180, 0.2)',
        accentColor: '#aac4d8',
        textPrimary: '#c8d8e8',
        textSecondary: '#7a90a0',
        noiseOpacity: 0.06,
        scanlineOpacity: 0.06,
        glitch: false,
        label: 'GREY',
        skyFilter: 'brightness(0.72) saturate(0.6) contrast(1.05)',
    },
    [WrongnessState.RAINY]: {
        panelBg: 'rgba(6, 12, 22, 0.84)',
        borderColor: 'rgba(80, 130, 190, 0.25)',
        accentColor: '#5a9fcc',
        textPrimary: '#b0cce0',
        textSecondary: '#5a7a96',
        noiseOpacity: 0.08,
        scanlineOpacity: 0.1,
        glitch: false,
        label: 'RAINY',
        skyFilter: 'brightness(0.62) saturate(0.45) hue-rotate(-15deg)',
    },
    [WrongnessState.STATIC]: {
        panelBg: 'rgba(8, 10, 18, 0.86)',
        borderColor: 'rgba(160, 160, 200, 0.3)',
        accentColor: '#c0c8e0',
        textPrimary: '#c0c8e0',
        textSecondary: '#6a7090',
        noiseOpacity: 0.14,
        scanlineOpacity: 0.16,
        glitch: true,
        label: 'STATIC',
        skyFilter: 'brightness(0.58) saturate(0.2) contrast(1.1)',
    },
    [WrongnessState.UNKNOWN]: {
        panelBg: 'rgba(10, 8, 20, 0.88)',
        borderColor: 'rgba(180, 140, 255, 0.25)',
        accentColor: '#b08de0',
        textPrimary: '#c8b8f0',
        textSecondary: '#7060a0',
        noiseOpacity: 0.18,
        scanlineOpacity: 0.2,
        glitch: true,
        label: 'UNKNOWN',
        skyFilter: 'brightness(0.52) saturate(0.3) hue-rotate(30deg)',
    },
    [WrongnessState.STORMY]: {
        panelBg: 'rgba(6, 6, 14, 0.92)',
        borderColor: 'rgba(200, 160, 80, 0.3)',
        accentColor: '#d0a040',
        textPrimary: '#e0c880',
        textSecondary: '#806030',
        noiseOpacity: 0.22,
        scanlineOpacity: 0.28,
        glitch: true,
        label: 'STORMY',
        skyFilter: 'brightness(0.45) saturate(0.2) sepia(0.3) contrast(1.15)',
    },
    [WrongnessState.DIFFERENT]: {
        panelBg: 'rgba(8, 4, 18, 0.92)',
        borderColor: 'rgba(255, 80, 80, 0.3)',
        accentColor: '#ff6060',
        textPrimary: '#ffc0c0',
        textSecondary: '#804040',
        noiseOpacity: 0.28,
        scanlineOpacity: 0.35,
        glitch: true,
        label: 'A DIFFERENT SKY',
        skyFilter: 'brightness(0.38) saturate(0.15) hue-rotate(160deg) contrast(1.2)',
    },
    [WrongnessState.ANOTHER_SKY]: {
        panelBg: 'rgba(4, 0, 12, 0.96)',
        borderColor: 'rgba(255, 40, 40, 0.4)',
        accentColor: '#ff3030',
        textPrimary: '#ffaaaa',
        textSecondary: '#602020',
        noiseOpacity: 0.35,
        scanlineOpacity: 0.45,
        glitch: true,
        label: 'ANOTHER SKY',
        skyFilter: 'brightness(0.3) saturate(0.1) hue-rotate(180deg) contrast(1.3)',
    },
};
// ─── Helpers ──────────────────────────────────────────────────────────────────
function el(tag, styles) {
    const e = document.createElement(tag);
    if (styles)
        Object.assign(e.style, styles);
    return e;
}
function injectGlobalStyles() {
    if (document.getElementById('drifter-global-styles'))
        return;
    const style = document.createElement('style');
    style.id = 'drifter-global-styles';
    style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; }

    body {
      margin: 0;
      min-height: 100vh;
      background: #060a12;
      color: #ddeeff;
      font-family: 'Rajdhani', system-ui, sans-serif;
      overflow: hidden;
    }

    #app {
      position: relative;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
    }

    /* Scanline overlay — full screen */
    #drifter-scanlines {
      position: fixed;
      inset: 0;
      z-index: 50;
      pointer-events: none;
      background: repeating-linear-gradient(
        to bottom,
        transparent 0px,
        transparent 3px,
        rgba(0,0,0,0.08) 3px,
        rgba(0,0,0,0.08) 4px
      );
      mix-blend-mode: multiply;
      transition: opacity 1.2s ease;
    }

    /* Noise overlay */
    #drifter-noise {
      position: fixed;
      inset: 0;
      z-index: 49;
      pointer-events: none;
      opacity: 0;
      transition: opacity 1.2s ease;
    }

    /* Glitch keyframes */
    @keyframes glitch-h {
      0%, 95%, 100% { clip-path: none; transform: none; }
      96% { clip-path: inset(10% 0 80% 0); transform: translateX(-4px); }
      97% { clip-path: inset(60% 0 20% 0); transform: translateX(4px); }
      98% { clip-path: none; transform: translateX(-2px); }
    }

    @keyframes glitch-border {
      0%, 92%, 100% { border-color: var(--border-color); box-shadow: none; }
      93% { border-color: rgba(255,60,60,0.5); box-shadow: 0 0 8px rgba(255,60,60,0.3); }
      94% { border-color: rgba(60,180,255,0.5); box-shadow: 0 0 8px rgba(60,180,255,0.3); }
      95% { border-color: var(--border-color); box-shadow: none; }
    }

    @keyframes signal-pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }

    @keyframes status-dot-blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.2; }
    }

    @keyframes text-flicker {
      0%, 97%, 100% { opacity: 1; }
      98% { opacity: 0.3; }
      99% { opacity: 0.8; }
    }

    .drifter-panel {
      background: var(--panel-bg);
      border: 1px solid var(--border-color);
      backdrop-filter: blur(6px) saturate(1.2);
      -webkit-backdrop-filter: blur(6px) saturate(1.2);
      position: relative;
      overflow: hidden;
      transition: background 1.2s ease, border-color 1.2s ease;
    }

    .drifter-panel::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 50%);
      pointer-events: none;
    }

    .drifter-panel.glitching {
      animation: glitch-border 6s infinite;
    }

    .drifter-btn {
      display: block;
      width: 100%;
      padding: 14px 20px;
      background: transparent;
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      font-family: 'Rajdhani', system-ui, sans-serif;
      font-size: 1rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      text-align: left;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease;
    }

    .drifter-btn::after {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: var(--accent-color);
      transform: scaleY(0);
      transform-origin: bottom;
      transition: transform 0.18s ease;
    }

    .drifter-btn:hover {
      background: rgba(255,255,255,0.06);
      border-color: var(--accent-color);
    }

    .drifter-btn:hover::after {
      transform: scaleY(1);
    }

    .drifter-btn:active {
      background: rgba(255,255,255,0.1);
    }

    .drifter-btn.secondary {
      opacity: 0.6;
      font-size: 0.85rem;
    }

    .drifter-btn.secondary:hover {
      opacity: 1;
    }

    .drifter-label {
      font-family: 'Share Tech Mono', monospace;
      font-size: 0.7rem;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--text-secondary);
    }

    .drifter-value {
      font-family: 'Share Tech Mono', monospace;
      font-size: 0.75rem;
      color: var(--text-primary);
    }

    .status-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 5px 0;
      border-bottom: 1px solid rgba(255,255,255,0.04);
    }

    .status-row:last-child {
      border-bottom: none;
    }

    .wrongness-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 3px 8px;
      border: 1px solid var(--accent-color);
      color: var(--accent-color);
      font-family: 'Share Tech Mono', monospace;
      font-size: 0.65rem;
      letter-spacing: 0.12em;
    }

    .wrongness-badge .dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: var(--accent-color);
      animation: signal-pulse 2s ease-in-out infinite;
    }

    .bottom-bar {
      font-family: 'Share Tech Mono', monospace;
      font-size: 0.65rem;
      color: var(--text-secondary);
      letter-spacing: 0.06em;
      animation: text-flicker 8s infinite;
    }

    input[type="range"] {
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      height: 2px;
      background: rgba(255,255,255,0.12);
      outline: none;
      margin: 8px 0;
    }

    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 14px;
      height: 14px;
      background: var(--accent-color);
      cursor: pointer;
    }

    input[type="range"]::-moz-range-thumb {
      width: 14px;
      height: 14px;
      background: var(--accent-color);
      border: none;
      cursor: pointer;
    }
  `;
    document.head.appendChild(style);
}
// ─── Noise canvas ─────────────────────────────────────────────────────────────
function createNoiseCanvas(opacity) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.opacity = String(opacity);
    canvas.style.imageRendering = 'pixelated';
    canvas.style.pointerEvents = 'none';
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(256, 256);
    for (let i = 0; i < imageData.data.length; i += 4) {
        const v = Math.random() * 255;
        imageData.data[i] = v;
        imageData.data[i + 1] = v;
        imageData.data[i + 2] = v;
        imageData.data[i + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
    return canvas;
}
// ─── HomeScreen class ─────────────────────────────────────────────────────────
class HomeScreen {
    constructor(rootId = 'app') {
        this.mode = 'menu';
        this.settings = { difficulty: 3, volume: 0.65, showHints: true };
        this.engine = null;
        this.currentZone = null;
        this.statusMessage = 'Relay node connection established. Standing by.';
        // Wrongness for menu is always GREY (6 months post-collapse, first zone is Finland)
        // Can be overridden if a zone is active
        this.wrongnessState = WrongnessState.GREY;
        const root = document.getElementById(rootId);
        if (!root)
            throw new Error(`HomeScreen: no element with id '${rootId}'`);
        this.root = root;
        this.backgroundFolder = this.pickBackground();
        injectGlobalStyles();
        this.applyThemeVars();
        this.render();
    }
    run() {
        this.render();
    }
    // ── CSS custom properties on :root so all sub-elements inherit ──────────────
    applyThemeVars() {
        const p = WRONGNESS_PALETTE[this.wrongnessState];
        const r = document.documentElement;
        r.style.setProperty('--panel-bg', p.panelBg);
        r.style.setProperty('--border-color', p.borderColor);
        r.style.setProperty('--accent-color', p.accentColor);
        r.style.setProperty('--text-primary', p.textPrimary);
        r.style.setProperty('--text-secondary', p.textSecondary);
        // scanlines
        const scanlines = document.getElementById('drifter-scanlines');
        if (scanlines)
            scanlines.style.opacity = String(p.scanlineOpacity);
    }
    // ── Full render ──────────────────────────────────────────────────────────────
    render() {
        this.applyThemeVars();
        this.root.innerHTML = '';
        const p = WRONGNESS_PALETTE[this.wrongnessState];
        // ── Scanlines (screen-space, fixed, behind everything else) ─────────────
        const scanlines = el('div');
        scanlines.id = 'drifter-scanlines';
        scanlines.style.opacity = String(p.scanlineOpacity);
        this.root.appendChild(scanlines);
        // ── Noise (fixed behind scanlines) ──────────────────────────────────────
        const noiseWrap = el('div');
        noiseWrap.id = 'drifter-noise';
        noiseWrap.style.opacity = String(p.noiseOpacity);
        if (p.noiseOpacity > 0) {
            noiseWrap.appendChild(createNoiseCanvas(1));
            // Animate noise refresh
            setInterval(() => {
                noiseWrap.innerHTML = '';
                noiseWrap.appendChild(createNoiseCanvas(1));
            }, 120);
        }
        this.root.appendChild(noiseWrap);
        // ── Background ───────────────────────────────────────────────────────────
        this.root.appendChild(this.renderBackground(p.skyFilter));
        // ── Full-bleed split layout ──────────────────────────────────────────────
        // Left ~55% = world/title space (bleeds into background)
        // Right ~45% = UI panels (anchored right edge)
        const layout = el('div', {
            position: 'absolute',
            inset: '0',
            display: 'flex',
            alignItems: 'stretch',
            zIndex: '10',
            pointerEvents: 'none',
        });
        // Left pane — title + flavor text, mostly transparent
        const leftPane = el('div', {
            flex: '1',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '0 0 40px 48px',
            pointerEvents: 'none',
        });
        leftPane.appendChild(this.renderTitle());
        layout.appendChild(leftPane);
        // Right pane — UI panels
        const rightPane = el('div', {
            width: 'clamp(320px, 38vw, 480px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '12px',
            padding: '32px 40px 32px 20px',
            pointerEvents: 'auto',
        });
        // Wrongness indicator (top of right pane)
        rightPane.appendChild(this.renderWrongnessIndicator());
        // Mode-specific content
        switch (this.mode) {
            case 'menu':
                rightPane.appendChild(this.renderStationStatus());
                rightPane.appendChild(this.renderMenuNav());
                break;
            case 'story':
                rightPane.appendChild(this.renderStoryPanel());
                break;
            case 'exploration':
                rightPane.appendChild(this.renderExplorationPanel());
                break;
            case 'settings':
                rightPane.appendChild(this.renderSettingsPanel());
                break;
            case 'play':
                rightPane.appendChild(this.renderRunPanel());
                break;
        }
        // Bottom status bar
        rightPane.appendChild(this.renderStatusBar());
        layout.appendChild(rightPane);
        this.root.appendChild(layout);
    }
    // ── Background: full-bleed, layered, parallax-ish ───────────────────────────
    renderBackground(skyFilter) {
        const bg = el('div', {
            position: 'absolute',
            inset: '0',
            zIndex: '0',
            overflow: 'hidden',
            pointerEvents: 'none',
        });
        // Base (orig.png) — darkened to let the UI breathe
        const base = el('div', {
            position: 'absolute',
            inset: '0',
            backgroundImage: `url(${this.bgPath('orig.png')})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center bottom',
            filter: `${skyFilter} brightness(0.68)`,
        });
        bg.appendChild(base);
        // Parallax layers (screen composited)
        const blendModes = ['screen', 'screen', 'overlay', 'multiply'];
        const layerOpacities = [0.12, 0.1, 0.08, 0.06];
        const folder = this.backgroundFolder;
        const layerCount = folder === 'background 1' ? 3 : 4;
        for (let i = 0; i < layerCount; i++) {
            const img = el('img', {
                position: 'absolute',
                inset: '0',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: String(layerOpacities[i] ?? 0.06),
                mixBlendMode: blendModes[i] ?? 'screen',
                pointerEvents: 'none',
            });
            img.src = this.bgPath(`${i + 1}.png`);
            bg.appendChild(img);
        }
        // Right-side vignette — darkens the panel area so UI reads clearly
        const vignetteRight = el('div', {
            position: 'absolute',
            inset: '0',
            background: 'linear-gradient(to left, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.55) 30%, rgba(0,0,0,0.0) 65%)',
            pointerEvents: 'none',
        });
        bg.appendChild(vignetteRight);
        // Bottom vignette — grounds the title
        const vignetteBottom = el('div', {
            position: 'absolute',
            inset: '0',
            background: 'linear-gradient(to top, rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.0) 50%)',
            pointerEvents: 'none',
        });
        bg.appendChild(vignetteBottom);
        return bg;
    }
    // ── Title (left pane, bottom-anchored) ──────────────────────────────────────
    renderTitle() {
        const wrap = el('div');
        const eyebrow = el('div', {
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '0.65rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--text-secondary)',
            marginBottom: '10px',
        });
        eyebrow.textContent = 'WNCORE · RELAY STATION 7 · DHAKA';
        wrap.appendChild(eyebrow);
        const title = el('h1', {
            margin: '0 0 8px',
            fontFamily: "'Rajdhani', system-ui, sans-serif",
            fontSize: 'clamp(2.8rem, 5.5vw, 4.2rem)',
            fontWeight: '700',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            lineHeight: '0.95',
            color: 'var(--text-primary)',
            textShadow: '0 2px 40px rgba(0,0,0,0.9)',
        });
        title.innerHTML = 'ANOTHER<br>SKY: DRIFTER';
        wrap.appendChild(title);
        const tagline = el('p', {
            margin: '12px 0 0',
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '0.72rem',
            letterSpacing: '0.06em',
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
            maxWidth: '380px',
        });
        tagline.textContent = 'The world is the interface. The relay is a living node. Step into the breach.';
        wrap.appendChild(tagline);
        return wrap;
    }
    // ── Wrongness indicator (top-right, small) ───────────────────────────────────
    renderWrongnessIndicator() {
        const p = WRONGNESS_PALETTE[this.wrongnessState];
        const wrap = el('div', {
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '4px',
        });
        const badge = el('div');
        badge.className = 'wrongness-badge';
        badge.innerHTML = `<span class="dot"></span>${p.label}`;
        wrap.appendChild(badge);
        return wrap;
    }
    // ── Station Status panel ─────────────────────────────────────────────────────
    renderStationStatus() {
        const panel = el('div');
        panel.className = 'drifter-panel';
        Object.assign(panel.style, { padding: '16px 20px' });
        if (WRONGNESS_PALETTE[this.wrongnessState].glitch)
            panel.classList.add('glitching');
        const header = el('div', {
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '0.65rem',
            letterSpacing: '0.2em',
            color: 'var(--text-secondary)',
            marginBottom: '12px',
            textTransform: 'uppercase',
        });
        header.textContent = '// STATION STATUS';
        panel.appendChild(header);
        const rows = [
            ['Sky State', WRONGNESS_PALETTE[this.wrongnessState].label],
            ['Power', '72% Nominal'],
            ['Relay', 'Unstable'],
            ['Volume', `${Math.round(this.settings.volume * 100)}%`],
            ['Difficulty', `Level ${this.settings.difficulty}`],
            ['Hints', this.settings.showHints ? 'Enabled' : 'Disabled'],
        ];
        for (const [label, value] of rows) {
            const row = el('div');
            row.className = 'status-row';
            const l = el('span');
            l.className = 'drifter-label';
            l.textContent = label;
            const v = el('span');
            v.className = 'drifter-value';
            v.textContent = value;
            row.appendChild(l);
            row.appendChild(v);
            panel.appendChild(row);
        }
        return panel;
    }
    // ── Main nav panel ───────────────────────────────────────────────────────────
    renderMenuNav() {
        const panel = el('div');
        panel.className = 'drifter-panel';
        Object.assign(panel.style, { padding: '20px' });
        if (WRONGNESS_PALETTE[this.wrongnessState].glitch)
            panel.classList.add('glitching');
        const header = el('div', {
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '0.65rem',
            letterSpacing: '0.2em',
            color: 'var(--text-secondary)',
            marginBottom: '14px',
            textTransform: 'uppercase',
        });
        header.textContent = '// SELECT ACCESS NODE';
        panel.appendChild(header);
        const navItems = [
            ['[01]', 'Experience the crack in reality', () => this.setMode('story')],
            ['[02]', 'Exploration run', () => this.setMode('exploration')],
            ['[03]', 'Settings', () => this.setMode('settings')],
        ];
        const btnWrap = el('div', { display: 'flex', flexDirection: 'column', gap: '4px' });
        for (const [idx, label, onClick] of navItems) {
            const btn = el('button');
            btn.className = 'drifter-btn';
            btn.innerHTML = `<span style="color:var(--text-secondary);font-family:'Share Tech Mono',monospace;font-size:0.7rem;margin-right:10px;">${idx}</span>${label}`;
            btn.onclick = onClick;
            btnWrap.appendChild(btn);
        }
        panel.appendChild(btnWrap);
        return panel;
    }
    // ── Story panel ──────────────────────────────────────────────────────────────
    renderStoryPanel() {
        const panel = el('div');
        panel.className = 'drifter-panel';
        Object.assign(panel.style, { padding: '20px' });
        const header = el('div', {
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '0.65rem',
            letterSpacing: '0.2em',
            color: 'var(--text-secondary)',
            marginBottom: '14px',
        });
        header.textContent = '// STORY MODE — CHAPTER 1';
        panel.appendChild(header);
        const desc = el('p', {
            margin: '0 0 16px',
            fontSize: '0.9rem',
            lineHeight: '1.65',
            color: 'var(--text-secondary)',
        });
        desc.textContent = 'A signal crack opens the world. Reach the relay, log the world, survive the shadows. Structured narrative. Fixed drifter origin. One shot.';
        panel.appendChild(desc);
        const start = el('button');
        start.className = 'drifter-btn';
        start.textContent = 'Begin Chapter 1';
        start.onclick = () => this.startRun('story');
        panel.appendChild(start);
        const back = el('button');
        back.className = 'drifter-btn secondary';
        back.textContent = '← Back to relay';
        back.onclick = () => this.setMode('menu');
        Object.assign(back.style, { marginTop: '6px' });
        panel.appendChild(back);
        return panel;
    }
    // ── Exploration panel ────────────────────────────────────────────────────────
    renderExplorationPanel() {
        const panel = el('div');
        panel.className = 'drifter-panel';
        Object.assign(panel.style, { padding: '20px' });
        const header = el('div', {
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '0.65rem',
            letterSpacing: '0.2em',
            color: 'var(--text-secondary)',
            marginBottom: '14px',
        });
        header.textContent = '// ROGUELITE EXPLORATION';
        panel.appendChild(header);
        const desc = el('p', {
            margin: '0 0 16px',
            fontSize: '0.9rem',
            lineHeight: '1.65',
            color: 'var(--text-secondary)',
        });
        desc.textContent = 'Procedural world. Fresh drifter. Move quietly, observe, catalog, extract. No two runs the same. Permadeath.';
        panel.appendChild(desc);
        // Difficulty slider
        const diffWrap = el('div', { marginBottom: '16px' });
        const diffLabel = el('div', {
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '0.65rem',
            letterSpacing: '0.15em',
            color: 'var(--text-secondary)',
            marginBottom: '4px',
        });
        diffLabel.textContent = `DIFFICULTY — ${this.settings.difficulty}`;
        diffWrap.appendChild(diffLabel);
        const slider = el('input');
        slider.type = 'range';
        slider.min = '1';
        slider.max = '8';
        slider.value = String(this.settings.difficulty);
        slider.oninput = () => {
            this.settings.difficulty = Number(slider.value);
            diffLabel.textContent = `DIFFICULTY — ${this.settings.difficulty}`;
        };
        diffWrap.appendChild(slider);
        panel.appendChild(diffWrap);
        const start = el('button');
        start.className = 'drifter-btn';
        start.textContent = 'Enter the zone';
        start.onclick = () => this.startRun('exploration');
        panel.appendChild(start);
        const back = el('button');
        back.className = 'drifter-btn secondary';
        back.textContent = '← Back to relay';
        back.onclick = () => this.setMode('menu');
        Object.assign(back.style, { marginTop: '6px' });
        panel.appendChild(back);
        return panel;
    }
    // ── Settings panel ───────────────────────────────────────────────────────────
    renderSettingsPanel() {
        const panel = el('div');
        panel.className = 'drifter-panel';
        Object.assign(panel.style, { padding: '20px' });
        const header = el('div', {
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '0.65rem',
            letterSpacing: '0.2em',
            color: 'var(--text-secondary)',
            marginBottom: '14px',
        });
        header.textContent = '// RELAY SETTINGS';
        panel.appendChild(header);
        // Volume
        panel.appendChild(this.makeSliderRow('VOLUME', 0, 100, Math.round(this.settings.volume * 100), (v) => {
            this.settings.volume = v / 100;
        }));
        // Difficulty
        panel.appendChild(this.makeSliderRow('DIFFICULTY', 1, 8, this.settings.difficulty, (v) => {
            this.settings.difficulty = v;
        }));
        // Hints toggle
        const hintRow = el('div', { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' });
        const hintLabel = el('span');
        hintLabel.className = 'drifter-label';
        hintLabel.textContent = 'HINTS';
        const hintToggle = el('button');
        hintToggle.className = 'drifter-btn';
        Object.assign(hintToggle.style, { width: 'auto', padding: '6px 14px', fontSize: '0.72rem' });
        hintToggle.textContent = this.settings.showHints ? 'ENABLED' : 'DISABLED';
        hintToggle.onclick = () => {
            this.settings.showHints = !this.settings.showHints;
            hintToggle.textContent = this.settings.showHints ? 'ENABLED' : 'DISABLED';
        };
        hintRow.appendChild(hintLabel);
        hintRow.appendChild(hintToggle);
        panel.appendChild(hintRow);
        // Wrongness cycle (dev/debug shortcut)
        const wrongnessRow = el('div', { marginBottom: '16px' });
        const wrongLabel = el('div');
        wrongLabel.className = 'drifter-label';
        wrongLabel.textContent = 'SKY STATE (PREVIEW)';
        Object.assign(wrongLabel.style, { marginBottom: '8px' });
        wrongnessRow.appendChild(wrongLabel);
        const states = Object.values(WrongnessState);
        const stateGrid = el('div', { display: 'flex', flexWrap: 'wrap', gap: '4px' });
        for (const state of states) {
            const stateBtn = el('button');
            stateBtn.className = 'drifter-btn';
            Object.assign(stateBtn.style, {
                width: 'auto',
                padding: '4px 8px',
                fontSize: '0.6rem',
                letterSpacing: '0.08em',
                opacity: this.wrongnessState === state ? '1' : '0.45',
                borderColor: this.wrongnessState === state ? 'var(--accent-color)' : 'var(--border-color)',
            });
            stateBtn.textContent = state.replace('_', ' ');
            stateBtn.onclick = () => {
                this.wrongnessState = state;
                this.render();
            };
            stateGrid.appendChild(stateBtn);
        }
        wrongnessRow.appendChild(stateGrid);
        panel.appendChild(wrongnessRow);
        const back = el('button');
        back.className = 'drifter-btn secondary';
        back.textContent = '← Back to relay';
        back.onclick = () => this.setMode('menu');
        panel.appendChild(back);
        return panel;
    }
    // ── Run/play panel ───────────────────────────────────────────────────────────
    renderRunPanel() {
        const panel = el('div');
        panel.className = 'drifter-panel';
        Object.assign(panel.style, { padding: '20px' });
        const header = el('div', {
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '0.65rem',
            letterSpacing: '0.2em',
            color: 'var(--text-secondary)',
            marginBottom: '14px',
        });
        header.textContent = '// ACTIVE RUN';
        panel.appendChild(header);
        if (!this.engine || !this.currentZone) {
            const err = el('p', { color: '#ff7070', fontSize: '0.85rem', margin: '0 0 16px' });
            err.textContent = 'No active run. Return to menu.';
            panel.appendChild(err);
            const back = el('button');
            back.className = 'drifter-btn';
            back.textContent = 'Return to relay';
            back.onclick = () => this.setMode('menu');
            panel.appendChild(back);
            return panel;
        }
        const rows = [
            ['Drifter', `${this.engine.drifter.name} · ${this.engine.drifter.origin}`],
            ['Zone', `${this.currentZone.name}`],
            ['Type', this.currentZone.type],
            ['Signal', `${Math.round(this.engine.drifter.signalStrength)}%`],
            ['Air Quality', `${Math.round(this.engine.drifter.airQuality)}%`],
            ['Difficulty', `Level ${this.settings.difficulty}`],
        ];
        for (const [label, value] of rows) {
            const row = el('div');
            row.className = 'status-row';
            const l = el('span');
            l.className = 'drifter-label';
            l.textContent = label;
            const v = el('span');
            v.className = 'drifter-value';
            v.textContent = value;
            row.appendChild(l);
            row.appendChild(v);
            panel.appendChild(row);
        }
        Object.assign(panel.style, { marginBottom: '8px' });
        const actionGrid = el('div', { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '14px' });
        const advanceBtn = el('button');
        advanceBtn.className = 'drifter-btn';
        advanceBtn.textContent = 'Advance time';
        advanceBtn.onclick = () => {
            this.engine?.update(1, { x: 0, y: 0 }, []);
            this.statusMessage = 'Time advanced one unit.';
            this.render();
        };
        actionGrid.appendChild(advanceBtn);
        const sampleBtn = el('button');
        sampleBtn.className = 'drifter-btn';
        sampleBtn.textContent = 'Collect sample';
        sampleBtn.onclick = () => {
            const item = {
                id: `sample-${Date.now()}`,
                name: 'Relay Sample',
                description: 'A minor world artifact.',
                iconIndex: 1,
                isWeapon: false,
                value: 8,
                weight: 1,
                position: { x: this.engine?.drifter.position.x ?? 0, y: this.engine?.drifter.position.y ?? 0 },
                buildingID: this.currentZone?.buildings?.[0]?.id ?? 'unknown',
                roomID: null,
            };
            this.statusMessage = this.engine?.pickUpItem(item) ? 'Sample logged to logbook.' : 'Inventory full.';
            this.render();
        };
        actionGrid.appendChild(sampleBtn);
        panel.appendChild(actionGrid);
        const back = el('button');
        back.className = 'drifter-btn secondary';
        back.textContent = '← Abort run';
        back.onclick = () => this.setMode('menu');
        Object.assign(back.style, { marginTop: '8px' });
        panel.appendChild(back);
        return panel;
    }
    // ── Status bar (bottom of right pane) ───────────────────────────────────────
    renderStatusBar() {
        const bar = el('div');
        bar.className = 'bottom-bar';
        bar.textContent = `> ${this.statusMessage}`;
        return bar;
    }
    // ── Shared helpers ───────────────────────────────────────────────────────────
    makeSliderRow(label, min, max, value, onChange) {
        const wrap = el('div', { marginBottom: '14px' });
        const lbl = el('div');
        lbl.className = 'drifter-label';
        Object.assign(lbl.style, { marginBottom: '4px' });
        lbl.textContent = `${label} — ${value}`;
        wrap.appendChild(lbl);
        const input = el('input');
        input.type = 'range';
        input.min = String(min);
        input.max = String(max);
        input.value = String(value);
        input.oninput = () => {
            const v = Number(input.value);
            lbl.textContent = `${label} — ${v}`;
            onChange(v);
        };
        wrap.appendChild(input);
        return wrap;
    }
    setMode(mode) {
        this.mode = mode;
        if (mode === 'menu') {
            this.backgroundFolder = this.pickBackground();
            this.statusMessage = 'Relay node connection established. Standing by.';
        }
        this.render();
    }
    bgPath(file) {
        return `${MENU_BACKGROUND_PATH_ROOT}/${encodeURIComponent(this.backgroundFolder)}/${file}`;
    }
    pickBackground() {
        return MENU_BACKGROUND_FOLDERS[Math.floor(Math.random() * MENU_BACKGROUND_FOLDERS.length)];
    }
    getSeed() {
        return Math.max(1000, Math.floor(Math.random() * 1000000));
    }
    generateZone() {
        const gen = new WorldGenerator({ seed: this.getSeed(), zoneCount: 1, difficulty: this.settings.difficulty, era: 'Early Collapse' });
        const { zones } = gen.generate();
        // Sync wrongness state from generated zone
        if (zones[0]?.wrongnessState) {
            this.wrongnessState = zones[0].wrongnessState;
        }
        return zones[0];
    }
    startRun(mode) {
        this.currentZone = this.generateZone();
        this.engine = new GameplayEngine({
            seed: this.getSeed(),
            zone: this.currentZone,
            startPosition: { x: 128, y: 128 },
            huskOptions: {
                seed: this.getSeed(),
                zone: this.currentZone,
                huskCount: mode === 'story' ? 3 : 5,
                weather: this.currentZone.weatherState,
            },
            worldInfoOptions: { storageKey: 'drifter_home_screen' },
        });
        this.mode = 'play';
        this.statusMessage = mode === 'story' ? 'Story run initiated. Keep the relay alive.' : 'Exploration run started. Move quietly.';
        this.render();
    }
}
window.addEventListener('DOMContentLoaded', () => {
    const app = new HomeScreen('app');
    app.run();
});
//# sourceMappingURL=home-screen.js.map