import type { Zone } from '../types.js';
import { WorldGenerator } from '../worldgen.js';
import { GameplayEngine } from '../gameplay/index.js';

const MENU_BACKGROUND_FOLDERS = ['background 1', 'background 2', 'background 3', 'background 4'] as const;
const MENU_BACKGROUND_PATH_ROOT = '/assets/ui/menu';
type MenuBackgroundFolder = (typeof MENU_BACKGROUND_FOLDERS)[number];

interface GameSettings {
  difficulty: number;
  volume: number;
  theme: 'dark' | 'sepia' | 'cold';
  showHints: boolean;
}

type AppMode = 'menu' | 'story' | 'exploration' | 'settings' | 'play';

class HomeScreen {
  private root: HTMLElement;
  private mode: AppMode = 'menu';
  private settings: GameSettings = {
    difficulty: 3,
    volume: 0.65,
    theme: 'dark',
    showHints: true,
  };
  private engine: GameplayEngine | null = null;
  private currentZone: Zone | null = null;
  private backgroundFolder: MenuBackgroundFolder;
  private statusMessage = 'Ready to step into the breach.';

  constructor(rootId = 'app') {
    const root = document.getElementById(rootId);
    if (!root) {
      throw new Error(`HomeScreen: could not find root element with id '${rootId}'`);
    }
    this.root = root;
    this.root.style.position = 'relative';
    this.root.style.minHeight = '100vh';
    this.root.style.overflow = 'hidden';
    this.backgroundFolder = this.chooseBackgroundFolder();
    this.applyTheme();
    this.render();
  }

  public run(): void {
    this.render();
  }

  private applyTheme(): void {
    document.body.style.margin = '0';
    document.body.style.minHeight = '100vh';
    document.body.style.fontFamily = 'system-ui, sans-serif';
    document.body.style.color = this.settings.theme === 'cold' ? '#d6e3ff' : '#eee';
    document.body.style.background = this.settings.theme === 'sepia' ? '#2d1f16' : '#111';
    document.body.style.transition = 'background 0.2s ease, color 0.2s ease';
  }

  private render(): void {
    this.root.innerHTML = '';
    this.root.appendChild(this.renderBackground());
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.zIndex = '1';
    wrapper.style.maxWidth = '1100px';
    wrapper.style.margin = '0 auto';
    wrapper.style.padding = '24px';

    switch (this.mode) {
      case 'menu':
        wrapper.appendChild(this.renderMenu());
        break;
      case 'story':
        wrapper.appendChild(this.renderStoryScreen());
        break;
      case 'exploration':
        wrapper.appendChild(this.renderExplorationScreen());
        break;
      case 'settings':
        wrapper.appendChild(this.renderSettingsScreen());
        break;
      case 'play':
        wrapper.appendChild(this.renderRunPanel());
        break;
    }

    this.root.appendChild(wrapper);
  }

  private renderMenu(): HTMLElement {
    const container = document.createElement('div');
    container.style.display = 'grid';
    container.style.gap = '18px';

    const headline = document.createElement('div');
    headline.innerHTML = `
      <h1 style="font-size: clamp(2rem, 4vw, 3.4rem); margin:0;">Drifter: Another Sky</h1>
      <p style="max-width: 750px; line-height: 1.7; margin: 12px 0 0; color: #c9d6e0;">
        Choose your approach. Experience the crack in reality as the first story episode, or jump into rogue-like exploration and survive the relay zone.
      </p>
    `;
    container.appendChild(headline);

    const buttonGrid = document.createElement('div');
    buttonGrid.style.display = 'grid';
    buttonGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(240px, 1fr))';
    buttonGrid.style.gap = '18px';

    buttonGrid.appendChild(this.createMenuButton('Experience the crack in reality', () => this.setMode('story')));
    buttonGrid.appendChild(this.createMenuButton('Exploration', () => this.setMode('exploration')));
    buttonGrid.appendChild(this.createMenuButton('Settings', () => this.setMode('settings'), true));

