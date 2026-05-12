import Phaser from 'phaser';
import { ENEMIES, MAPS, ITEMS, SKILLS, COMMON_ITEM_IDS, BOSS_ITEM_IDS, CAVES_COMMON_ITEM_IDS, CAVES_BOSS_ITEM_IDS } from '@idle-arpg/shared/src/gameData';
import type { EnemyDef, StageDef, InventoryItem, BattleResult } from '@idle-arpg/shared/src/types';
import { v4 as uuidv4 } from 'uuid';
import { PHASER_KEYS, AUDIO_KEYS } from '../assetMap';

interface CombatEnemy {
  def: EnemyDef;
  currentHp: number;
  maxHp: number;
  ticksUntilAttack: number;
  stunTicks: number;
  alive: boolean;
}

interface CombatPlayer {
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  attackSpeed: number;
  critChance: number;
  ticksUntilAttack: number;
  resource: number;
  maxResource: number;
}

interface SkillCooldowns {
  [skillId: string]: number;
}

export interface BattleConfig {
  stageId: string;
  stageName: string;
  playerStats: CombatPlayer;
  skillOrder: string[];
  targetMode: 'boss_first' | 'lowest_hp' | 'closest';
  onComplete: (result: BattleResult & { stageName: string }) => void;
}

interface LogEntry {
  text: string;
  color: number;
}

const GOLD   = 0xd4a017;
const RED    = 0xe05c5c;
const GREEN  = 0x5ce07a;
const BLUE   = 0x4a90d9;
const PURPLE = 0xc060ff;
const WHITE  = 0xe0e0e0;
const ORANGE = 0xff8c00;
const EXECUTE_HP_THRESHOLD = 0.3;
/** Phaser built-in blank texture key used as a non-visible placeholder sprite */
const FALLBACK_TEXTURE_KEY = '__DEFAULT';

export class BattleScene extends Phaser.Scene {
  private config!: BattleConfig;
  private enemies: CombatEnemy[] = [];
  private player!: CombatPlayer;
  private skillCooldowns: SkillCooldowns = {};
  private tick = 0;
  private battleEnded = false;
  private xpGained = 0;
  private goldGained = 0;
  private monstersKilled = 0;
  private itemsDropped: InventoryItem[] = [];
  private buffTicks = 0;
  private buffAttackBonus = 0;
  private defenseBuffTicks = 0;
  private defenseBuffBonus = 0;
  private bossPhase = 1;
  private logEntries: LogEntry[] = [];

