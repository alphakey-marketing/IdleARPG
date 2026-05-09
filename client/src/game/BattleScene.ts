import Phaser from 'phaser';
import { ENEMIES, MAPS, ITEMS, SKILLS, COMMON_ITEM_IDS, BOSS_ITEM_IDS } from '@idle-arpg/shared/src/gameData';
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
}

interface SkillCooldowns {
  [skillId: string]: number;
}

interface BattleConfig {
  stageId: string;
  stageName: string;
  playerStats: CombatPlayer;
  skillOrder: string[];
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
  private logEntries: LogEntry[] = [];

  // UI objects
  private playerHpBar!: Phaser.GameObjects.Graphics;
  private playerHpText!: Phaser.GameObjects.Text;
  private enemyGraphics: Phaser.GameObjects.Graphics[] = [];
  private enemyHpBars: Phaser.GameObjects.Graphics[] = [];
  private enemyLabels: Phaser.GameObjects.Text[] = [];
  private logText!: Phaser.GameObjects.Text;
  private skillButtons: Phaser.GameObjects.Text[] = [];
  private tickTimer!: Phaser.Time.TimerEvent;
  private stageLabel!: Phaser.GameObjects.Text;
  private playerLabel!: Phaser.GameObjects.Text;
  private buffLabel!: Phaser.GameObjects.Text;

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

    // Buff label
    this.buffLabel = this.add.text(width * 0.15, height * 0.6 + 46, '', { fontSize: '10px', color: '#ffd700' }).setOrigin(0.5, 0);

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

  private drawSkillUI() {
    const { width, height } = this.scale;
    const skillIds = this.config.skillOrder;
    this.skillButtons.forEach(b => b.destroy());
    this.skillButtons = [];

    skillIds.forEach((id, i) => {
      const skill = SKILLS[id];
      if (!skill) return;
      const x = 12 + i * 110;
      const y = height - 60;
      const bg = this.add.graphics();
      bg.fillStyle(0x1a1a2e);
      bg.lineStyle(1, 0x2a2a4a);
      bg.fillRoundedRect(x, y, 100, 50, 6);
      const nameText = this.add.text(x + 50, y + 10, skill.name, { fontSize: '11px', color: '#d4a017', fontStyle: 'bold' }).setOrigin(0.5, 0);
      const cdText = this.add.text(x + 50, y + 28, `CD: ${skill.cooldown}t`, { fontSize: '10px', color: '#888' }).setOrigin(0.5, 0);
      this.skillButtons.push(nameText);
      this.skillButtons.push(cdText);
    });
  }

  private addLog(text: string, color: number = WHITE) {
    this.logEntries.push({ text, color });
    if (this.logEntries.length > 8) this.logEntries.shift();
    const combined = this.logEntries.map(e => e.text).join('\n');
    this.logText.setText(combined);
  }

  private doTick() {
    if (this.battleEnded) return;
    this.tick++;

    // Decrement skill cooldowns
    for (const id of Object.keys(this.skillCooldowns)) {
      if (this.skillCooldowns[id] > 0) this.skillCooldowns[id]--;
    }

    // Decrement buff
    if (this.buffTicks > 0) {
      this.buffTicks--;
      if (this.buffTicks === 0) {
        this.player.attack -= this.buffAttackBonus;
        this.buffAttackBonus = 0;
        this.buffLabel.setText('');
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
        // Flash red
        this.cameras.main.flash(100, 200, 0, 0, false);
      }
    });

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

  private useSkillOrAttack() {
    // Try skills in priority order
    for (const skillId of this.config.skillOrder) {
      const skill = SKILLS[skillId];
      if (!skill) continue;
      if (this.skillCooldowns[skillId] > 0) continue;

      if (skill.type === 'defensive') {
        // Battle Cry — buff self
        this.skillCooldowns[skillId] = skill.cooldown;
        const bonus = Math.floor(this.player.attack * 0.5);
        this.player.attack += bonus;
        this.buffAttackBonus = bonus;
        this.buffTicks = skill.buffDuration ?? 4;
        this.buffLabel.setText(`🔥 Battle Cry (${this.buffTicks}t)`);
        this.addLog(`⚡ Battle Cry! ATK +${bonus} for ${this.buffTicks}t`, PURPLE);
        return;
      }

      if (skill.damage > 0) {
        const target = this.pickTarget();
        if (!target) break;
        this.skillCooldowns[skillId] = skill.cooldown;
        const isCrit = Math.random() < this.player.critChance;
        let dmg = Math.max(1, this.player.attack + skill.damage - target.def.defense);
        if (isCrit) dmg *= 2;
        target.currentHp = Math.max(0, target.currentHp - dmg);
        const critStr = isCrit ? ' 💥CRIT!' : '';
        this.addLog(`${skill.name}: ${dmg} dmg on ${target.def.name}${critStr}`, isCrit ? GOLD : GREEN);

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
        } else {
          this.updateEnemyHpBars();
        }
        return;
      }
    }

    // Auto-attack if no skill used
    const target = this.pickTarget();
    if (!target) return;
    const isCrit = Math.random() < this.player.critChance;
    let dmg = Math.max(1, this.player.attack - target.def.defense);
    if (isCrit) dmg *= 2;
    target.currentHp = Math.max(0, target.currentHp - dmg);
    const critStr = isCrit ? ' 💥CRIT!' : '';
    this.addLog(`Auto-attack: ${dmg} dmg on ${target.def.name}${critStr}`, isCrit ? GOLD : GREEN);

    if (target.currentHp <= 0) {
      target.alive = false;
      this.xpGained += target.def.xpReward;
      this.goldGained += target.def.goldReward;
      this.monstersKilled++;
      this.addLog(`${target.def.name} defeated! +${target.def.xpReward}xp +${target.def.goldReward}g`, GOLD);
      this.rollItemDrop(target.def);
      this.drawEnemies();
    } else {
      this.updateEnemyHpBars();
    }
  }

  private pickTarget(): CombatEnemy | undefined {
    const alive = this.enemies.filter(e => e.alive);
    if (alive.length === 0) return undefined;
    // Boss-first targeting
    const boss = alive.find(e => e.def.isBoss);
    if (boss) return boss;
    // Lowest HP
    return alive.reduce((min, e) => e.currentHp < min.currentHp ? e : min, alive[0]);
  }

  private rollItemDrop(def: EnemyDef) {
    if (def.isBoss) {
      if (Math.random() < 0.8) {
        const id = BOSS_ITEM_IDS[Math.floor(Math.random() * BOSS_ITEM_IDS.length)];
        const itemDef = ITEMS[id];
        if (itemDef) {
          const drop: InventoryItem = { id: uuidv4(), itemDefId: id, rarity: itemDef.rarity };
          this.itemsDropped.push(drop);
          this.addLog(`✨ ${itemDef.name} dropped!`, ORANGE);
        }
      }
    } else {
      if (Math.random() < 0.2) {
        const id = COMMON_ITEM_IDS[Math.floor(Math.random() * COMMON_ITEM_IDS.length)];
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
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7).setOrigin(0, 0);

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