    container.appendChild(buttonGrid);
    container.appendChild(this.createStatusBanner());
    return container;
  }

  private renderStoryScreen(): HTMLElement {
    const container = document.createElement('div');
    container.style.display = 'grid';
    container.style.gap = '16px';

    container.appendChild(this.createSectionTitle('Story Mode'));

    const storyText = document.createElement('p');
    storyText.textContent = 'A signal crack opens the world. Your task is to step into the first chapter, gather what you can, and keep the relay alive while the husks hunt the shadows.';
    storyText.style.lineHeight = '1.75';
    storyText.style.color = '#d5d5d5';
    container.appendChild(storyText);

    const storyList = document.createElement('ul');
    storyList.style.margin = '0';
    storyList.style.paddingLeft = '18px';
    storyList.innerHTML = `
      <li>Structured narrative introduction</li>
      <li>Guided objective: reach the relay, log the world, survive</li>
      <li>Player drifter starts with a defined origin and a mission</li>
    `;
    container.appendChild(storyList);

    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.flexWrap = 'wrap';
    actions.style.gap = '12px';

    actions.appendChild(this.createMenuButton('Begin story mode', () => this.startRun('story')));
    actions.appendChild(this.createMenuButton('Back to menu', () => this.setMode('menu'), true));
    container.appendChild(actions);

    container.appendChild(this.createStatusBanner());
    return container;
  }

  private renderExplorationScreen(): HTMLElement {
    const container = document.createElement('div');
    container.style.display = 'grid';
    container.style.gap = '16px';

    container.appendChild(this.createSectionTitle('Exploration'));

    const description = document.createElement('p');
    description.textContent = 'Enter rogue-like exploration with random relay zones, scavenging, and reactive threats. Each run is a fresh experience.';
    description.style.lineHeight = '1.75';
    description.style.color = '#d5d5d5';
    container.appendChild(description);

    const difficulty = document.createElement('div');
    difficulty.style.display = 'flex';
    difficulty.style.alignItems = 'center';
    difficulty.style.gap = '12px';
    difficulty.innerHTML = `
      <label style="flex:1; color:#c9d6e0;">Difficulty</label>
      <strong style="width: 48px; text-align:right;">${this.settings.difficulty}</strong>
    `;
    const diffSlider = document.createElement('input');
    diffSlider.type = 'range';
    diffSlider.min = '1';
    diffSlider.max = '8';
    diffSlider.value = String(this.settings.difficulty);
    diffSlider.style.width = '100%';
    diffSlider.oninput = () => {
      this.settings.difficulty = Number(diffSlider.value);
      this.render();
    };
    container.appendChild(difficulty);
    container.appendChild(diffSlider);

    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.flexWrap = 'wrap';
    actions.style.gap = '12px';
    actions.appendChild(this.createMenuButton('Start exploration run', () => this.startRun('exploration')));
    actions.appendChild(this.createMenuButton('Back to menu', () => this.setMode('menu'), true));
    container.appendChild(actions);
    container.appendChild(this.createStatusBanner());
    return container;
  }

  private renderSettingsScreen(): HTMLElement {
    const container = document.createElement('div');
    container.style.display = 'grid';
    container.style.gap = '16px';

    container.appendChild(this.createSectionTitle('Settings'));

    container.appendChild(this.createLabeledRange('Volume', 0, 100, Math.round(this.settings.volume * 100), (value) => {
      this.settings.volume = value / 100;
      this.statusMessage = `Volume set to ${Math.round(this.settings.volume * 100)}%.`;
      this.render();
    }));

    container.appendChild(this.createLabeledRange('Difficulty', 1, 8, this.settings.difficulty, (value) => {
      this.settings.difficulty = value;
      this.statusMessage = `Difficulty set to ${this.settings.difficulty}.`;
      this.render();
    }));

    container.appendChild(this.createThemeSelector());

    const hintToggle = document.createElement('button');
    hintToggle.textContent = this.settings.showHints ? 'Hide hints' : 'Show hints';
    hintToggle.onclick = () => {
      this.settings.showHints = !this.settings.showHints;
      this.statusMessage = this.settings.showHints ? 'Hints enabled.' : 'Hints disabled.';
      this.render();
    };
    hintToggle.style.padding = '14px 18px';
    hintToggle.style.border = '1px solid #4d5e7a';
    hintToggle.style.background = 'transparent';
    hintToggle.style.color = '#fff';
    hintToggle.style.cursor = 'pointer';
    container.appendChild(hintToggle);

    container.appendChild(this.createMenuButton('Back to menu', () => this.setMode('menu'), true));
    container.appendChild(this.createStatusBanner());
    return container;
  }

  private renderRunPanel(): HTMLElement {
    const container = document.createElement('div');
    container.style.display = 'grid';
    container.style.gap = '16px';

    container.appendChild(this.createSectionTitle('Run Dashboard'));

    if (!this.engine || !this.currentZone) {
      const error = document.createElement('p');
      error.textContent = 'No active run found. Return to the menu to begin a new session.';
      error.style.color = '#ff8989';
      container.appendChild(error);
      container.appendChild(this.createMenuButton('Back to menu', () => this.setMode('menu'), true));
      return container;
    }

    const statusCard = document.createElement('div');
    statusCard.style.padding = '18px';
    statusCard.style.border = '1px solid #2a374b';
    statusCard.style.background = 'rgba(255,255,255,0.02)';
    statusCard.style.display = 'grid';
    statusCard.style.gap = '12px';

    statusCard.innerHTML = `
      <div><strong>Run type:</strong> ${this.mode === 'story' ? 'Story Mode' : 'Exploration'}</div>
      <div><strong>Drifter:</strong> ${this.engine.drifter.name} (${this.engine.drifter.origin})</div>
      <div><strong>Zone:</strong> ${this.currentZone.name} - ${this.currentZone.type}</div>
      <div><strong>Signal:</strong> ${Math.round(this.engine.drifter.signalStrength)}%</div>
      <div><strong>Air quality:</strong> ${Math.round(this.engine.drifter.airQuality)}%</div>
      <div><strong>Difficulty:</strong> ${this.settings.difficulty}</div>
    `;
    container.appendChild(statusCard);

    const actions = document.createElement('div');
    actions.style.display = 'grid';
    actions.style.gridTemplateColumns = '1fr 1fr';
    actions.style.gap = '12px';

    actions.appendChild(this.createMenuButton('Advance time', () => {
      this.engine?.update(1, { x: 0, y: 0 }, []);
      this.statusMessage = 'Time advanced by one unit.';
      this.render();
    }));

    actions.appendChild(this.createMenuButton('Collect sample', () => {
      const sampleItem = {
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
      if (this.engine && this.engine.pickUpItem(sampleItem)) {
        this.statusMessage = 'Collected a relay sample and logged it to the logbook.';
      } else {
        this.statusMessage = 'Inventory full or unable to collect the sample.';
      }
      this.render();
    }));

    container.appendChild(actions);
    container.appendChild(this.createMenuButton('Return to menu', () => this.setMode('menu'), true));
    container.appendChild(this.createStatusBanner());
    return container;
  }

  private createMenuButton(label: string, onClick: () => void, secondary = false): HTMLButtonElement {
    const button = document.createElement('button');
    button.textContent = label;
    button.onclick = onClick;
    button.style.padding = '18px 22px';
    button.style.cursor = 'pointer';
    button.style.border = 'none';
    button.style.borderRadius = '12px';
    button.style.fontSize = '1rem';
    button.style.fontWeight = '700';
    button.style.background = secondary ? 'transparent' : '#68b8ff';
    button.style.color = secondary ? '#d0e4ff' : '#07101f';
    button.style.boxShadow = secondary ? '0 0 0 rgba(0,0,0,0)' : '0 16px 32px rgba(104, 184, 255, 0.2)';
    button.style.border = secondary ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(104, 184, 255, 0.2)';
    button.style.minHeight = '64px';
    return button;
  }

  private createSectionTitle(text: string): HTMLElement {
    const el = document.createElement('div');
    el.innerHTML = `<h2 style="margin:0; font-size:2rem;">${text}</h2>`;
    return el;
  }

  private createLabeledRange(labelText: string, min: number, max: number, value: number, onChange: (value: number) => void): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.style.display = 'grid';
    wrapper.style.gap = '8px';

    const label = document.createElement('label');
    label.textContent = `${labelText}: ${value}`;
    label.style.color = '#c9d6e0';
    wrapper.appendChild(label);

    const input = document.createElement('input');
    input.type = 'range';
    input.min = String(min);
    input.max = String(max);
    input.value = String(value);
    input.oninput = () => {
      const newValue = Number(input.value);
      label.textContent = `${labelText}: ${newValue}`;
      onChange(newValue);
    };
    wrapper.appendChild(input);
    return wrapper;
  }

  private createThemeSelector(): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.style.display = 'grid';
    wrapper.style.gap = '8px';

    const label = document.createElement('span');
    label.textContent = 'Theme';
    label.style.color = '#c9d6e0';
    wrapper.appendChild(label);

    const themes: Array<GameSettings['theme']> = ['dark', 'sepia', 'cold'];
    const palette = document.createElement('div');
    palette.style.display = 'flex';
    palette.style.gap = '10px';

    themes.forEach((theme) => {
      const button = document.createElement('button');
      button.textContent = theme;
      button.onclick = () => {
        this.settings.theme = theme;
        this.applyTheme();
        this.statusMessage = `Theme changed to ${theme}.`;
        this.render();
      };
      button.style.padding = '10px 14px';
      button.style.borderRadius = '10px';
      button.style.border = this.settings.theme === theme ? '2px solid #8bfdff' : '1px solid rgba(255,255,255,0.16)';
      button.style.background = 'transparent';
      button.style.color = '#fff';
      button.style.cursor = 'pointer';
      palette.appendChild(button);
    });

    wrapper.appendChild(palette);
    return wrapper;
  }

  private createStatusBanner(): HTMLElement {
    const banner = document.createElement('div');
    banner.style.padding = '16px 18px';
    banner.style.border = '1px solid rgba(255,255,255,0.08)';
    banner.style.background = 'rgba(255,255,255,0.02)';
    banner.style.color = '#b8d0e8';
    banner.style.borderRadius = '14px';
    banner.textContent = this.statusMessage;
    return banner;
  }

  private setMode(mode: AppMode): void {
    this.mode = mode;
    if (mode === 'menu') {
      this.backgroundFolder = this.chooseBackgroundFolder();
      this.statusMessage = 'Headed back to the main menu.';
    }
    this.render();
  }

  private renderBackground(): HTMLElement {
    const background = document.createElement('div');
    background.style.position = 'fixed';
    background.style.inset = '0';
    background.style.zIndex = '0';
    background.style.overflow = 'hidden';
    background.style.pointerEvents = 'none';
    background.style.backgroundImage = `url(${this.getBackgroundPath('orig.png')})`;
    background.style.backgroundSize = 'cover';
    background.style.backgroundPosition = 'center';
    background.style.filter = 'contrast(1.05) brightness(0.78)';

    ['1.png', '2.png', '3.png', '4.png'].forEach((layerName, index) => {
      const layer = document.createElement('img');
      layer.src = this.getBackgroundPath(layerName);
      layer.style.position = 'absolute';
      layer.style.inset = '0';
      layer.style.width = '100%';
      layer.style.height = '100%';
      layer.style.objectFit = 'cover';
      layer.style.opacity = `${0.18 + index * 0.08}`;
      layer.style.mixBlendMode = 'screen';
      layer.style.pointerEvents = 'none';
      background.appendChild(layer);
    });

    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.inset = '0';
    overlay.style.background = 'radial-gradient(circle at top left, rgba(255,255,255,0.08), transparent 28%), radial-gradient(circle at bottom right, rgba(0,0,0,0.28), transparent 35%)';
    overlay.style.pointerEvents = 'none';
    background.appendChild(overlay);

    return background;
  }

  private getBackgroundPath(fileName: string): string {
    return `${MENU_BACKGROUND_PATH_ROOT}/${encodeURIComponent(this.backgroundFolder)}/${fileName}`;
  }

  private chooseBackgroundFolder(): MenuBackgroundFolder {
    return MENU_BACKGROUND_FOLDERS[Math.floor(Math.random() * MENU_BACKGROUND_FOLDERS.length)];
  }

  private getSeed(): number {
    return Math.max(1000, Math.floor(Math.random() * 1000000));
  }

  private generateZone(): Zone {
    const generator = new WorldGenerator({ seed: this.getSeed(), zoneCount: 1, difficulty: this.settings.difficulty, era: 'Early Collapse' });
    const { zones } = generator.generate();
    return zones[0];
  }

  private startRun(mode: 'story' | 'exploration'): void {
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
      worldInfoOptions: { storageKey: 'drifter_ui_home_screen' },
    });
    this.mode = 'play';
    this.statusMessage = mode === 'story' ? 'Story mode initiated.' : 'Exploration run started.';
    this.render();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const app = new HomeScreen('app');
  app.run();
});
