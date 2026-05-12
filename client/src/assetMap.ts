// ─── Base paths ──────────────────────────────────────────────────────────────
export const TINY_DUNGEON = '/assets/kenney_tiny-dungeon/Tiles';
export const GAME_ICONS   = '/assets/kenney_game-icons/PNG/White/2x';
export const UI_ADV       = '/assets/kenney_ui-pack-adventure';
export const UI_RPG       = '/assets/kenney_ui-pack-rpg-expansion';
export const FONTS_DIR    = '/assets/kenney_kenney-fonts/Fonts';
export const AUDIO_DIR    = '/assets/kenney_digital-audio/Audio';

// ─── Helper ───────────────────────────────────────────────────────────────────
const td = (n: number) => `${TINY_DUNGEON}/tile_${String(n).padStart(4, '0')}.png`;

// ─── Character sprites (Kenney Tiny Dungeon row 0) ────────────────────────────
// Row 0: tiles 0-15 are hero characters
export const CHAR_SPRITES: Record<string, string> = {
  warrior:  td(1),
  mage:     td(2),
  rogue:    td(3),
  paladin:  td(0),
};

// ─── Enemy sprites (Kenney Tiny Dungeon row 2-3) ──────────────────────────────
// Row 2 (32-47): humanoid enemies; Row 3 (48-63): creature enemies
export const ENEMY_SPRITES: Record<string, string> = {
  forest_slime:   td(18),
  wolf:           td(34),
  goblin:         td(32),
  forest_troll:   td(36),
  skeleton:       td(33),
  cave_bat:       td(50),
  dark_knight:    td(35),
  stone_golem:    td(38),
  forest_spider:  td(51),
  forest_shaman:  td(37),
  cave_troll:     td(39),
  dark_mage:      td(40),
};

// ─── Item sprites (Kenney Tiny Dungeon rows 4-5) ──────────────────────────────
// Row 4 (64-79): weapons/armour items; Row 5 (80-95): more items
export const ITEM_SPRITES: Record<string, string> = {
  iron_sword:         td(64),
  trollbane_sword:    td(65),
  bone_dagger:        td(66),
  soul_reaper:        td(67),
  leather_helmet:     td(68),
  skeleton_helm:      td(69),
  shadow_helm:        td(70),
  chainmail:          td(71),
  dark_plate:         td(72),
  troll_hide_armor:   td(73),
  iron_gauntlets:     td(74),
  golem_gauntlets:    td(75),
  battle_gauntlets:   td(76),
  leather_boots:      td(77),
  stone_boots:        td(78),
  copper_ring:        td(79),
  cave_crystal_ring:  td(80),
  battle_ring:        td(81),
  warrior_ring:       td(82),
  silver_necklace:    td(83),
  golem_core_amulet:  td(84),
  amulet_of_power:    td(85),
  warrior_belt:       td(86),
};

// Fallback: generic slot icons when a specific sprite isn't mapped
export const SLOT_SPRITES: Record<string, string> = {
  weapon:   td(64),
  helmet:   td(68),
  armor:    td(71),
  gloves:   td(74),
  legs:     td(77),
  ring:     td(79),
  necklace: td(83),
};

// ─── Floor / environment tiles ────────────────────────────────────────────────
export const FLOOR_TILE   = td(96);   // stone floor
export const WALL_TILE    = td(97);   // stone wall
export const MINE_TILE    = td(112);  // mine entrance

// ─── Skill icons (use available kenney_game-icons) ────────────────────────────
export const SKILL_ICONS: Record<string, string> = {
  slash:       `${GAME_ICONS}/target.png`,
  shield_bash: `${GAME_ICONS}/return.png`,
  battle_cry:  `${GAME_ICONS}/star.png`,
  whirlwind:   `${GAME_ICONS}/barsVertical.png`,
  iron_skin:   `${GAME_ICONS}/locked.png`,
  execute:     `${GAME_ICONS}/cross.png`,
  cleave:      `${GAME_ICONS}/left.png`,
};

// ─── Nav / HUD icons ─────────────────────────────────────────────────────────
export const NAV_ICONS: Record<string, string> = {
  battle:    `${GAME_ICONS}/target.png`,
  inventory: `${GAME_ICONS}/shoppingCart.png`,
  skills:    `${GAME_ICONS}/star.png`,
  idle:      `${GAME_ICONS}/wrench.png`,
  missions:  `${GAME_ICONS}/checkmark.png`,
  season:    `${GAME_ICONS}/trophy.png`,
};

// ─── Coin sprite ─────────────────────────────────────────────────────────────
export const COIN_SPRITE = td(95);

// ─── Lock icon ───────────────────────────────────────────────────────────────
export const LOCK_ICON = `${GAME_ICONS}/locked.png`;

// ─── Audio keys & paths ───────────────────────────────────────────────────────
export const AUDIO_KEYS = {
  hit:     'sfx_hit',
  crit:    'sfx_crit',
  loot:    'sfx_loot',
  levelup: 'sfx_levelup',
  victory: 'sfx_victory',
  defeat:  'sfx_defeat',
} as const;

export type AudioKey = typeof AUDIO_KEYS[keyof typeof AUDIO_KEYS];

export const AUDIO_PATHS: Record<string, string> = {
  sfx_hit:     `${AUDIO_DIR}/laser1.ogg`,
  sfx_crit:    `${AUDIO_DIR}/powerUp4.ogg`,
  sfx_loot:    `${AUDIO_DIR}/pepSound1.ogg`,
  sfx_levelup: `${AUDIO_DIR}/powerUp12.ogg`,
  sfx_victory: `${AUDIO_DIR}/threeTone1.ogg`,
  sfx_defeat:  `${AUDIO_DIR}/lowDown.ogg`,
};

// ─── Phaser asset keys (used in BattleScene image.load calls) ─────────────────
export const PHASER_KEYS = {
  char: (classId: string) => `char_${classId}`,
  enemy: (enemyId: string) => `enemy_${enemyId}`,
  floor: 'floor_tile',
  wall:  'wall_tile',
} as const;
