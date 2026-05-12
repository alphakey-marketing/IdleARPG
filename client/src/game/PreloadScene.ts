import Phaser from 'phaser';
import {
  TINY_DUNGEON,
  CHAR_SPRITES,
  ENEMY_SPRITES,
  AUDIO_PATHS,
  PHASER_KEYS,
} from '../assetMap';
import type { BattleConfig } from './BattleScene';

/**
 * PreloadScene runs before BattleScene to load all required assets into the
 * Phaser cache.  It completes instantly (no UI shown) and then starts BattleScene
 * with the battle config data it received via scene.start().
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    // ── Tiny-dungeon character tiles ──────────────────────────────────────────
    for (const [classId, path] of Object.entries(CHAR_SPRITES)) {
      this.load.image(PHASER_KEYS.char(classId), path);
    }

    // ── Tiny-dungeon enemy tiles ──────────────────────────────────────────────
    for (const [enemyId, path] of Object.entries(ENEMY_SPRITES)) {
      this.load.image(PHASER_KEYS.enemy(enemyId), path);
    }

    // ── Floor / wall tiles ────────────────────────────────────────────────────
    this.load.image(PHASER_KEYS.floor, `${TINY_DUNGEON}/tile_0096.png`);
    this.load.image(PHASER_KEYS.wall,  `${TINY_DUNGEON}/tile_0097.png`);

    // ── Audio ─────────────────────────────────────────────────────────────────
    for (const [key, path] of Object.entries(AUDIO_PATHS)) {
      this.load.audio(key, path);
    }
  }

  create(data: BattleConfig) {
    // Pass battle config through to BattleScene
    this.scene.start('BattleScene', data);
  }
}
