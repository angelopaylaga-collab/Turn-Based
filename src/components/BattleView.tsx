/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Shield,
  Zap,
  Heart,
  Sword,
  ArrowLeft,
  Play,
  FastForward,
  Pause,
  BarChart3,
  X,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  Character,
  Enemy,
  StageInfo,
  FieldEffect,
  ElementType,
  FloatingText,
  BuffDebuff,
  SkillKit,
} from '../types/game';
import { ENEMY_WEAKNESS_MAP, createEnemyInstance } from '../data/enemies';
import { PhaseBuffOption, AnomalyBossModifier } from '../data/stages';
import { sounds } from '../utils/audio';

interface BattleViewProps {
  stage: StageInfo;
  party: Character[];
  onVictory: (rewards: { crystals: number; coins: number }, score?: number) => void;
  onDefeat: () => void;
  onRetreat: () => void;
  initialSpeed?: number;
  phaseBuff?: PhaseBuffOption;
  anomalyModifiers?: AnomalyBossModifier[];
}

const ELEMENT_HEX: Record<ElementType, string> = {
  Fire: '#f97316',
  Ice: '#38bdf8',
  Lightning: '#eab308',
  Wind: '#10b981',
  Earth: '#d97706',
  Water: '#3b82f6',
  Light: '#fde047',
  Shadow: '#a855f7',
};

const ELEMENT_EMOJI: Record<ElementType, string> = {
  Fire: '🔥',
  Ice: '❄️',
  Lightning: '⚡',
  Wind: '🍃',
  Earth: '🌍',
  Water: '💧',
  Light: '✨',
  Shadow: '🌑',
};

const ELEMENT_PROJECTILE_ICONS: Record<ElementType, string> = {
  Fire: '🔥',
  Ice: '❄️',
  Lightning: '⚡',
  Wind: '🌪️',
  Earth: '🪨',
  Water: '💧',
  Light: '✨',
  Shadow: '🔮',
};

interface ProjectileFlight {
  id: string;
  icon: string;
  color: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

interface SlashImpact {
  id: string;
  targetId: string;
  color: string;
}

interface AoEBlast {
  id: string;
  color: string;
  element: ElementType;
}

interface SupportEffect {
  id: string;
  targetId: string;
  type: 'heal' | 'shield' | 'buff';
}

export const BattleView: React.FC<BattleViewProps> = ({
  stage,
  party: initialParty,
  onVictory,
  onDefeat,
  onRetreat,
  initialSpeed = 1,
  phaseBuff,
  anomalyModifiers,
}) => {
  // Battle state
  const [party, setParty] = useState<Character[]>(() =>
    initialParty.map((c) => ({
      ...c,
      hp: c.maxHp,
      shield: c.techniqueName === 'Wall' ? 150 : c.techniqueName === 'Grounding' ? 200 : 0,
      energy: Math.min(c.maxEnergy, c.energy + (c.techniqueName === 'Pre-Party' ? 20 : 0)),
    }))
  );

  const [enemies, setEnemies] = useState<Enemy[]>(() =>
    stage.enemies.map((e) => {
      let inst = { ...e };
      if (anomalyModifiers) {
        const shieldMod = anomalyModifiers.find((m) => m.id === 'mod_shield' && !m.isDisabled);
        if (shieldMod) {
          inst.shield = Math.floor(inst.shield * 1.5);
          inst.maxShield = Math.floor(inst.maxShield * 1.5);
        }
      }
      return inst;
    })
  );

  // Honkai Star Rail: Shared Team Skill Points (0 to 5)
  const [skillPoints, setSkillPoints] = useState<number>(3);
  const maxSkillPoints = 5;

  const [activeUnitIndex, setActiveUnitIndex] = useState<number>(0);
  const [selectedTargetEnemyId, setSelectedTargetEnemyId] = useState<string | null>(null);
  const [selectedTargetAllyId, setSelectedTargetAllyId] = useState<string | null>(null);

  // Animations & Visual Effects State
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [animatingAttackerId, setAnimatingAttackerId] = useState<string | null>(null);
  const [hitTargetIds, setHitTargetIds] = useState<string[]>([]);
  const [activeProjectiles, setActiveProjectiles] = useState<ProjectileFlight[]>([]);
  const [activeSlashes, setActiveSlashes] = useState<SlashImpact[]>([]);
  const [activeAoEBlast, setActiveAoEBlast] = useState<AoEBlast | null>(null);
  const [activeSupportEffects, setActiveSupportEffects] = useState<SupportEffect[]>([]);
  const [ultimateCutIn, setUltimateCutIn] = useState<{ character: Character } | null>(null);
  const [isScreenShaking, setIsScreenShaking] = useState<boolean>(false);

  // Settings & Navigation
  const [battleSpeed, setBattleSpeed] = useState<number>(initialSpeed);
  const [isAutoBattle, setIsAutoBattle] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isBattleStatsOpen, setIsBattleStatsOpen] = useState<boolean>(false);

  const [cyclesRemaining, setCyclesRemaining] = useState<number>(stage.turnLimit || 12);
  const [pureOnslaughtScore, setPureOnslaughtScore] = useState<number>(0);
  const [bossGauge, setBossGauge] = useState<number>(0);

  const [activeField, setActiveField] = useState<FieldEffect | null>(null);
  const [isGameOver, setIsGameOver] = useState<'victory' | 'defeat' | null>(null);

  // Turn Order timeline queue
  const [turnQueue, setTurnQueue] = useState<{ id: string; isAlly: boolean; name: string; emoji: string }[]>([]);

  // Initialize selected targets
  useEffect(() => {
    const firstAliveEnemy = enemies.find((e) => e.hp > 0);
    if (firstAliveEnemy && !selectedTargetEnemyId) {
      setSelectedTargetEnemyId(firstAliveEnemy.id);
    }
    const firstAliveAlly = party.find((p) => p.hp > 0);
    if (firstAliveAlly && !selectedTargetAllyId) {
      setSelectedTargetAllyId(firstAliveAlly.id);
    }
  }, [enemies, party]);

  // Recalculate Turn Order
  const refreshTurnQueue = () => {
    const units: { id: string; isAlly: boolean; name: string; emoji: string; spd: number }[] = [];
    party.forEach((p) => {
      if (p.hp > 0) {
        units.push({ id: p.id, isAlly: true, name: p.name, emoji: p.emoji, spd: p.spd });
      }
    });
    enemies.forEach((e) => {
      if (e.hp > 0) {
        units.push({ id: e.id, isAlly: false, name: e.name, emoji: e.emoji, spd: e.spd });
      }
    });
    units.sort((a, b) => b.spd - a.spd);
    setTurnQueue(units.map(({ id, isAlly, name, emoji }) => ({ id, isAlly, name, emoji })));
  };

  useEffect(() => {
    refreshTurnQueue();
  }, []);

  const triggerScreenShake = () => {
    setIsScreenShaking(true);
    setTimeout(() => setIsScreenShaking(false), 450);
  };

