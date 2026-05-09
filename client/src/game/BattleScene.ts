import Phaser from 'phaser';
import { ENEMIES, MAPS, ITEMS, SKILLS, COMMON_ITEM_IDS, BOSS_ITEM_IDS, CAVES_COMMON_ITEM_IDS, CAVES_BOSS_ITEM_IDS } from '@idle-arpg/shared/src/gameData';
import type { EnemyDef, StageDef, InventoryItem, BattleResult } from '@idle-arpg/shared/src/types';
import { v4 as uuidv4 } from 'uuid';

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

const GOLD = 0xd4a017;
const RED = 0xe05c5c;
const GREEN = 0x5ce07a;
const BLUE = 0x4a90d9;
const PURPLE = 0xc060ff;
const WHITE = 0xe0e0e0;
const ORANGE = 0xff8c00;

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
  private playerHpBar!: Phaser.GameObjects.Graphics;
  private playerHpText!: Phaser.GameObjects.Text;
  private playerResourceBar!: Phaser.GameObjects.Graphics;
  private playerResourceText!: Phaser.GameObjects.Text;
  private enemyGraphics: Phaser.GameObjects.Graphics[] = [];
  private enemyHpBars: Phaser.GameObjects.Graphics[] = [];
  private enemyLabels: Phaser.GameObjects.Text[] = [];
  private logText!: Phaser.GameObjects.Text;
  private skillButtonBgs: Phaser.GameObjects.Graphics[] = [];
  private skillButtonTexts: Phaser.GameObjects.Text[] = [];
  private skillButtonCds: Phaser.GameObjects.Text[] = [];
  private skillButtonZones: Phaser.GameObjects.Zone[] = [];
  private tickTimer!: Phaser.Time.TimerEvent;
  private stageLabel!: Phaser.GameObjects.Text;
  private playerLabel!: Phaser.GameObjects.Text;
  private buffLabel!: Phaser.GameObjects.Text;
  private bossPhaseLabel!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'BattleScene' });
  }

  init(config: BattleConfig) {
    this.config = config;
  }

  create() {
    const { width, height } = this.scale;

    // Background
    this.add.rectangle(0, 0, width, height, 0x0a0a0f).setOrigin(0, 0);
    // Ground line
    this.add.rectangle(0, height * 0.6, width, 2, 0x2a2a4a).setOrigin(0, 0);

    // Stage title
    this.stageLabel = this.add.text(width / 2, 16, this.config.stageName, {
      fontSize: '16px',
      color: '#d4a017',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0);

    // Set up player
    this.player = { ...this.config.playerStats };
    this.player.ticksUntilAttack = this.player.attackSpeed;

    // Set up enemies from stage def
    this.setupEnemies();

    // Player visual
    this.playerLabel = this.add.text(width * 0.15, height * 0.6 - 10, '🛡️', { fontSize: '48px' }).setOrigin(0.5, 1);
    this.add.text(width * 0.15, height * 0.6 + 8, 'Warrior', { fontSize: '11px', color: '#d4a017' }).setOrigin(0.5, 0);

    // Player HP bar
    this.playerHpBar = this.add.graphics();
    this.playerHpText = this.add.text(width * 0.15, height * 0.6 + 28, '', { fontSize: '11px', color: '#e0e0e0' }).setOrigin(0.5, 0);
    this.drawPlayerHp();

    // Player Resource bar
    this.playerResourceBar = this.add.graphics();
    this.playerResourceText = this.add.text(width * 0.15, height * 0.6 + 50, '', { fontSize: '10px', color: '#4a90d9' }).setOrigin(0.5, 0);
    this.drawPlayerResource();

    // Buff label
    this.buffLabel = this.add.text(width * 0.15, height * 0.6 + 64, '', { fontSize: '10px', color: '#ffd700' }).setOrigin(0.5, 0);

    // Boss phase label (hidden until needed)
    this.bossPhaseLabel = this.add.text(width / 2, 40, '', {
      fontSize: '14px',
      color: '#ff8c00',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0);

    // Draw enemies
    this.drawEnemies();

    // Skill UI
    this.drawSkillUI();

    // Combat log
    this.logText = this.add.text(12, height * 0.62 + 10, '', {
      fontSize: '10px',
      color: '#cccccc',
      wordWrap: { width: width - 24 },
    });

    // Skill cooldowns
    this.config.skillOrder.forEach(id => { this.skillCooldowns[id] = 0; });

    // Start combat loop
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
          def,
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
    // Clear old
    this.enemyGraphics.forEach(g => g.destroy());
    this.enemyHpBars.forEach(g => g.destroy());
    this.enemyLabels.forEach(t => t.destroy());
    this.enemyGraphics = [];
    this.enemyHpBars = [];
    this.enemyLabels = [];

    const alive = this.enemies.filter(e => e.alive);
    const spacing = Math.min(120, (width * 0.7) / Math.max(alive.length, 1));
    const startX = width * 0.35;

    alive.forEach((enemy, i) => {
      const x = startX + i * spacing;
      const y = height * 0.6 - 10;

      const emoji = enemy.def.isBoss ? '👹' : this.getEnemyEmoji(enemy.def.id);
      const label = this.add.text(x, y, emoji, { fontSize: enemy.def.isBoss ? '52px' : '36px' }).setOrigin(0.5, 1);
      this.enemyLabels.push(label);

      const nameLabel = this.add.text(x, y + 4, enemy.def.name, { fontSize: '10px', color: '#e0e0e0' }).setOrigin(0.5, 0);
      this.enemyLabels.push(nameLabel);

      const hpBar = this.add.graphics();
      this.enemyHpBars.push(hpBar);
      this.drawEnemyHp(hpBar, enemy, x, y + 18);

      const g = this.add.graphics();
      this.enemyGraphics.push(g);
    });
  }

  private getEnemyEmoji(id: string): string {
    const map: Record<string, string> = {
      forest_slime: '🟢',
      wolf: '🐺',
      goblin: '👺',
      forest_troll: '👹',
      skeleton: '💀',
      cave_bat: '🦇',
      dark_knight: '🖤',
      stone_golem: '🗿',
    };
    return map[id] ?? '👾';
  }

  private drawEnemyHp(g: Phaser.GameObjects.Graphics, enemy: CombatEnemy, x: number, y: number) {
    const w = 70;
    const h = 7;
    const pct = enemy.currentHp / enemy.maxHp;
    g.clear();
    g.fillStyle(0x333333);
    g.fillRect(x - w / 2, y, w, h);
    g.fillStyle(enemy.def.isBoss ? 0xe05c5c : 0x5ce07a);
    g.fillRect(x - w / 2, y, Math.max(0, w * pct), h);
  }

  private drawPlayerHp() {
    const { width, height } = this.scale;
    const x = width * 0.15;
    const y = height * 0.6 + 16;
    const w = 90;
    const h = 8;
    const pct = this.player.hp / this.player.maxHp;
    this.playerHpBar.clear();
    this.playerHpBar.fillStyle(0x333333);
    this.playerHpBar.fillRect(x - w / 2, y, w, h);
    this.playerHpBar.fillStyle(0xe05c5c);
    this.playerHpBar.fillRect(x - w / 2, y, Math.max(0, w * pct), h);
    this.playerHpText.setText(`${this.player.hp}/${this.player.maxHp}`);
  }

  private drawPlayerResource() {
    const { width, height } = this.scale;
    const x = width * 0.15;
    const y = height * 0.6 + 38;
    const w = 90;
    const h = 6;
    const pct = this.player.resource / this.player.maxResource;
    this.playerResourceBar.clear();
    this.playerResourceBar.fillStyle(0x222244);
    this.playerResourceBar.fillRect(x - w / 2, y, w, h);
    this.playerResourceBar.fillStyle(0x4a90d9);
    this.playerResourceBar.fillRect(x - w / 2, y, Math.max(0, w * pct), h);
    this.playerResourceText.setText(`⚡${this.player.resource}/${this.player.maxResource}`);
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

      const cdText = this.add.text(x + 50, y + 26, `CD: ${skill.cooldown}t | ⚡${skill.resourceCost}`, { fontSize: '9px', color: '#888' }).setOrigin(0.5, 0);
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

      if (isBossStage) {
        bg.clear();
        bg.fillStyle(dim ? 0x111122 : 0x1a1a2e);
        bg.lineStyle(1, onCooldown ? 0x555555 : (noResource ? 0x222244 : 0x2a2a4a));
        bg.fillRoundedRect(x, y, 100, 54, 6);
      }

      if (onCooldown) {
        cdText.setText(`⏳${this.skillCooldowns[id]}t | ⚡${skill.resourceCost}`);
        cdText.setColor('#666666');
      } else {
        cdText.setText(`CD: ${skill.cooldown}t | ⚡${skill.resourceCost}`);
        cdText.setColor(noResource ? '#555577' : '#888888');
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

  private addLog(text: string, color: number = WHITE) {
    this.logEntries.push({ text, color });
    if (this.logEntries.length > 8) this.logEntries.shift();
    const combined = this.logEntries.map(e => e.text).join('\n');
    this.logText.setText(combined);
  }

  private spawnDamageText(x: number, y: number, text: string, color: string) {
    const dmgText = this.add.text(x, y - 20, text, {
      fontSize: '14px',
      color,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);
    this.tweens.add({
      targets: dmgText,
      y: y - 60,
      alpha: 0,
      duration: 700,
      ease: 'Power1',
      onComplete: () => dmgText.destroy(),
    });
  }

  private getEnemyScreenPosition(enemy: CombatEnemy): { x: number; y: number } {
    const { width, height } = this.scale;
    const alive = this.enemies.filter(e => e.alive);
    const idx = alive.indexOf(enemy);
    const spacing = Math.min(120, (width * 0.7) / Math.max(alive.length, 1));
    const startX = width * 0.35;
    return { x: startX + idx * spacing, y: height * 0.6 - 60 };
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
        // Damage text on player side
        const { width, height } = this.scale;
        this.spawnDamageText(width * 0.15, height * 0.6 - 20, `-${dmg}`, '#e05c5c');
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
    if (this.buffTicks > 0) parts.push(`🔥 Battle Cry (${this.buffTicks}t)`);
    if (this.defenseBuffTicks > 0) parts.push(`🛡️ Iron Skin (${this.defenseBuffTicks}t)`);
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
      this.addLog(`⚡ Battle Cry! ATK +${bonus} for ${this.buffTicks}t`, PURPLE);
      return;
    }

    if (skill.id === 'iron_skin') {
      const bonus = Math.floor(this.player.defense * 0.5);
      this.player.defense += bonus;
      this.defenseBuffBonus = bonus;
      this.defenseBuffTicks = skill.buffDuration ?? 5;
      this.updateBuffLabel();
      this.addLog(`🛡️ Iron Skin! DEF +${bonus} for ${this.defenseBuffTicks}t`, BLUE);
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
          const pos = this.getEnemyScreenPosition(target);
          this.spawnDamageText(pos.x, pos.y, isCrit ? `💥${dmg}` : `${dmg}`, isCrit ? '#ffd700' : '#ff8c00');
          this.addLog(`🌀 Whirlwind: ${dmg} on ${target.def.name}${isCrit ? ' CRIT!' : ''}`, ORANGE);
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
      // Execute bonus: 2x damage below 30% HP
      if (skill.id === 'execute' && target.currentHp / target.maxHp < 0.3) {
        dmg *= 2;
      }
      if (isCrit) dmg = Math.floor(dmg * 2);
      target.currentHp = Math.max(0, target.currentHp - dmg);
      const critStr = isCrit ? ' 💥CRIT!' : '';
      this.addLog(`${skill.name}: ${dmg} dmg on ${target.def.name}${critStr}`, isCrit ? GOLD : GREEN);

      const pos = this.getEnemyScreenPosition(target);
      this.spawnDamageText(pos.x, pos.y, isCrit ? `💥${dmg}` : `${dmg}`, isCrit ? '#ffd700' : '#ff8800');

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
    const critStr = isCrit ? ' 💥CRIT!' : '';
    this.addLog(`Auto-attack: ${dmg} dmg on ${target.def.name}${critStr}`, isCrit ? GOLD : WHITE);

    const pos = this.getEnemyScreenPosition(target);
    this.spawnDamageText(pos.x, pos.y, isCrit ? `💥${dmg}` : `${dmg}`, isCrit ? '#ffd700' : '#e0e0e0');

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
      this.bossPhaseLabel.setText(`⚠️ BOSS PHASE ${newPhase}!`);
      this.bossPhaseLabel.setColor(phaseColors[newPhase]);
      this.addLog(`⚠️ ${boss.def.name} enters Phase ${newPhase}!`, ORANGE);
      this.cameras.main.shake(300, 0.012);
      // Boost boss attack per phase transition
      boss.def = { ...boss.def, attack: Math.floor(boss.def.attack * 1.3) };
      this.addLog(`💀 ${boss.def.name} ATK increased!`, RED);
      // Flash orange
      this.cameras.main.flash(200, 255, 140, 0, false);
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
          this.addLog(`✨ ${itemDef.name} dropped!`, ORANGE);
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
          this.addLog(`📦 ${itemDef.name} dropped!`, BLUE);
        }
      }
    }
  }

  private updateEnemyHpBars() {
    const alive = this.enemies.filter(e => e.alive);
    const { width, height } = this.scale;
    const spacing = Math.min(120, (width * 0.7) / Math.max(alive.length, 1));
    const startX = width * 0.35;

    alive.forEach((enemy, i) => {
      const x = startX + i * spacing;
      const y = height * 0.6 + 12;
      const bar = this.enemyHpBars[i];
      if (bar) this.drawEnemyHp(bar, enemy, x, y);
    });
  }

  private endBattle(won: boolean) {
    if (this.battleEnded) return;
    this.battleEnded = true;
    this.tickTimer.remove(false);

    const { width, height } = this.scale;
    this.add.rectangle(0, 0, width, height, 0x000000, 0.7).setOrigin(0, 0);

    const resultText = won ? '⚔️ VICTORY!' : '💀 DEFEATED';
    const resultColor = won ? '#5ce07a' : '#e05c5c';

    this.add.text(width / 2, height / 2 - 60, resultText, {
      fontSize: '32px',
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
        fontSize: '16px',
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