  // UI objects
  private playerSprite!: Phaser.GameObjects.Image;
  private playerHpBar!: Phaser.GameObjects.Graphics;
  private playerHpText!: Phaser.GameObjects.Text;
  private playerResourceBar!: Phaser.GameObjects.Graphics;
  private playerResourceText!: Phaser.GameObjects.Text;
  private enemySprites: Phaser.GameObjects.Image[] = [];
  private enemyHpBars: Phaser.GameObjects.Graphics[] = [];
  private enemyLabels: Phaser.GameObjects.Text[] = [];
  private logText!: Phaser.GameObjects.Text;
  private skillButtonBgs: Phaser.GameObjects.Graphics[] = [];
  private skillButtonTexts: Phaser.GameObjects.Text[] = [];
  private skillButtonCds: Phaser.GameObjects.Text[] = [];
  private skillButtonZones: Phaser.GameObjects.Zone[] = [];
  private tickTimer!: Phaser.Time.TimerEvent;
  private stageLabel!: Phaser.GameObjects.Text;
  private buffLabel!: Phaser.GameObjects.Text;
  private bossPhaseLabel!: Phaser.GameObjects.Text;
  private bossHpBar!: Phaser.GameObjects.Graphics;
  private bossHpText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'BattleScene' });
  }

  init(config: BattleConfig) {
    this.config = config;
  }

  create() {
    const { width, height } = this.scale;
    const groundY = height * 0.62;

    // ── Background: tiled stone floor (bottom 60%) ─────────────────────────
    const floorKey = PHASER_KEYS.floor;
    if (this.textures.exists(floorKey)) {
      const tileSize = 16 * 3; // 48px display
      const cols = Math.ceil(width  / tileSize) + 1;
      const rows = Math.ceil(height * 0.4 / tileSize) + 1;
      const startY = height * 0.6;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          this.add.image(c * tileSize, startY + r * tileSize, floorKey)
            .setOrigin(0, 0)
            .setScale(3)
            .setAlpha(0.6);
        }
      }
    } else {
      // Fallback solid colour
      this.add.rectangle(0, height * 0.6, width, height * 0.4, 0x0d0d1a).setOrigin(0, 0);
    }

    // Dark gradient overlay on top of floor area for readability
    const grad = this.add.graphics();
    grad.fillGradientStyle(0x0a0a0f, 0x0a0a0f, 0x0a0a0f, 0x0a0a0f, 1, 1, 0, 0);
    grad.fillRect(0, 0, width, height * 0.6);

    // ── Stage title ────────────────────────────────────────────────────────
    this.stageLabel = this.add.text(width / 2, 14, this.config.stageName, {
      fontSize: '15px',
      color: '#d4a017',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0);

    // ── Player setup ───────────────────────────────────────────────────────
    this.player = { ...this.config.playerStats };
    this.player.ticksUntilAttack = this.player.attackSpeed;

    // Player sprite (warrior tile, scale 6 → 96px)
    const charKey = PHASER_KEYS.char('warrior');
    if (this.textures.exists(charKey)) {
      this.playerSprite = this.add.image(width * 0.15, groundY, charKey)
        .setOrigin(0.5, 1)
        .setScale(6)
        .setFlipX(false);
    } else {
      // Fallback neutral box
      const g = this.add.graphics();
      g.fillStyle(0x2a2a4a);
      g.fillRect(width * 0.15 - 20, groundY - 48, 40, 48);
      this.playerSprite = this.add.image(width * 0.15, groundY, FALLBACK_TEXTURE_KEY).setVisible(false);
    }

    this.add.text(width * 0.15, groundY + 4, 'Warrior', {
      fontSize: '10px',
      color: '#d4a017',
    }).setOrigin(0.5, 0);

    // Player HP bar
    this.playerHpBar  = this.add.graphics();
    this.playerHpText = this.add.text(
      width * 0.15, groundY + 28, '',
      { fontSize: '10px', color: '#e0e0e0' },
    ).setOrigin(0.5, 0);
    this.drawPlayerHp();

    // Player resource (mana) bar
    this.playerResourceBar  = this.add.graphics();
    this.playerResourceText = this.add.text(
      width * 0.15, groundY + 48, '',
      { fontSize: '9px', color: '#4a90d9' },
    ).setOrigin(0.5, 0);
    this.drawPlayerResource();

    // Buff label
    this.buffLabel = this.add.text(
      width * 0.15, groundY + 62, '',
      { fontSize: '9px', color: '#ffd700' },
    ).setOrigin(0.5, 0);

    // Boss phase label
    this.bossPhaseLabel = this.add.text(width / 2, 38, '', {
      fontSize: '13px',
      color: '#ff8c00',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0);

    // Boss HP bar (full-width, top of canvas; hidden until a boss is present)
    this.bossHpBar  = this.add.graphics();
    this.bossHpText = this.add.text(width / 2, 56, '', {
      fontSize: '10px',
      color: '#e0e0e0',
    }).setOrigin(0.5, 0);

    // ── Enemies ────────────────────────────────────────────────────────────
    this.setupEnemies();
    this.drawEnemies();

    // ── Skill UI ───────────────────────────────────────────────────────────
    this.drawSkillUI();

    // ── Combat log ─────────────────────────────────────────────────────────
    this.logText = this.add.text(12, groundY + 80, '', {
      fontSize: '9px',
      color: '#bbbbbb',
      wordWrap: { width: width - 24 },
    });

    // ── Init cooldowns ─────────────────────────────────────────────────────
    this.config.skillOrder.forEach(id => { this.skillCooldowns[id] = 0; });

    // ── Start combat loop ──────────────────────────────────────────────────
    this.tickTimer = this.time.addEvent({
      delay: 500,
      loop: true,
      callback: this.doTick,
      callbackScope: this,
    });
  }


  private setupEnemies() {
    const stage = this.findStage(this.config.stageId);
    if (!stage) return;
    this.enemies = [];
    stage.enemies.forEach(({ enemyId, count }) => {
      const def = ENEMIES[enemyId];
      if (!def) return;
      for (let i = 0; i < count; i++) {
        this.enemies.push({
          // Shallow copy def so phase transitions don't mutate the shared ENEMIES object
          def: { ...def },
          currentHp: def.hp,
          maxHp: def.hp,
          ticksUntilAttack: def.attackSpeed,
          stunTicks: 0,
          alive: true,
        });
      }
    });
  }

  private findStage(stageId: string): StageDef | undefined {
    for (const map of Object.values(MAPS)) {
      const s = map.stages.find(st => st.id === stageId);
      if (s) return s;
    }
    return undefined;
  }

  private drawEnemies() {
    const { width, height } = this.scale;
    const groundY = height * 0.62;

    // Clear old
    this.enemySprites.forEach(s => s.destroy());
    this.enemyHpBars.forEach(g => g.destroy());
    this.enemyLabels.forEach(t => t.destroy());
    this.enemySprites = [];
    this.enemyHpBars = [];
    this.enemyLabels = [];

    const alive = this.enemies.filter(e => e.alive);
    const spacing = Math.min(120, (width * 0.65) / Math.max(alive.length, 1));
    const startX = width * 0.35;

    alive.forEach((enemy, i) => {
      const x = startX + i * spacing;
      const scale = enemy.def.isBoss ? 8 : 4;

      // Enemy sprite
      const key = PHASER_KEYS.enemy(enemy.def.id);
      let sprite: Phaser.GameObjects.Image;
      if (this.textures.exists(key)) {
        sprite = this.add.image(x, groundY, key)
          .setOrigin(0.5, 1)
          .setScale(scale)
          .setFlipX(true);
      } else {
        // Fallback neutral box drawn via graphics
        const g = this.add.graphics();
        const bw = 16 * scale;
        const bh = 16 * scale;
        g.fillStyle(0x2a2a3a);
        g.fillRect(x - bw / 2, groundY - bh, bw, bh);
        // Cast graphics as Image to satisfy type; we use Image[] for sprites array
        sprite = this.add.image(x, groundY, FALLBACK_TEXTURE_KEY).setVisible(false);
      }
      this.enemySprites.push(sprite);

      // Boss: add pulsing tint anim
      if (enemy.def.isBoss) {
        this.tweens.add({
          targets: sprite,
          tint: { from: 0xffffff, to: 0xffddaa },
          duration: 800,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      }

      // Enemy name label
      const nameLabel = this.add.text(x, groundY + 3, enemy.def.name, {
        fontSize: '9px',
        color: '#e0e0e0',
      }).setOrigin(0.5, 0);
      this.enemyLabels.push(nameLabel);

      // Enemy HP bar
      const hpBar = this.add.graphics();
      this.enemyHpBars.push(hpBar);
      this.drawEnemyHp(hpBar, enemy, x, groundY + 14);
    });

    // Boss HP bar at top of canvas
    this.drawBossHpBar();
  }

  private drawEnemyHp(g: Phaser.GameObjects.Graphics, enemy: CombatEnemy, x: number, y: number) {
    const w = enemy.def.isBoss ? 80 : 60;
    const h = 7;
    const pct = enemy.currentHp / enemy.maxHp;
    g.clear();
    g.fillStyle(0x2a2a2a);
    g.fillRect(x - w / 2, y, w, h);
    g.fillStyle(0xe05c5c);
    g.fillRect(x - w / 2, y, Math.max(0, w * pct), h);
    // Frame overlay
    g.lineStyle(1, 0x555555);
    g.strokeRect(x - w / 2, y, w, h);
  }

  private drawBossHpBar() {
    const { width } = this.scale;
    const boss = this.enemies.find(e => e.def.isBoss && e.alive);
    this.bossHpBar.clear();
    if (!boss) {
      this.bossHpText.setText('');
      return;
    }
    const pct = boss.currentHp / boss.maxHp;
    const w = width - 24;
    const h = 10;
    const x = 12;
    const y = 68;
    this.bossHpBar.fillStyle(0x2a2a2a);
    this.bossHpBar.fillRect(x, y, w, h);
    this.bossHpBar.fillStyle(0xe05c5c);
    this.bossHpBar.fillRect(x, y, Math.max(0, w * pct), h);
    this.bossHpBar.lineStyle(1, 0x555555);
    this.bossHpBar.strokeRect(x, y, w, h);
    this.bossHpText.setText(
      `${boss.def.name}  ${boss.currentHp}/${boss.maxHp}`,
    );
  }

  private drawPlayerHp() {
    const { width, height } = this.scale;
    const x = width * 0.15;
    const y = height * 0.62 + 16;
    const w = 110;
    const h = 8;
    const pct = this.player.hp / this.player.maxHp;
    this.playerHpBar.clear();
    this.playerHpBar.fillStyle(0x2a2a2a);
    this.playerHpBar.fillRect(x - w / 2, y, w, h);
    this.playerHpBar.fillStyle(0xe05c5c);
    this.playerHpBar.fillRect(x - w / 2, y, Math.max(0, w * pct), h);
    this.playerHpBar.lineStyle(1, 0x555555);
    this.playerHpBar.strokeRect(x - w / 2, y, w, h);
    this.playerHpText.setText(`${this.player.hp}/${this.player.maxHp}`);
  }

  private drawPlayerResource() {
    const { width, height } = this.scale;
    const x = width * 0.15;
    const y = height * 0.62 + 36;
    const w = 110;
    const h = 6;
    const pct = this.player.resource / this.player.maxResource;
    this.playerResourceBar.clear();
    this.playerResourceBar.fillStyle(0x1a1a44);
    this.playerResourceBar.fillRect(x - w / 2, y, w, h);
    this.playerResourceBar.fillStyle(0x4a90d9);
    this.playerResourceBar.fillRect(x - w / 2, y, Math.max(0, w * pct), h);
    this.playerResourceText.setText(`EN ${this.player.resource}/${this.player.maxResource}`);
  }

  private drawSkillUI() {
    const { width, height } = this.scale;
    const skillIds = this.config.skillOrder;
    // Destroy old buttons
    this.skillButtonBgs.forEach(b => b.destroy());
    this.skillButtonTexts.forEach(t => t.destroy());
    this.skillButtonCds.forEach(t => t.destroy());
    this.skillButtonZones.forEach(z => z.destroy());
    this.skillButtonBgs = [];
    this.skillButtonTexts = [];
    this.skillButtonCds = [];
    this.skillButtonZones = [];

    const stage = this.findStage(this.config.stageId);
    const isBossStage = stage?.isBoss ?? false;

    skillIds.forEach((id, i) => {
      const skill = SKILLS[id];
      if (!skill) return;
      const x = 12 + i * 110;
      const y = height - 65;

      const bg = this.add.graphics();
      bg.fillStyle(0x1a1a2e);
      bg.lineStyle(1, 0x2a2a4a);
      bg.fillRoundedRect(x, y, 100, 54, 6);
      this.skillButtonBgs.push(bg);

      const nameText = this.add.text(x + 50, y + 8, skill.name, { fontSize: '11px', color: '#d4a017', fontStyle: 'bold' }).setOrigin(0.5, 0);
      this.skillButtonTexts.push(nameText);

      const cdText = this.add.text(x + 50, y + 26, `CD: ${skill.cooldown}t | E:${skill.resourceCost}`, { fontSize: '9px', color: '#888' }).setOrigin(0.5, 0);
      this.skillButtonCds.push(cdText);

      if (isBossStage) {
        const zone = this.add.zone(x + 50, y + 27, 100, 54).setInteractive({ useHandCursor: true });
        zone.on('pointerdown', () => {
          this.manualFireSkill(id);
        });
        zone.on('pointerover', () => {
          bg.clear();
          bg.fillStyle(this.skillCooldowns[id] > 0 ? 0x111122 : 0x2a2a4e);
          bg.lineStyle(1, this.skillCooldowns[id] > 0 ? 0x333355 : 0xd4a017);
          bg.fillRoundedRect(x, y, 100, 54, 6);
        });
        zone.on('pointerout', () => {
          this.refreshSkillButtonBg(id, x, y, bg);
        });
        this.skillButtonZones.push(zone);
      }
    });
  }

  private refreshSkillButtonBg(skillId: string, x: number, y: number, bg: Phaser.GameObjects.Graphics) {
    const onCooldown = this.skillCooldowns[skillId] > 0;
    const noResource = this.player.resource < (SKILLS[skillId]?.resourceCost ?? 0);
    const dim = onCooldown || noResource;
    bg.clear();
    bg.fillStyle(dim ? 0x111122 : 0x1a1a2e);
    bg.lineStyle(1, dim ? 0x222244 : 0x2a2a4a);
    bg.fillRoundedRect(x, y, 100, 54, 6);
  }

  private updateSkillButtonCooldowns() {
    const { height } = this.scale;
    const stage = this.findStage(this.config.stageId);
    const isBossStage = stage?.isBoss ?? false;

    this.config.skillOrder.forEach((id, i) => {
      const skill = SKILLS[id];
      if (!skill) return;
      const x = 12 + i * 110;
      const y = height - 65;
      const bg = this.skillButtonBgs[i];
      const cdText = this.skillButtonCds[i];
      if (!bg || !cdText) return;

      const onCooldown = this.skillCooldowns[id] > 0;
      const noResource = this.player.resource < skill.resourceCost;
      const dim = onCooldown || noResource;

      // Buff active state: show gold glow
      const isBuffActive = (id === 'battle_cry' && this.buffTicks > 0) || (id === 'iron_skin' && this.defenseBuffTicks > 0);
      const activeTicks = id === 'battle_cry' ? this.buffTicks : (id === 'iron_skin' ? this.defenseBuffTicks : 0);

      if (isBuffActive) {
        bg.clear();
        bg.fillStyle(0x1a1a2e);
        bg.lineStyle(2, 0xd4a017);
        bg.fillRoundedRect(x, y, 100, 54, 6);
        cdText.setText(`[ON] Active (${activeTicks}t)`);
        cdText.setColor('#d4a017');
      } else {
        if (isBossStage) {
          bg.clear();
          bg.fillStyle(dim ? 0x111122 : 0x1a1a2e);
          bg.lineStyle(1, onCooldown ? 0x555555 : (noResource ? 0x222244 : 0x2a2a4a));
          bg.fillRoundedRect(x, y, 100, 54, 6);
        }

        if (onCooldown) {
          cdText.setText(`CD: ${this.skillCooldowns[id]}t | E:${skill.resourceCost}`);
          cdText.setColor('#666666');
        } else {
          cdText.setText(`CD: ${skill.cooldown}t | E:${skill.resourceCost}`);
          cdText.setColor(noResource ? '#555577' : '#888888');
        }
      }
    });
  }

  private manualFireSkill(skillId: string) {
    if (this.battleEnded) return;
    const skill = SKILLS[skillId];
    if (!skill) return;
    if (this.skillCooldowns[skillId] > 0) {
      this.addLog(`${skill.name} still on cooldown (${this.skillCooldowns[skillId]}t)`, WHITE);
      return;
    }
    if (this.player.resource < skill.resourceCost) {
      this.addLog(`Not enough resource for ${skill.name}!`, BLUE);
      return;
    }
    this.fireSkill(skillId);
  }

  private addLog(text: string, _color: number = WHITE) {
    this.logEntries.push({ text, color: _color });
    if (this.logEntries.length > 8) this.logEntries.shift();
    const combined = this.logEntries.map(e => e.text).join('\n');
    this.logText.setText(combined);
  }

  private playSound(key: string, volume: number) {
    if (this.sound && this.cache.audio.exists(key)) {
      this.sound.play(key, { volume });
    }
  }

  private spawnDamageText(x: number, y: number, text: string, color: string, isCrit = false) {
    const dmgText = this.add.text(x, y - 20, text, {
      fontSize: isCrit ? '20px' : '14px',
      fontFamily: "'KenneyPixel', monospace",
      color,
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    if (isCrit) {
      this.tweens.add({
        targets: dmgText,
        scaleX: { from: 1, to: 1.5 },
        scaleY: { from: 1, to: 1.5 },
        duration: 120,
        yoyo: true,
      });
    }

    this.tweens.add({
      targets: dmgText,
      y: y - 70,
      alpha: 0,
      duration: isCrit ? 900 : 700,
      ease: 'Power1',
      onComplete: () => dmgText.destroy(),
    });
  }

  private getEnemyScreenPosition(enemy: CombatEnemy): { x: number; y: number } {
    const { width, height } = this.scale;
    const alive = this.enemies.filter(e => e.alive);
    const idx = alive.indexOf(enemy);
    const spacing = Math.min(120, (width * 0.65) / Math.max(alive.length, 1));
    const startX = width * 0.35;
    return { x: startX + idx * spacing, y: height * 0.62 - 60 };
  }

  /** Flash enemy sprite red on hit */
  private flashEnemyHit(enemy: CombatEnemy) {
    const alive = this.enemies.filter(e => e.alive);
    const idx = alive.indexOf(enemy);
    const sprite = this.enemySprites[idx];
    if (!sprite || !sprite.visible) return;
    this.tweens.add({
      targets: sprite,
      tint: { from: 0xff4444, to: enemy.def.isBoss ? 0xffddaa : 0xffffff },
      duration: 100,
      ease: 'Linear',
    });
  }

  /** Flash player sprite alpha on hit */
  private flashPlayerHit() {
    if (!this.playerSprite?.visible) return;
    this.tweens.add({
      targets: this.playerSprite,
      alpha: { from: 0.4, to: 1 },
      duration: 120,
      ease: 'Linear',
    });
  }

  private doTick() {
    if (this.battleEnded) return;
    this.tick++;

    // Decrement skill cooldowns
    for (const id of Object.keys(this.skillCooldowns)) {
      if (this.skillCooldowns[id] > 0) this.skillCooldowns[id]--;
    }

    // Regen resource (+5 per tick, capped at maxResource)
    this.player.resource = Math.min(this.player.maxResource, this.player.resource + 5);

    // Decrement attack buff
    if (this.buffTicks > 0) {
      this.buffTicks--;
      if (this.buffTicks === 0) {
        this.player.attack -= this.buffAttackBonus;
        this.buffAttackBonus = 0;
        this.updateBuffLabel();
      }
    }

    // Decrement defense buff
    if (this.defenseBuffTicks > 0) {
      this.defenseBuffTicks--;
      if (this.defenseBuffTicks === 0) {
        this.player.defense -= this.defenseBuffBonus;
        this.defenseBuffBonus = 0;
        this.updateBuffLabel();
      }
    }

    // Player attacks
    this.player.ticksUntilAttack--;
    if (this.player.ticksUntilAttack <= 0) {
      this.player.ticksUntilAttack = this.player.attackSpeed;
      this.useSkillOrAttack();
    }

    // Enemies attack
    const aliveEnemies = this.enemies.filter(e => e.alive);
    aliveEnemies.forEach(enemy => {
      if (enemy.stunTicks > 0) {
        enemy.stunTicks--;
        return;
      }
      enemy.ticksUntilAttack--;
      if (enemy.ticksUntilAttack <= 0) {
        enemy.ticksUntilAttack = enemy.def.attackSpeed;
        const dmg = Math.max(1, enemy.def.attack - this.player.defense);
        this.player.hp = Math.max(0, this.player.hp - dmg);
        this.addLog(`${enemy.def.name} hits for ${dmg} dmg`, RED);
        this.drawPlayerHp();
        this.flashPlayerHit();
        this.playSound(AUDIO_KEYS.hit, 0.35);
        // Damage text on player side
        const { width, height } = this.scale;
        this.spawnDamageText(width * 0.15, height * 0.62 - 20, `-${dmg}`, '#e05c5c');
        // Flash red
        this.cameras.main.flash(100, 200, 0, 0, false);
      }
    });

    // Update resource bar and skill buttons
    this.drawPlayerResource();
    this.updateSkillButtonCooldowns();

    // Check player dead
    if (this.player.hp <= 0) {
      this.endBattle(false);
      return;
    }

    // Check all enemies dead
    if (this.enemies.every(e => !e.alive)) {
      this.endBattle(true);
    }
  }

  private updateBuffLabel() {
    const parts: string[] = [];
    if (this.buffTicks > 0) parts.push(`[ATK+] Battle Cry (${this.buffTicks}t)`);
    if (this.defenseBuffTicks > 0) parts.push(`[DEF+] Iron Skin (${this.defenseBuffTicks}t)`);
    this.buffLabel.setText(parts.join(' | '));
  }

  private useSkillOrAttack() {
    // Try skills in priority order
    for (const skillId of this.config.skillOrder) {
      const skill = SKILLS[skillId];
      if (!skill) continue;
      if (this.skillCooldowns[skillId] > 0) continue;
      if (this.player.resource < skill.resourceCost) continue;

      this.fireSkill(skillId);
      return;
    }

    // Auto-attack if no skill used
    this.doAutoAttack();
  }

  private fireSkill(skillId: string) {
    const skill = SKILLS[skillId];
    if (!skill) return;

    // Deduct resource cost
    this.player.resource = Math.max(0, this.player.resource - skill.resourceCost);
    this.skillCooldowns[skillId] = skill.cooldown;

    if (skill.id === 'battle_cry') {
      const bonus = Math.floor(this.player.attack * 0.5);
      this.player.attack += bonus;
      this.buffAttackBonus = bonus;
      this.buffTicks = skill.buffDuration ?? 4;
      this.updateBuffLabel();
      this.addLog(`[ATK+] Battle Cry! ATK +${bonus} for ${this.buffTicks}t`, PURPLE);
      return;
    }

    if (skill.id === 'iron_skin') {
      const bonus = Math.floor(this.player.defense * 0.5);
      this.player.defense += bonus;
      this.defenseBuffBonus = bonus;
      this.defenseBuffTicks = skill.buffDuration ?? 5;
      this.updateBuffLabel();
      this.addLog(`[DEF+] Iron Skin! DEF +${bonus} for ${this.defenseBuffTicks}t`, BLUE);
      return;
    }

    if (skill.damage > 0) {
      if (skill.id === 'whirlwind') {
        // Hit all alive enemies
        const alive = this.enemies.filter(e => e.alive);
        if (alive.length === 0) return;
        alive.forEach(target => {
          const isCrit = Math.random() < this.player.critChance;
          let dmg = Math.max(1, this.player.attack + skill.damage - target.def.defense);
          if (isCrit) dmg = Math.floor(dmg * 2);
          target.currentHp = Math.max(0, target.currentHp - dmg);
          this.flashEnemyHit(target);
          const pos = this.getEnemyScreenPosition(target);
          this.spawnDamageText(pos.x, pos.y, isCrit ? `*${dmg}` : `${dmg}`, isCrit ? '#ffd700' : '#ff8c00', isCrit);
          this.playSound(isCrit ? AUDIO_KEYS.crit : AUDIO_KEYS.hit, isCrit ? 0.55 : 0.35);
          this.addLog(`Whirlwind: ${dmg} on ${target.def.name}${isCrit ? ' CRIT!' : ''}`, ORANGE);
          if (target.currentHp <= 0) {
            target.alive = false;
            this.xpGained += target.def.xpReward;
            this.goldGained += target.def.goldReward;
            this.monstersKilled++;
            this.addLog(`${target.def.name} defeated! +${target.def.xpReward}xp +${target.def.goldReward}g`, GOLD);
            this.rollItemDrop(target.def);
          }
        });
        this.drawEnemies();
        if (this.enemies.every(e => !e.alive)) {
          this.endBattle(true);
        }
        return;
      }

      if (skill.id === 'cleave') {
        // Hit up to 2 alive enemies
        const targets = this.enemies.filter(e => e.alive).slice(0, 2);
        if (targets.length === 0) return;
        targets.forEach(target => {
          const isCrit = Math.random() < this.player.critChance;
          let dmg = Math.max(1, this.player.attack + skill.damage - target.def.defense);
          if (isCrit) dmg = Math.floor(dmg * 2);
          target.currentHp = Math.max(0, target.currentHp - dmg);
          this.flashEnemyHit(target);
          const pos = this.getEnemyScreenPosition(target);
          this.spawnDamageText(pos.x, pos.y, isCrit ? `*${dmg}` : `${dmg}`, isCrit ? '#ffd700' : '#ff8c00', isCrit);
          this.playSound(isCrit ? AUDIO_KEYS.crit : AUDIO_KEYS.hit, isCrit ? 0.55 : 0.35);
          this.addLog(`Cleave: ${dmg} on ${target.def.name}${isCrit ? ' CRIT!' : ''}`, ORANGE);
          if (target.currentHp <= 0) {
            target.alive = false;
            this.xpGained += target.def.xpReward;
            this.goldGained += target.def.goldReward;
            this.monstersKilled++;
            this.addLog(`${target.def.name} defeated! +${target.def.xpReward}xp +${target.def.goldReward}g`, GOLD);
            this.rollItemDrop(target.def);
          }
        });
        this.drawEnemies();
        if (this.enemies.every(e => !e.alive)) {
          this.endBattle(true);
        }
        return;
      }

      const target = this.pickTarget();
      if (!target) return;
      const isCrit = Math.random() < this.player.critChance;
      let dmg = Math.max(1, this.player.attack + skill.damage - target.def.defense);
      // Execute bonus: 2× damage below the execute threshold HP fraction
      if (skill.id === 'execute' && target.currentHp / target.maxHp < EXECUTE_HP_THRESHOLD) {
        dmg *= 2;
      }
      if (isCrit) dmg = Math.floor(dmg * 2);
      target.currentHp = Math.max(0, target.currentHp - dmg);
      this.flashEnemyHit(target);
      const critStr = isCrit ? ' CRIT!' : '';
      this.addLog(`${skill.name}: ${dmg} dmg on ${target.def.name}${critStr}`, isCrit ? GOLD : GREEN);
      const pos = this.getEnemyScreenPosition(target);
      this.spawnDamageText(pos.x, pos.y, isCrit ? `*${dmg}` : `${dmg}`, isCrit ? '#ffd700' : '#ff8800', isCrit);
      this.playSound(isCrit ? AUDIO_KEYS.crit : AUDIO_KEYS.hit, isCrit ? 0.55 : 0.35);

      if (skill.stunDuration) {
        target.stunTicks = skill.stunDuration;
        this.addLog(`${target.def.name} stunned ${skill.stunDuration}t!`, BLUE);
      }

      if (target.currentHp <= 0) {
        target.alive = false;
        this.xpGained += target.def.xpReward;
        this.goldGained += target.def.goldReward;
        this.monstersKilled++;
        this.addLog(`${target.def.name} defeated! +${target.def.xpReward}xp +${target.def.goldReward}g`, GOLD);
        this.rollItemDrop(target.def);
        this.drawEnemies();
        if (this.enemies.every(e => !e.alive)) {
          this.endBattle(true);
        }
      } else {
        if (target.def.isBoss) {
          this.checkBossPhase(target);
        }
        this.updateEnemyHpBars();
      }
    }
  }

  private doAutoAttack() {
    const target = this.pickTarget();
    if (!target) return;
    const isCrit = Math.random() < this.player.critChance;
    let dmg = Math.max(1, this.player.attack - target.def.defense);
    if (isCrit) dmg = Math.floor(dmg * 2);
    target.currentHp = Math.max(0, target.currentHp - dmg);
    const critStr = isCrit ? ' CRIT!' : '';
    this.addLog(`Auto-attack: ${dmg} dmg on ${target.def.name}${critStr}`, isCrit ? GOLD : WHITE);
    this.flashEnemyHit(target);
    const pos = this.getEnemyScreenPosition(target);
    this.spawnDamageText(pos.x, pos.y, isCrit ? `*${dmg}` : `${dmg}`, isCrit ? '#ffd700' : '#e0e0e0', isCrit);
    this.playSound(isCrit ? AUDIO_KEYS.crit : AUDIO_KEYS.hit, isCrit ? 0.55 : 0.35);

    if (target.currentHp <= 0) {
      target.alive = false;
      this.xpGained += target.def.xpReward;
      this.goldGained += target.def.goldReward;
      this.monstersKilled++;
      this.addLog(`${target.def.name} defeated! +${target.def.xpReward}xp +${target.def.goldReward}g`, GOLD);
      this.rollItemDrop(target.def);
      this.drawEnemies();
      if (this.enemies.every(e => !e.alive)) {
        this.endBattle(true);
      }
    } else {
      if (target.def.isBoss) {
        this.checkBossPhase(target);
      }
      this.updateEnemyHpBars();
    }
  }

  private checkBossPhase(boss: CombatEnemy) {
    const pct = boss.currentHp / boss.maxHp;
    const newPhase = pct <= 0.3 ? 3 : pct <= 0.6 ? 2 : 1;
    if (newPhase !== this.bossPhase) {
      this.bossPhase = newPhase;
      const phaseColors = ['', '#ffff00', '#ff8c00', '#e05c5c'];
      this.bossPhaseLabel.setText(`!! BOSS PHASE ${newPhase} !!`);
      this.bossPhaseLabel.setColor(phaseColors[newPhase]);
      this.bossPhaseLabel.setAlpha(1);
      this.addLog(`${boss.def.name} enters Phase ${newPhase}!`, ORANGE);
      this.cameras.main.shake(300, 0.012);
      // Boost boss attack per phase transition
      boss.def.attack = Math.floor(boss.def.attack * 1.3);
      this.addLog(`${boss.def.name} ATK increased!`, RED);
      // Flash: red for phase 3, orange for phase 2
      if (newPhase === 3) {
        this.cameras.main.flash(300, 255, 0, 0, false);
      } else {
        this.cameras.main.flash(200, 255, 140, 0, false);
      }
      // Fade out the phase label after 2 seconds
      this.time.delayedCall(2000, () => {
        this.tweens.add({
          targets: this.bossPhaseLabel,
          alpha: 0,
          duration: 500,
          onComplete: () => {
            this.bossPhaseLabel.setText('').setAlpha(1);
          },
        });
      });
    }
  }

  private pickTarget(): CombatEnemy | undefined {
    const alive = this.enemies.filter(e => e.alive);
    if (alive.length === 0) return undefined;

    switch (this.config.targetMode) {
      case 'boss_first': {
        const boss = alive.find(e => e.def.isBoss);
        if (boss) return boss;
        return alive.reduce((min, e) => e.currentHp < min.currentHp ? e : min, alive[0]);
      }
      case 'lowest_hp':
        return alive.reduce((min, e) => e.currentHp < min.currentHp ? e : min, alive[0]);
      case 'closest':
        // Closest = first in spawn order
        return alive[0];
      default:
        return alive[0];
    }
  }

  private rollItemDrop(def: EnemyDef) {
    const isCavesMap = this.config.stageId.startsWith('stone_caves');

    if (def.isBoss) {
      const pool = isCavesMap ? CAVES_BOSS_ITEM_IDS : BOSS_ITEM_IDS;
      if (Math.random() < 0.9) {
        const id = pool[Math.floor(Math.random() * pool.length)];
        const itemDef = ITEMS[id];
        if (itemDef) {
          const drop: InventoryItem = { id: uuidv4(), itemDefId: id, rarity: itemDef.rarity };
          this.itemsDropped.push(drop);
          this.playSound(AUDIO_KEYS.loot, 0.5);
          this.addLog(`[LOOT] ${itemDef.name} dropped!`, ORANGE);
        }
      }
    } else {
      const pool = isCavesMap ? CAVES_COMMON_ITEM_IDS : COMMON_ITEM_IDS;
      if (Math.random() < 0.2) {
        const id = pool[Math.floor(Math.random() * pool.length)];
        const itemDef = ITEMS[id];
        if (itemDef) {
          const drop: InventoryItem = { id: uuidv4(), itemDefId: id, rarity: itemDef.rarity };
          this.itemsDropped.push(drop);
          this.playSound(AUDIO_KEYS.loot, 0.5);
          this.addLog(`[LOOT] ${itemDef.name} dropped!`, BLUE);
        }
      }
    }
  }

  private updateEnemyHpBars() {
    const alive = this.enemies.filter(e => e.alive);
    const { width, height } = this.scale;
    const spacing = Math.min(120, (width * 0.65) / Math.max(alive.length, 1));
    const startX = width * 0.35;
    const groundY = height * 0.62;

    alive.forEach((enemy, i) => {
      const x = startX + i * spacing;
      const bar = this.enemyHpBars[i];
      if (bar) this.drawEnemyHp(bar, enemy, x, groundY + 14);
    });
    this.drawBossHpBar();
  }

  private endBattle(won: boolean) {
    if (this.battleEnded) return;
    this.battleEnded = true;
    this.tickTimer.remove(false);

    this.playSound(won ? AUDIO_KEYS.victory : AUDIO_KEYS.defeat, 0.6);

    const { width, height } = this.scale;
    this.add.rectangle(0, 0, width, height, 0x000000, 0.7).setOrigin(0, 0);

    const resultText = won ? 'VICTORY!' : 'DEFEATED';
    const resultColor = won ? '#5ce07a' : '#e05c5c';

    this.add.text(width / 2, height / 2 - 60, resultText, {
      fontSize: '34px',
      fontFamily: "'KenneyFuture', monospace",
      color: resultColor,
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5);

    if (won) {
      this.add.text(width / 2, height / 2, [
        `+${this.xpGained} XP`,
        `+${this.goldGained} Gold`,
        `${this.monstersKilled} monsters killed`,
        this.itemsDropped.length > 0 ? `${this.itemsDropped.length} item(s) dropped!` : '',
      ].filter(Boolean).join('\n'), {
        fontSize: '15px',
        fontFamily: "'KenneyPixel', monospace",
        color: '#d4a017',
        align: 'center',
      }).setOrigin(0.5, 0.5);
    }

    this.time.delayedCall(won ? 2500 : 2000, () => {
      this.config.onComplete({
        won,
        xpGained: this.xpGained,
        goldGained: this.goldGained,
        itemsDropped: this.itemsDropped,
        monstersKilled: this.monstersKilled,
        stageId: this.config.stageId,
        stageName: this.config.stageName,
      });
    });
  }

  destroy(): void {
    if (this.tickTimer) this.tickTimer.remove(false);
  }
}