  const addFloatingText = (
    text: string,
    x: number,
    y: number,
    color: string,
    options?: { isCrit?: boolean; isHeal?: boolean; isShield?: boolean; isBreak?: boolean }
  ) => {
    const id = Math.random().toString(36).substring(2, 8);
    setFloatingTexts((prev) => [...prev, { id, text, x, y, color, ...options }]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((item) => item.id !== id));
    }, 1200 / battleSpeed);
  };

  const currentUnit = turnQueue[activeUnitIndex] || turnQueue[0];
  const isPlayerTurn = currentUnit ? currentUnit.isAlly : true;
  const currentActingHero = isPlayerTurn ? party.find((p) => p.id === currentUnit?.id) : null;

  // Advance to next turn in queue
  const nextTurn = () => {
    setAnimatingAttackerId(null);
    setHitTargetIds([]);

    const livingEnemies = enemies.filter((e) => e.hp > 0);
    const livingAllies = party.filter((p) => p.hp > 0);

    if (livingEnemies.length === 0) {
      if (stage.mode === 'pure_onslaught' && cyclesRemaining > 1) {
        const respawned = [
          createEnemyInstance(enemies[0] || {}),
          createEnemyInstance(enemies[1] || enemies[0] || {}),
        ];
        setEnemies(respawned);
        setPureOnslaughtScore((s) => s + 5000);
        addFloatingText('+5000 WAVE CLEAR', 50, 40, '#fde047');
        sounds.playBreak();
        triggerScreenShake();
      } else {
        setIsGameOver('victory');
        sounds.playVictory();
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
        return;
      }
    }

    if (livingAllies.length === 0) {
      setIsGameOver('defeat');
      return;
    }

    setTurnQueue((prevQueue) => {
      const nextIndex = (activeUnitIndex + 1) % Math.max(1, prevQueue.length);
      setActiveUnitIndex(nextIndex);
      return prevQueue;
    });

    if (activeUnitIndex === 0) {
      setCyclesRemaining((c) => {
        const nextC = c - 1;
        if (nextC <= 0) {
          if (stage.mode === 'pure_onslaught') {
            setIsGameOver('victory');
            sounds.playVictory();
          } else {
            setIsGameOver('defeat');
          }
        }
        return Math.max(0, nextC);
      });
    }
  };

  // Automated enemy turn execution
  useEffect(() => {
    if (isGameOver || isPaused || !currentUnit) return;

    if (!currentUnit.isAlly) {
      const actingEnemy = enemies.find((e) => e.id === currentUnit.id);
      if (!actingEnemy || actingEnemy.hp <= 0) {
        nextTurn();
        return;
      }

      const isFrozen = actingEnemy.activeBuffs.some((b) => b.stat === 'freeze' && b.duration > 0);
      if (isFrozen) {
        addFloatingText('FROZEN!', 50, 30, '#38bdf8');
        actingEnemy.activeBuffs = actingEnemy.activeBuffs
          .map((b) => (b.stat === 'freeze' ? { ...b, duration: b.duration - 1 } : b))
          .filter((b) => b.duration > 0);
        setTimeout(nextTurn, 800 / battleSpeed);
        return;
      }

      const timer = setTimeout(() => {
        executeEnemyAction(actingEnemy);
      }, 700 / battleSpeed);
      return () => clearTimeout(timer);
    } else if (isAutoBattle && isPlayerTurn && currentActingHero) {
      const timer = setTimeout(() => {
        if (currentActingHero.energy >= currentActingHero.maxEnergy) {
          handleExecuteHeroAction('ultimate');
        } else if (skillPoints > 0) {
          handleExecuteHeroAction('skill');
        } else {
          handleExecuteHeroAction('basic');
        }
      }, 600 / battleSpeed);
      return () => clearTimeout(timer);
    }
  }, [activeUnitIndex, currentUnit, isAutoBattle, isGameOver, isPaused, skillPoints]);

  // Execute Enemy action
  const executeEnemyAction = (enemy: Enemy) => {
    const livingAllies = party.filter((p) => p.hp > 0);
    if (livingAllies.length === 0) return;

    const targetAlly = livingAllies[Math.floor(Math.random() * livingAllies.length)];
    const skill = enemy.skills[0] || {
      name: 'Bash',
      targetType: 'Single',
      damageMultiplier: 1.0,
      toughnessDamage: 15,
      animationType: 'Melee',
    };

    setAnimatingAttackerId(enemy.id);
    sounds.playBasicAttack(enemy.element, skill.animationType === 'Melee');

    if (skill.animationType === 'Melee') {
      setTimeout(() => {
        setHitTargetIds([targetAlly.id]);
        triggerScreenShake();
        const slashId = Math.random().toString();
        setActiveSlashes((prev) => [...prev, { id: slashId, targetId: targetAlly.id, color: ELEMENT_HEX[enemy.element] }]);
        setTimeout(() => setActiveSlashes((prev) => prev.filter((s) => s.id !== slashId)), 400);

        const rawDmg = Math.floor(enemy.atk * (skill.damageMultiplier || 1.1));
        applyDamageToHero(targetAlly.id, rawDmg, enemy.element);

        setTimeout(() => {
          setHitTargetIds([]);
          nextTurn();
        }, 500 / battleSpeed);
      }, 350 / battleSpeed);
    } else {
      const projId = Math.random().toString();
      setActiveProjectiles((prev) => [
        ...prev,
        {
          id: projId,
          icon: ELEMENT_PROJECTILE_ICONS[enemy.element] || '⚡',
          color: ELEMENT_HEX[enemy.element],
          fromX: 50,
          fromY: 25,
          toX: 50,
          toY: 75,
        },
      ]);

      setTimeout(() => {
        setActiveProjectiles((prev) => prev.filter((p) => p.id !== projId));
        setHitTargetIds([targetAlly.id]);
        triggerScreenShake();

        const rawDmg = Math.floor(enemy.atk * (skill.damageMultiplier || 1.1));
        applyDamageToHero(targetAlly.id, rawDmg, enemy.element);

        setTimeout(() => {
          setHitTargetIds([]);
          nextTurn();
        }, 500 / battleSpeed);
      }, 400 / battleSpeed);
    }
  };

  // Apply damage to Hero (respecting shields)
  const applyDamageToHero = (heroId: string, damage: number, attackElement: ElementType) => {
    setParty((prev) =>
      prev.map((hero) => {
        if (hero.id !== heroId) return hero;

        let remainingDmg = damage;
        let newShield = hero.shield;
        let finalHp = hero.hp;

        if (newShield > 0) {
          const absorbed = Math.min(newShield, remainingDmg);
          newShield -= absorbed;
          remainingDmg -= absorbed;
          addFloatingText(`🛡️ -${absorbed}`, 40 + Math.random() * 20, 65, '#94a3b8', { isShield: true });
          sounds.playShield();
        }

        if (remainingDmg > 0) {
          finalHp = Math.max(0, finalHp - remainingDmg);
          addFloatingText(`-${remainingDmg}`, 40 + Math.random() * 20, 60, ELEMENT_HEX[attackElement]);
          sounds.playHeroHurt();
        }

        const energyGain = 12;
        const newEnergy = Math.min(hero.maxEnergy, hero.energy + energyGain);

        return {
          ...hero,
          hp: finalHp,
          shield: newShield,
          energy: newEnergy,
        };
      })
    );
  };

  // Auto-retarget to living units if selected target dies
  useEffect(() => {
    const currentEnemyTarget = enemies.find((e) => e.id === selectedTargetEnemyId && e.hp > 0);
    if (!currentEnemyTarget) {
      const nextAliveEnemy = enemies.find((e) => e.hp > 0);
      if (nextAliveEnemy) {
        setSelectedTargetEnemyId(nextAliveEnemy.id);
      }
    }

    const currentAllyTarget = party.find((p) => p.id === selectedTargetAllyId && p.hp > 0);
    if (!currentAllyTarget) {
      const nextAliveAlly = party.find((p) => p.hp > 0);
      if (nextAliveAlly) {
        setSelectedTargetAllyId(nextAliveAlly.id);
      }
    }
  }, [enemies, party, selectedTargetEnemyId, selectedTargetAllyId]);

  // When a support hero acts, intelligently default to the lowest HP ally if current target has full HP
  useEffect(() => {
    if (!currentActingHero || !isPlayerTurn) return;
    const isSupportHero =
      currentActingHero.skill.animationType === 'Heal' ||
      currentActingHero.skill.animationType === 'Shield' ||
      currentActingHero.skill.animationType === 'Buff' ||
      currentActingHero.skill.targetType === 'SingleAlly';

    if (isSupportHero) {
      const livingAllies = party.filter((p) => p.hp > 0);
      if (livingAllies.length > 0) {
        const lowestHpAlly = [...livingAllies].sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
        const currentTarget = party.find((p) => p.id === selectedTargetAllyId && p.hp > 0);
        if (lowestHpAlly && (!currentTarget || currentTarget.hp >= currentTarget.maxHp)) {
          setSelectedTargetAllyId(lowestHpAlly.id);
        }
      }
    }
  }, [activeUnitIndex, isPlayerTurn]);

  // Execute Hero Action (Basic ATK, Skill, or Ultimate)
  const handleExecuteHeroAction = (actionType: 'basic' | 'skill' | 'ultimate', casterOverride?: Character) => {
    const caster = casterOverride || currentActingHero;
    if (!caster || isGameOver || isPaused) return;

    let skillKit: SkillKit = caster.basicAtk;
    let energyChange = 20;

    if (actionType === 'skill') {
      if (skillPoints < 1) {
        addFloatingText('NO SKILL POINTS!', 75, 75, '#ef4444');
        return;
      }
      setSkillPoints((sp) => Math.max(0, sp - 1));
      skillKit = caster.skill;
      energyChange = 30;
      sounds.playSkill(caster.element, skillKit.animationType);
    } else if (actionType === 'ultimate') {
      if (caster.energy < caster.maxEnergy) return;
      skillKit = caster.ultimate;
      energyChange = -caster.maxEnergy;

      // Trigger Cinematic Ultimate Cut-In Banner
      setUltimateCutIn({ character: caster });
      sounds.playUltimate(caster.element);
      triggerScreenShake();

      setTimeout(() => {
        setUltimateCutIn(null);
        performHeroExecution(skillKit, caster, actionType, energyChange);
      }, 850);
      return;
    } else {
      // Basic Attack generates +1 Skill Point!
      setSkillPoints((sp) => Math.min(maxSkillPoints, sp + 1));
      sounds.playBasicAttack(caster.element, skillKit.animationType === 'Melee');
    }

    performHeroExecution(skillKit, caster, actionType, energyChange);
  };

  const performHeroExecution = (
    skillKit: SkillKit,
    caster: Character,
    actionType: 'basic' | 'skill' | 'ultimate',
    energyChange: number
  ) => {
    setAnimatingAttackerId(caster.id);

    if (
      skillKit.targetType === 'SingleAlly' ||
      skillKit.targetType === 'AllAllies' ||
      skillKit.animationType === 'Heal' ||
      skillKit.animationType === 'Shield' ||
      skillKit.animationType === 'Buff'
    ) {
      executeFriendlyAction(skillKit, caster);
    } else {
      executeOffensiveAction(skillKit, caster);
    }

    setParty((prev) =>
      prev.map((h) => {
        if (h.id !== caster.id) return h;
        const finalEnergy = actionType === 'ultimate' ? 0 : Math.min(h.maxEnergy, h.energy + energyChange);
        return { ...h, energy: finalEnergy };
      })
    );
  };

  // Friendly actions (Heal, Shield, Buff targeting selected ally)
  const executeFriendlyAction = (skillKit: SkillKit, caster: Character) => {
    const isAll = skillKit.targetType === 'AllAllies' || skillKit.targetType === 'All';
    const chosenAlly = party.find((p) => p.id === selectedTargetAllyId && p.hp > 0) ||
      party.find((p) => p.id === caster.id && p.hp > 0) ||
      party.find((p) => p.hp > 0);

    const targetIds = isAll ? party.filter((p) => p.hp > 0).map((p) => p.id) : (chosenAlly ? [chosenAlly.id] : []);

    const supType = skillKit.animationType === 'Heal' ? 'heal' : skillKit.animationType === 'Shield' ? 'shield' : 'buff';
    targetIds.forEach((tId) => {
      const supId = Math.random().toString();
      setActiveSupportEffects((prev) => [...prev, { id: supId, targetId: tId, type: supType }]);
      setTimeout(() => setActiveSupportEffects((prev) => prev.filter((s) => s.id !== supId)), 800);
    });

    setParty((prev) =>
      prev.map((hero, idx) => {
        if (!targetIds.includes(hero.id)) return hero;

        let newHp = hero.hp;
        let newShield = hero.shield;
        const posX = 16 + idx * 24;

        if (skillKit.animationType === 'Heal') {
          const healAmount = Math.floor(caster.atk * 1.6);
          newHp = Math.min(hero.maxHp, hero.hp + healAmount);
          addFloatingText(`+${healAmount} HP`, posX, 70, '#22c55e', { isHeal: true });
        } else if (skillKit.animationType === 'Shield') {
          const shieldAmount = Math.floor(caster.def * 1.8);
          newShield = newShield + shieldAmount;
          addFloatingText(`🛡️ +${shieldAmount}`, posX, 70, '#38bdf8', { isShield: true });
        } else if (skillKit.animationType === 'Buff') {
          addFloatingText('✨ BUFFED!', posX, 70, '#fde047');
        }

        return { ...hero, hp: newHp, shield: newShield };
      })
    );

    setTimeout(nextTurn, 650 / battleSpeed);
  };

  // Offensive action targeting selected enemy
  const executeOffensiveAction = (skillKit: SkillKit, caster: Character) => {
    const isAll = skillKit.targetType === 'All';
    const targetedEnemy = enemies.find((e) => e.id === selectedTargetEnemyId && e.hp > 0) || enemies.find((e) => e.hp > 0);
    const targets = isAll
      ? enemies.filter((e) => e.hp > 0)
      : (targetedEnemy ? [targetedEnemy] : []);

    if (targets.length === 0) {
      setTimeout(nextTurn, 300);
      return;
    }

    if (isAll || skillKit.animationType === 'AoE') {
      const aoeId = Math.random().toString();
      setActiveAoEBlast({ id: aoeId, color: ELEMENT_HEX[caster.element], element: caster.element });
      setTimeout(() => setActiveAoEBlast(null), 650);

      setTimeout(() => {
        setHitTargetIds(targets.map((t) => t.id));
        triggerScreenShake();
        applyHitsToTargets(targets, skillKit, caster);
        setTimeout(() => {
          setHitTargetIds([]);
          nextTurn();
        }, 550 / battleSpeed);
      }, 350 / battleSpeed);
    } else if (skillKit.animationType === 'Melee') {
      setTimeout(() => {
        setHitTargetIds(targets.map((t) => t.id));
        triggerScreenShake();

        targets.forEach((t) => {
          const slashId = Math.random().toString();
          setActiveSlashes((prev) => [...prev, { id: slashId, targetId: t.id, color: ELEMENT_HEX[caster.element] }]);
          setTimeout(() => setActiveSlashes((prev) => prev.filter((s) => s.id !== slashId)), 400);
        });

        applyHitsToTargets(targets, skillKit, caster);
        setTimeout(() => {
          setHitTargetIds([]);
          nextTurn();
        }, 500 / battleSpeed);
      }, 350 / battleSpeed);
    } else {
      const projId = Math.random().toString();
      setActiveProjectiles((prev) => [
        ...prev,
        {
          id: projId,
          icon: ELEMENT_PROJECTILE_ICONS[caster.element] || '⚡',
          color: ELEMENT_HEX[caster.element],
          fromX: 50,
          fromY: 75,
          toX: 50,
          toY: 25,
        },
      ]);

      setTimeout(() => {
        setActiveProjectiles((prev) => prev.filter((p) => p.id !== projId));
        setHitTargetIds(targets.map((t) => t.id));
        triggerScreenShake();

        targets.forEach((t) => {
          const slashId = Math.random().toString();
          setActiveSlashes((prev) => [...prev, { id: slashId, targetId: t.id, color: ELEMENT_HEX[caster.element] }]);
          setTimeout(() => setActiveSlashes((prev) => prev.filter((s) => s.id !== slashId)), 400);
        });

        applyHitsToTargets(targets, skillKit, caster);
        setTimeout(() => {
          setHitTargetIds([]);
          nextTurn();
        }, 500 / battleSpeed);
      }, 400 / battleSpeed);
    }
  };

  const applyHitsToTargets = (targets: Enemy[], skillKit: SkillKit, caster: Character) => {
    targets.forEach((target) => {
      const isCrit = Math.random() < caster.critRate;
      if (isCrit) sounds.playCrit();

      let baseDamage = Math.floor(caster.atk * skillKit.multiplier * (isCrit ? caster.critDmg : 1.0));
      let toughnessDmg = skillKit.toughnessDamage;

      const counterElement = ENEMY_WEAKNESS_MAP[target.element];
      const isWeaknessCounter = counterElement === caster.element;
      if (isWeaknessCounter) {
        toughnessDmg = Math.floor(toughnessDmg * 1.5);
        baseDamage = Math.floor(baseDamage * 1.25);
      }

      if (target.isBroken) {
        baseDamage = Math.floor(baseDamage * 1.4);
      }
      if (target.isShieldBroken) {
        baseDamage = Math.floor(baseDamage * 1.35);
      }

      applyDamageToEnemy(target.id, baseDamage, toughnessDmg, caster.element, isCrit);
    });

    if (stage.mode === 'pure_onslaught') {
      setPureOnslaughtScore((s) => s + 850);
      setBossGauge((g) => Math.min(100, g + 8));
    }
  };

  // Apply damage, toughness break, and elemental shield break to enemy
  const applyDamageToEnemy = (
    enemyId: string,
    damage: number,
    toughnessDmg: number,
    attackElement: ElementType,
    isCrit: boolean
  ) => {
    setEnemies((prev) =>
      prev.map((enemy) => {
        if (enemy.id !== enemyId) return enemy;

        let remainingDmg = damage;
        let newShield = enemy.shield;
        let isShieldBroken = enemy.isShieldBroken;
        let newToughness = enemy.toughness;
        let isBroken = enemy.isBroken;
        let finalHp = enemy.hp;

        // 1. Elemental Shield Absorption
        if (newShield > 0) {
          const counterElement = enemy.shieldElement ? ENEMY_WEAKNESS_MAP[enemy.shieldElement] : null;
          const shieldHit = attackElement === counterElement ? remainingDmg * 2 : remainingDmg;
          const absorbed = Math.min(newShield, shieldHit);
          newShield -= absorbed;
          remainingDmg = Math.max(0, remainingDmg - absorbed / (attackElement === counterElement ? 2 : 1));

          addFloatingText(`🛡️ -${absorbed}`, 35 + Math.random() * 30, 25, '#e2e8f0', { isShield: true });
          sounds.playShield();

          if (newShield <= 0 && !isShieldBroken) {
            isShieldBroken = true;
            addFloatingText('SHIELD BROKEN!', 35, 20, '#ffffff', { isBreak: true });
            sounds.playBreak();
            triggerScreenShake();
          }
        }

        // 2. Toughness Break Calculation
        if (!isBroken && newToughness > 0) {
          newToughness = Math.max(0, newToughness - toughnessDmg);
          if (newToughness === 0) {
            isBroken = true;
            addFloatingText('💥 BREAK!', 50, 18, '#f97316', { isBreak: true });
            sounds.playBreak();
            triggerScreenShake();
          }
        }

        // 3. HP damage
        if (remainingDmg > 0) {
          finalHp = Math.max(0, finalHp - remainingDmg);
          addFloatingText(
            `${isCrit ? 'CRIT ' : ''}-${remainingDmg}`,
            35 + Math.random() * 30,
            25,
            ELEMENT_HEX[attackElement],
            { isCrit }
          );
          sounds.playEnemyHurt();
        }

        // Phase 2 check for Bosses
        let currentPhase = enemy.phase;
        if (enemy.type === 'Boss' && currentPhase === 1 && finalHp <= enemy.maxHp * 0.5) {
          currentPhase = 2;
          addFloatingText('PHASE 2 TRIGGERED!', 50, 15, '#ef4444', { isBreak: true });
          sounds.playBreak();
          triggerScreenShake();
          if (enemy.name.includes('Ignidra')) {
            setActiveField({
              name: 'Scorched Earth',
              element: 'Fire',
              duration: 3,
              description: 'All Fire DMG +20%; party takes minor Fire DMG each turn.',
              boostMultiplier: 1.2,
            });
          } else if (enemy.name.includes('Hydriss')) {
            setActiveField({
              name: 'Whirlpool Cataclysm',
              element: 'Water',
              duration: 3,
              description: 'Party SPD -15%; Water DMG +25%.',
              boostMultiplier: 1.25,
            });
          }
        }

        return {
          ...enemy,
          hp: finalHp,
          shield: newShield,
          isShieldBroken,
          toughness: newToughness,
          isBroken,
          phase: currentPhase,
        };
      })
    );
  };

  // Immediate interrupt Ultimate button click (Above Portrait)
  const handleImmediateUltimate = (hero: Character) => {
    if (hero.energy < hero.maxEnergy || isGameOver || isPaused) return;
    handleExecuteHeroAction('ultimate', hero);
  };

  const targetEnemy = enemies.find((e) => e.id === selectedTargetEnemyId && e.hp > 0) || enemies.find((e) => e.hp > 0);
  const targetAlly = party.find((p) => p.id === selectedTargetAllyId && p.hp > 0) || party.find((p) => p.hp > 0);

  return (
    <div
      className={`relative w-full h-screen overflow-hidden flex flex-col justify-between bg-slate-950 select-none ${
        isScreenShaking ? 'animate-screenshake' : ''
      }`}
    >
      {/* Dynamic Arena Field Background */}
      <div
        className={`absolute inset-0 transition-all duration-700 pointer-events-none ${
          activeField?.element === 'Fire'
            ? 'bg-gradient-to-b from-orange-950/70 via-slate-950 to-red-950/50'
            : activeField?.element === 'Water'
            ? 'bg-gradient-to-b from-blue-950/70 via-slate-950 to-indigo-950/50'
            : activeField?.element === 'Lightning'
            ? 'bg-gradient-to-b from-yellow-950/60 via-slate-950 to-purple-950/50'
            : activeField?.element === 'Wind'
            ? 'bg-gradient-to-b from-emerald-950/60 via-slate-950 to-teal-950/50'
            : 'bg-gradient-to-b from-indigo-950/50 via-slate-950 to-slate-900'
        }`}
      >
        <div
          className="absolute inset-x-0 bottom-0 h-1/2 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* CINEMATIC ULTIMATE CUT-IN OVERLAY */}
      {ultimateCutIn && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-black/75 backdrop-blur-sm animate-ultimate-cut-in">
          <div className="relative w-full max-w-xl py-6 px-4 bg-gradient-to-r from-transparent via-slate-900/95 to-transparent border-y-2 border-amber-400 flex items-center justify-center gap-5 shadow-2xl">
            <div className="text-7xl filter drop-shadow-[0_0_25px_rgba(250,204,21,0.9)] animate-bounce">
              {ultimateCutIn.character.emoji}
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-black tracking-widest text-amber-400 uppercase">
                {ultimateCutIn.character.path} • {ultimateCutIn.character.element}
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {ultimateCutIn.character.ultimate.name}
              </div>
              <div className="text-xs text-slate-300 max-w-xs">
                {ultimateCutIn.character.ultimate.description}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FLYING PROJECTILES & AOE LAYER */}
      <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
        {activeProjectiles.map((proj) => (
          <div
            key={proj.id}
            className="absolute text-5xl transition-all duration-300 ease-linear transform -translate-x-1/2 -translate-y-1/2 filter drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]"
            style={{
              left: `${proj.toX}%`,
              top: `${proj.toY}%`,
              transition: `all ${400 / battleSpeed}ms cubic-bezier(0.2, 0.8, 0.2, 1)`,
            }}
          >
            {proj.icon}
          </div>
        ))}

        {activeAoEBlast && (
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border-4 animate-aoe-shockwave pointer-events-none"
            style={{
              borderColor: activeAoEBlast.color,
              boxShadow: `0 0 50px ${activeAoEBlast.color}`,
              background: `radial-gradient(circle, ${activeAoEBlast.color}40 0%, transparent 70%)`,
            }}
          />
        )}
      </div>

      {/* FLOATING DAMAGE TEXTS */}
      <div className="absolute inset-0 pointer-events-none z-30">
        {floatingTexts.map((ft) => (
          <div
            key={ft.id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 font-black transition-all animate-floatUp ${
              ft.isCrit ? 'text-2xl sm:text-3xl font-extrabold drop-shadow-[0_4px_12px_rgba(255,255,255,0.8)]' : ''
            } ${ft.isBreak ? 'text-2xl sm:text-3xl text-amber-400 font-black tracking-wider' : 'text-lg sm:text-xl'}`}
            style={{
              left: `${ft.x}%`,
              top: `${ft.y}%`,
              color: ft.color,
              textShadow: '0 2px 8px rgba(0,0,0,0.9)',
            }}
          >
            {ft.text}
          </div>
        ))}
      </div>

      {/* TOP CONTROLS BAR (Speed, Auto, Pause, Wave/Cycles per Sketch) */}
      <div className="relative z-20 w-full bg-slate-950/80 backdrop-blur-md border-b border-indigo-950/80 px-3 py-2 flex items-center justify-between">
        {/* Stage / Wave Information */}
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-lg bg-indigo-950/80 border border-indigo-500/40 text-xs font-bold text-white flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="truncate max-w-[120px] sm:max-w-none">{stage.name}</span>
          </div>

          {stage.mode === 'pure_onslaught' ? (
            <div className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800 text-[10px] text-amber-300 font-mono font-bold">
              PTS: {pureOnslaughtScore.toLocaleString()}
            </div>
          ) : (
            <div className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800 text-[10px] text-cyan-300 font-mono font-bold">
              Cycle: {cyclesRemaining}
            </div>
          )}
        </div>

        {/* Top Right Controls [Speed] [Auto] [Pause] [Stats] (Directly from User Sketch) */}
        <div className="flex items-center gap-1.5 text-xs">
          {/* Battle Stats */}
          <button
            onClick={() => {
              sounds.playClick();
              setIsBattleStatsOpen(true);
            }}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition"
            title="Battle Stats & Weaknesses"
          >
            <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
          </button>

          {/* Speed Toggle (1x / 2x) */}
          <button
            onClick={() => {
              sounds.playClick();
              setBattleSpeed((s) => (s === 1 ? 2 : 1));
            }}
            className={`px-2.5 py-1 rounded-lg font-black transition flex items-center gap-0.5 ${
              battleSpeed === 2 ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 border border-slate-800 text-slate-300'
            }`}
          >
            <FastForward className="w-3 h-3" />
            <span>{battleSpeed}x</span>
          </button>

          {/* Auto Battle Toggle ⚡ */}
          <button
            onClick={() => {
              sounds.playClick();
              setIsAutoBattle((a) => !a);
            }}
            className={`px-2.5 py-1 rounded-lg font-black transition flex items-center gap-1 ${
              isAutoBattle ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-slate-900 border border-slate-800 text-slate-400'
            }`}
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Auto</span>
          </button>

          {/* Pause / Menu */}
          <button
            onClick={() => {
              sounds.playClick();
              setIsPaused(true);
            }}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition"
            title="Pause & Retreat"
          >
            <Pause className="w-3.5 h-3.5 text-slate-300" />
          </button>
        </div>
      </div>

      {/* MAIN BATTLEFIELD BODY (Strictly Non-Scrollable, Symmetrical Portrait Structure) */}
      <div className="relative z-10 flex-1 min-h-0 flex overflow-hidden">
        {/* LEFT COLUMN: Vertical Turn Order Ladder (Top 5 visible units) */}
        <div className="w-12 sm:w-14 border-r border-indigo-950/80 bg-slate-950/60 flex flex-col items-center py-2 gap-1.5 overflow-hidden shrink-0 select-none">
          <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest rotate-[-90deg] h-8 flex items-center justify-center">
            TURN
          </div>
          {turnQueue.slice(0, 6).map((unit, idx) => {
            const isCurrent = idx === activeUnitIndex;
            return (
              <div
                key={`${unit.id}_${idx}`}
                className={`relative w-9 h-10 sm:w-10 sm:h-11 rounded-lg flex flex-col items-center justify-center transition-all ${
                  isCurrent
                    ? 'bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950 ring-2 ring-white shadow-lg shadow-amber-500/40 scale-105 z-10'
                    : unit.isAlly
                    ? 'bg-indigo-950/80 border border-indigo-500/40 text-white'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-400 opacity-60'
                }`}
              >
                <span className="text-base sm:text-lg leading-none">{unit.emoji}</span>
                <span className="text-[7px] font-bold truncate max-w-[32px] leading-tight mt-0.5">
                  {unit.name}
                </span>
                {isCurrent && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-white animate-ping" />
                )}
              </div>
            );
          })}
        </div>

        {/* CENTER ARENA: Upper Enemy Position + Arena Field */}
        <div className="flex-1 min-h-0 flex flex-col justify-center items-center p-2 overflow-hidden relative">
          {/* Active Field Notification if any */}
          {activeField && (
            <div className="mb-2 px-3 py-0.5 rounded-full bg-slate-900/90 border border-indigo-500/40 text-[10px] text-indigo-300 flex items-center gap-1.5 shadow animate-pulse shrink-0">
              <span>🌍</span>
              <span>
                Field: <strong>{activeField.name}</strong> ({activeField.element} Boost)
              </span>
            </div>
          )}

          {/* ENEMY CARDS CONTAINER - EXACT SAME PROPORTIONS AS TEAM CARDS */}
          <div className="w-full max-w-2xl px-1">
            <div
              className={`grid gap-1.5 sm:gap-2 mx-auto justify-center ${
                enemies.length === 1
                  ? 'grid-cols-1 max-w-[140px] sm:max-w-[160px]'
                  : enemies.length === 2
                  ? 'grid-cols-2 max-w-sm'
                  : enemies.length === 3
                  ? 'grid-cols-3 max-w-xl'
                  : 'grid-cols-4 max-w-2xl'
              }`}
            >
              {enemies.map((enemy) => {
                const isAlive = enemy.hp > 0;
                const isSelected = selectedTargetEnemyId === enemy.id;
                const hpPercent = (enemy.hp / enemy.maxHp) * 100;
                const toughnessPercent = (enemy.toughness / enemy.maxToughness) * 100;
                const isAttacking = animatingAttackerId === enemy.id;
                const isHit = hitTargetIds.includes(enemy.id);
                const hasSlash = activeSlashes.some((s) => s.targetId === enemy.id);
                const weaknessCounter = ENEMY_WEAKNESS_MAP[enemy.element];

                if (!isAlive) {
                  return (
                    <div
                      key={enemy.id}
                      className="p-2 rounded-xl bg-slate-900/40 border border-slate-800/60 opacity-40 grayscale flex flex-col items-center justify-center text-center scale-95 h-28 sm:h-32"
                    >
                      <span className="text-xl">💀</span>
                      <span className="text-[9px] text-slate-500 line-through truncate w-full">{enemy.name}</span>
                    </div>
                  );
                }

                return (
                  <div key={enemy.id} className="relative flex flex-col items-center">
                    {/* Targeting Highlight & Floating Badge */}
                    {isSelected && (
                      <div className="absolute -top-6 px-2 py-0.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-[8px] tracking-wide flex items-center gap-0.5 shadow-lg shadow-red-500/50 animate-bounce z-30 ring-2 ring-white">
                        <span>🎯 TARGET</span>
                        <span className="text-[7px]">▼</span>
                      </div>
                    )}

                    {/* Enemy Card - EXACT SAME DIMENSIONS, BORDERS, AND PADDING AS TEAM CARDS */}
                    <div
                      onClick={() => {
                        sounds.playClick();
                        setSelectedTargetEnemyId(enemy.id);
                      }}
                      className={`w-full h-28 sm:h-32 p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between relative ${
                        isAttacking ? 'animate-melee-dash-down z-30' : ''
                      } ${isHit ? 'animate-hit-flinch z-20' : ''} ${
                        isSelected
                          ? 'ring-2 ring-red-500 border-red-500 shadow-md shadow-red-500/30 bg-red-950/20'
                          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* Slash strike overlay */}
                      {hasSlash && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40 animate-slash-strike">
                          <span className="text-4xl filter drop-shadow-[0_0_12px_rgba(255,255,255,0.9)]">
                            ⚔️
                          </span>
                        </div>
                      )}

                      {/* Header: Emoji on left, Name & Weakness on right */}
                      <div className="flex items-center justify-between">
                        <span className="text-xl sm:text-2xl">{enemy.emoji}</span>
                        <div className="text-right">
                          <div className="text-[10px] font-bold text-white truncate max-w-[55px] sm:max-w-[70px]">
                            {enemy.name}
                          </div>
                          <div className="text-[8px] flex items-center justify-end gap-1">
                            <span className="text-slate-400">Weak:</span>
                            <span className="text-xs" title={`Weak to ${weaknessCounter}`}>
                              {ELEMENT_EMOJI[weaknessCounter]}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Toughness & Shield & HP Bars */}
                      <div className="space-y-0.5">
                        {/* Toughness Bar ⛓️ */}
                        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800" title="Toughness">
                          <div
                            className={`h-full transition-all duration-300 ${
                              enemy.isBroken ? 'bg-orange-500' : 'bg-slate-300'
                            }`}
                            style={{ width: `${enemy.isBroken ? 0 : toughnessPercent}%` }}
                          />
                        </div>

                        {/* Shield Bar 🛡️ */}
                        {enemy.shield > 0 && (
                          <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden border border-cyan-500/40" title="Shield">
                            <div
                              className="h-full bg-cyan-400 transition-all duration-300"
                              style={{ width: `${Math.min(100, (enemy.shield / enemy.maxShield) * 100)}%` }}
                            />
                          </div>
                        )}

                        {/* HP Bar */}
                        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800" title="HP">
                          <div
                            className={`h-full transition-all duration-300 ${
                              hpPercent > 50 ? 'bg-emerald-500' : hpPercent > 25 ? 'bg-amber-400' : 'bg-red-500'
                            }`}
                            style={{ width: `${hpPercent}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[8px] font-mono text-slate-400">
                          <span>{enemy.isBroken ? '💥 BREAK' : 'HP'}</span>
                          <span>{enemy.hp}</span>
                        </div>
                      </div>

                      {/* Target Status Label */}
                      <div className="text-[7px] font-bold text-center mt-0.5">
                        {isSelected ? (
                          <span className="text-red-400 font-bold">🎯 Target Foe</span>
                        ) : (
                          <span className="text-slate-500">Tap to Target</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: Non-scrollable Team Cards + Action Controls */}
      <div className="relative z-20 w-full bg-slate-950/95 backdrop-blur-md border-t border-indigo-950/80 px-2 py-1.5 sm:py-2 shrink-0 select-none">
        {/* Active Turn & SP Status Bar */}
        <div className="max-w-2xl mx-auto w-full flex items-center justify-between text-[10px] font-bold pb-1 text-slate-300 border-b border-indigo-950/60 mb-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-indigo-400 shrink-0">Turn:</span>
            <span className="text-white font-extrabold flex items-center gap-1 truncate">
              {currentActingHero ? `${currentActingHero.emoji} ${currentActingHero.name}` : 'Waiting...'}
            </span>
          </div>

          {/* Contextual Target Indicator */}
          <div className="flex items-center gap-1.5 shrink-0 px-2">
            {(() => {
              const isSupportHero =
                currentActingHero?.skill.animationType === 'Heal' ||
                currentActingHero?.skill.animationType === 'Shield' ||
                currentActingHero?.skill.animationType === 'Buff' ||
                currentActingHero?.skill.targetType === 'SingleAlly';

              if (isSupportHero) {
                return (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span>💚 Ally:</span>
                    <strong className="text-white underline">{targetAlly?.name || 'None'}</strong>
                  </span>
                );
              }
              return (
                <span className="text-red-400 font-bold flex items-center gap-1">
                  <span>🎯 Foe:</span>
                  <strong className="text-white underline">{targetEnemy?.name || 'None'}</strong>
                </span>
              );
            })()}
          </div>

          {/* Skill Points Dots */}
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[8px] text-amber-400 font-bold mr-0.5">SP:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((idx) => {
                const isFilled = idx <= skillPoints;
                return (
                  <div
                    key={idx}
                    className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full border transition-all ${
                      isFilled
                        ? 'bg-amber-400 border-yellow-200 shadow-[0_0_6px_rgba(251,191,36,0.9)] scale-110'
                        : 'bg-slate-900 border-slate-700 opacity-40'
                    }`}
                  />
                );
              })}
            </div>
            <span className="text-[9px] font-mono font-bold text-amber-300 ml-0.5">
              {skillPoints}/{maxSkillPoints}
            </span>
          </div>
        </div>

        {/* 4 CHARACTER CARDS (Identical Size to Enemy Cards) */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 max-w-2xl mx-auto w-full">
          {party.map((hero) => {
            const isAlive = hero.hp > 0;
            const isCurrent = currentActingHero?.id === hero.id;
            const isSelectedAlly = selectedTargetAllyId === hero.id;
            const hpPercent = (hero.hp / hero.maxHp) * 100;
            const isUltReady = hero.energy >= hero.maxEnergy && isAlive;
            const isAttacking = animatingAttackerId === hero.id;
            const isHit = hitTargetIds.includes(hero.id);
            const supportEff = activeSupportEffects.find((s) => s.targetId === hero.id);

            if (!isAlive) {
              return (
                <div
                  key={hero.id}
                  className="p-2 rounded-xl bg-slate-900/40 border border-slate-800/60 opacity-40 grayscale flex flex-col items-center justify-center text-center scale-95 h-28 sm:h-32"
                >
                  <span className="text-xl">🪦</span>
                  <span className="text-[9px] text-slate-500 truncate w-full">{hero.name}</span>
                </div>
              );
            }

            return (
              <div key={hero.id} className="relative flex flex-col items-center">
                {/* Ally Target Indicator Badge */}
                {isSelectedAlly && (
                  <div className="absolute -top-6 px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-[8px] tracking-wide flex items-center gap-0.5 shadow-lg shadow-emerald-500/50 animate-bounce z-30 ring-2 ring-emerald-200">
                    <span>💚 TARGET</span>
                    <span className="text-[7px]">▼</span>
                  </div>
                )}

                {/* DEDICATED "ULT" BUTTON ON TOP OF CHARACTER */}
                <button
                  disabled={!isUltReady}
                  onClick={() => handleImmediateUltimate(hero)}
                  className={`relative z-10 -mb-2 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider transition transform active:scale-90 shadow-md ${
                    isUltReady
                      ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 shadow-amber-500/50 animate-bounce ring-2 ring-amber-300 cursor-pointer'
                      : 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed opacity-60'
                  }`}
                >
                  <span className="flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" />
                    ULT
                  </span>
                </button>

                {/* Character Card */}
                <div
                  onClick={() => {
                    sounds.playClick();
                    setSelectedTargetAllyId(hero.id);
                  }}
                  className={`w-full h-28 sm:h-32 p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between relative ${
                    isAttacking ? 'animate-melee-dash-up z-30' : ''
                  } ${isHit ? 'animate-hit-flinch z-20' : ''} ${
                    isSelectedAlly
                      ? 'ring-2 ring-emerald-400 border-emerald-400 shadow-md shadow-emerald-500/30 bg-emerald-950/20'
                      : isCurrent
                      ? 'bg-indigo-950/80 border-indigo-400 ring-2 ring-indigo-500/50 shadow-lg shadow-indigo-950'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Support Visual Overlay */}
                  {supportEff && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                      {supportEff.type === 'heal' && <span className="text-3xl animate-heal-sparkle">💚</span>}
                      {supportEff.type === 'shield' && (
                        <div className="w-10 h-10 rounded-full border-2 border-cyan-400 bg-cyan-400/20 animate-shield-barrier" />
                      )}
                      {supportEff.type === 'buff' && <span className="text-3xl animate-heal-sparkle">✨</span>}
                    </div>
                  )}

                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-xl sm:text-2xl">{hero.emoji}</span>
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-white truncate max-w-[50px] sm:max-w-[65px]">
                        {hero.name}
                      </div>
                      <div className="text-[8px] flex items-center justify-end gap-1">
                        <span className={hero.rarity === 5 ? 'text-amber-400 font-black' : 'text-purple-400 font-black'}>
                          {hero.rarity}★
                        </span>
                        <span className="text-indigo-300">{hero.element}</span>
                      </div>
                    </div>
                  </div>

                  {/* HP Bar */}
                  <div className="space-y-0.5">
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full transition-all duration-300 ${
                          hpPercent > 50 ? 'bg-emerald-500' : hpPercent > 25 ? 'bg-amber-400' : 'bg-red-500'
                        }`}
                        style={{ width: `${hpPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[8px] font-mono text-slate-400">
                      <span>HP</span>
                      <span>{hero.hp}</span>
                    </div>
                  </div>

                  {/* Energy Bar */}
                  <div className="space-y-0.5">
                    <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isUltReady ? 'bg-amber-400 shadow-sm shadow-amber-400' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${Math.min(100, (hero.energy / hero.maxEnergy) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Selection status */}
                  <div className="text-[7px] font-bold text-center mt-0.5">
                    {isSelectedAlly ? (
                      <span className="text-emerald-400 font-bold">💚 Target Ally</span>
                    ) : (
                      <span className="text-slate-500">Tap to Target</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ACTION EXECUTION BUTTONS (Always visible without scrolling) */}
        <div className="max-w-2xl mx-auto w-full mt-1.5 flex items-stretch gap-2">
          {/* Basic Attack Button */}
          <button
            disabled={!isPlayerTurn}
            onClick={() => handleExecuteHeroAction('basic')}
            className={`flex-1 py-1.5 sm:py-2 px-2.5 rounded-xl border transition-all transform active:scale-98 flex items-center justify-between text-left ${
              isPlayerTurn
                ? 'bg-slate-900 hover:bg-slate-800 border-indigo-500/50 text-white shadow-md cursor-pointer'
                : 'bg-slate-900/60 border-slate-800 text-slate-600 cursor-not-allowed opacity-50'
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center shrink-0">
                <Sword className="w-3.5 h-3.5 text-indigo-300" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold text-white truncate">
                  {currentActingHero?.basicAtk.name || 'Basic Attack'}
                </div>
                <div className="text-[8px] text-red-400 truncate">
                  🎯 Foe: {targetEnemy?.name || 'None'}
                </div>
              </div>
            </div>
            <div className="shrink-0 text-right pl-1">
              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/80">
                +1 SP
              </span>
            </div>
          </button>

          {/* Skill Button (Contextual Support vs Offensive) */}
          {(() => {
            const isSupportSkill =
              currentActingHero?.skill.animationType === 'Heal' ||
              currentActingHero?.skill.animationType === 'Shield' ||
              currentActingHero?.skill.animationType === 'Buff' ||
              currentActingHero?.skill.targetType === 'SingleAlly' ||
              currentActingHero?.skill.targetType === 'AllAllies';

            const canCastSkill = isPlayerTurn && skillPoints >= 1;

            return (
              <button
                disabled={!canCastSkill}
                onClick={() => handleExecuteHeroAction('skill')}
                className={`flex-1 py-1.5 sm:py-2 px-2.5 rounded-xl border transition-all transform active:scale-98 flex items-center justify-between text-left ${
                  canCastSkill
                    ? isSupportSkill
                      ? 'bg-gradient-to-r from-emerald-950/90 to-teal-950/90 border-emerald-400 text-white shadow-lg shadow-emerald-950/50 cursor-pointer'
                      : 'bg-gradient-to-r from-indigo-950/90 to-purple-950/90 border-indigo-400 text-white shadow-lg shadow-indigo-950/50 cursor-pointer'
                    : 'bg-slate-900/60 border-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <div
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg border flex items-center justify-center shrink-0 ${
                      isSupportSkill
                        ? 'bg-emerald-900/80 border-emerald-400/40 text-emerald-300'
                        : 'bg-indigo-900/80 border-indigo-400/40 text-amber-300'
                    }`}
                  >
                    {isSupportSkill ? (
                      <Heart className="w-3.5 h-3.5" />
                    ) : (
                      <Zap className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold text-white truncate">
                      {currentActingHero?.skill.name || 'Skill'}
                    </div>
                    <div
                      className={`text-[8px] truncate ${
                        isSupportSkill ? 'text-emerald-400 font-semibold' : 'text-red-400'
                      }`}
                    >
                      {isSupportSkill
                        ? `💚 Ally: ${targetAlly?.name || 'None'}`
                        : `🎯 Foe: ${targetEnemy?.name || 'None'}`}
                    </div>
                  </div>
                </div>
                <div className="shrink-0 text-right pl-1">
                  <span className="text-[9px] font-bold text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-800/80">
                    -1 SP
                  </span>
                </div>
              </button>
            );
          })()}
        </div>
      </div>

      {/* PAUSE MODAL (User Sketch [Pause] button) */}
      {isPaused && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-sm rounded-2xl bg-gradient-to-b from-slate-900 to-indigo-950 border border-indigo-500/40 p-6 shadow-2xl text-center space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center justify-center gap-2">
              <Pause className="w-5 h-5 text-amber-400" />
              Battle Paused
            </h3>
            <p className="text-xs text-slate-400">
              Review current battle status or safely retreat to the main menu.
            </p>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  sounds.playClick();
                  setIsPaused(false);
                }}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                Resume Battle
              </button>
              <button
                onClick={() => {
                  sounds.playClick();
                  setIsPaused(false);
                  onRetreat();
                }}
                className="w-full py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-200 font-bold text-xs transition flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Retreat to Expedition Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BATTLE STATS MODAL (User Sketch [Battle stats] button) */}
      {isBattleStatsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl bg-gradient-to-b from-slate-900 to-indigo-950 border border-indigo-500/40 p-5 shadow-2xl flex flex-col space-y-4 max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                Battle Intelligence & Weakness Matrix
              </h3>
              <button
                onClick={() => {
                  sounds.playClick();
                  setIsBattleStatsOpen(false);
                }}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto text-xs">
              <div>
                <div className="font-bold text-slate-300 uppercase text-[10px] mb-1">
                  Active Party Status
                </div>
                <div className="space-y-1.5">
                  {party.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800"
                    >
                      <div className="flex items-center gap-2">
                        <span>{p.emoji}</span>
                        <span className="font-semibold text-white">{p.name}</span>
                        <span className="text-[10px] text-slate-400">({p.element})</span>
                      </div>
                      <div className="text-right font-mono">
                        <span className="text-emerald-400">{p.hp}</span> / {p.maxHp} HP
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="font-bold text-slate-300 uppercase text-[10px] mb-1">
                  Enemy Elemental Vulnerabilities
                </div>
                <div className="space-y-1.5">
                  {enemies.map((e) => (
                    <div
                      key={e.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800"
                    >
                      <div className="flex items-center gap-2">
                        <span>{e.emoji}</span>
                        <span className="font-semibold text-white">{e.name}</span>
                      </div>
                      <div className="flex items-center gap-1 font-bold text-amber-300">
                        <span>Weak:</span>
                        <span>{ELEMENT_EMOJI[ENEMY_WEAKNESS_MAP[e.element]]}</span>
                        <span className="text-[10px] text-slate-400">({ENEMY_WEAKNESS_MAP[e.element]})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playClick();
                setIsBattleStatsOpen(false);
              }}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* GAME OVER MODAL (Victory / Defeat) */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl bg-gradient-to-b from-slate-900 to-indigo-950 border border-indigo-500/40 p-6 shadow-2xl text-center space-y-5">
            <div className="text-5xl">{isGameOver === 'victory' ? '🏆' : '💀'}</div>

            <div>
              <h3 className="text-2xl font-black text-white">
                {isGameOver === 'victory' ? 'STAGE CLEARED!' : 'DEFEAT'}
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                {isGameOver === 'victory'
                  ? 'Outstanding tactical strategy! All foes vanquished.'
                  : 'Your frontline has fallen. Upgrade heroes and refine your team.'}
              </p>
            </div>

            {isGameOver === 'victory' && (
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="text-xs text-slate-400 uppercase font-semibold">Rewards Claimed</div>
                <div className="flex items-center justify-center gap-4 text-sm font-bold font-mono">
                  <span className="text-cyan-400">+{stage.firstClearReward.crystals} 💎</span>
                  <span className="text-amber-400">+{stage.firstClearReward.coins.toLocaleString()} 🪙</span>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                sounds.playClick();
                if (isGameOver === 'victory') {
                  onVictory(stage.firstClearReward, pureOnslaughtScore);
                } else {
                  onDefeat();
                }
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition"
            >
              Return to Expedition Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
