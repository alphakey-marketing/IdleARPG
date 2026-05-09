import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { BattleScene } from '../game/BattleScene';
import type { BattleResult } from '@idle-arpg/shared/src/types';

interface CombatPlayer {
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  attackSpeed: number;
  critChance: number;
  ticksUntilAttack: number;
}

interface Props {
  stageId: string;
  stageName: string;
  playerStats: CombatPlayer;
  skillOrder: string[];
  onComplete: (result: BattleResult & { stageName: string }) => void;
}

export default function PhaserBattle({ stageId, stageName, playerStats, skillOrder, onComplete }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: '#0a0a0f',
      parent: containerRef.current,
      scene: BattleScene,
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    game.events.once('ready', () => {
      game.scene.start('BattleScene', {
        stageId,
        stageName,
        playerStats,
        skillOrder,
        onComplete,
      });
    });

    return () => {
      game.destroy(true);
      gameRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: '100vw', height: '100vh', background: '#0a0a0f' }}
    />
  );
}
