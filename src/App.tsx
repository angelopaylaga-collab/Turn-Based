/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MainMenu } from './components/MainMenu';
import { BattleView } from './components/BattleView';
import { CharacterRoster } from './components/CharacterRoster';
import { StoryModal } from './components/StoryModal';
import { BattleModesModal } from './components/BattleModesModal';
import { ShopModal } from './components/ShopModal';
import { InstallModal } from './components/InstallModal';
import { GDDViewerModal } from './components/GDDViewerModal';
import { SettingsModal } from './components/SettingsModal';
import { MailModal, MailItem } from './components/MailModal';
import { AchievementsModal, AchievementItem } from './components/AchievementsModal';
import { INITIAL_CHARACTERS } from './data/characters';
import { Character, StageInfo } from './types/game';
import { PhaseBuffOption, AnomalyBossModifier } from './data/stages';
import { sounds } from './utils/audio';

const STORAGE_PREFIX = 'EMOJI_ASTRAL_RPG_V2_';

const getStored = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (raw !== null) return JSON.parse(raw);
  } catch (e) {
    console.error('Storage read error', key, e);
  }
  return fallback;
};

const DEFAULT_MAIL_LIST: MailItem[] = [
  {
    id: 'welcome_package',
    sender: 'Astral Express Operations',
    title: 'Welcome Trailblazer! Launch Supplies',
    date: '2026-10-28',
    content:
      'Welcome to Emoji Astral: Turn-Based RPG! We have dispatched standard expedition resources: 1,600 Crystals for your first 10x Warp, 50,000 Coins for character upgrades, and full Energy. Enjoy!',
    rewards: { crystals: 1600, coins: 50000, energy: 60 },
    isRead: false,
    isClaimed: false,
  },
  {
    id: 'gdd_guide',
    sender: 'Lead Combat Designer',
    title: 'Game Design Document & PWA Mobile App',
    date: '2026-10-28',
    content:
      'Notice: You can install this game directly to your phone as a standalone PWA using the Install button at the top, or scan the QR code to open and play offline on mobile. You can also view or download the complete 31-page Game Design Document PDF anytime!',
    rewards: { crystals: 300 },
    isRead: false,
    isClaimed: false,
  },
];

const DEFAULT_ACHIEVEMENTS: AchievementItem[] = [
  {
    id: 'ach_first_battle',
    title: 'First Victory',
    description: 'Clear any story expedition or battle stage.',
    reward: 100,
    progress: 0,
    max: 1,
    isClaimed: false,
  },
  {
    id: 'ach_unlocked_5',
    title: 'Forming the Astral Crew',
    description: 'Unlock 6 or more heroes in your roster.',
    reward: 200,
    progress: 4,
    max: 6,
    isClaimed: false,
  },
  {
    id: 'ach_level_up',
    title: 'Strength Ascending',
    description: 'Upgrade any character to Level 20 or higher.',
    reward: 150,
    progress: 0,
    max: 1,
    isClaimed: false,
  },
  {
    id: 'ach_stages_3',
    title: 'Realm Explorer',
    description: 'Clear at least 3 distinct stages.',
    reward: 250,
    progress: 0,
    max: 3,
    isClaimed: false,
  },
];

const DEFAULT_MISSIONS = [
  { id: 'dm_1', title: 'Complete 1 Battle Stage', progress: 0, max: 1, claimed: false, reward: 60 },
  { id: 'dm_2', title: 'Upgrade Any Character Level', progress: 0, max: 1, claimed: false, reward: 40 },
  { id: 'dm_3', title: 'Open the Astral Warp or Shop', progress: 1, max: 1, claimed: false, reward: 30 },
];

export default function App() {
  // Player resources & stats (restored from storage)
  const [playerLevel, setPlayerLevel] = useState<number>(() => getStored('LEVEL', 5));
  const [crystals, setCrystals] = useState<number>(() => getStored('CRYSTALS', 1800));
  const [coins, setCoins] = useState<number>(() => getStored('COINS', 65000));
  const [energy, setEnergy] = useState<number>(() => getStored('ENERGY', 120));
  const [maxEnergy] = useState<number>(120);

  // Characters & Party Lineup (restored from storage and merged with current pool)
  const [characters, setCharacters] = useState<Character[]>(() => {
    const stored = getStored<Character[]>('CHARS', INITIAL_CHARACTERS);
    return INITIAL_CHARACTERS.map((initChar) => {
      const found = stored.find((s) => s.id === initChar.id);
      if (found) {
        return {
          ...initChar,
          level: found.level || initChar.level,
          hp: found.hp || initChar.hp,
          maxHp: found.maxHp || initChar.maxHp,
          atk: found.atk || initChar.atk,
          def: found.def || initChar.def,
          isUnlocked: found.isUnlocked !== undefined ? found.isUnlocked : initChar.isUnlocked,
        };
      }
      return initChar;
    });
  });

  const [activePartyIds, setActivePartyIds] = useState<string[]>(() =>
    getStored('PARTY', ['ember', 'kai', 'stone', 'flora'])
  );

  const [clearedStageIds, setClearedStageIds] = useState<string[]>(() =>
    getStored('CLEARED', [])
  );

  // Settings
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => getStored('SOUND', true));
  const [battleSpeed, setBattleSpeed] = useState<number>(() => getStored('SPEED', 1));

  // Navigation & Modals
  const [view, setView] = useState<'menu' | 'battle'>('menu');
  const [activeStage, setActiveStage] = useState<StageInfo | null>(null);
  const [activePhaseBuff, setActivePhaseBuff] = useState<PhaseBuffOption | undefined>();
  const [activeAnomalyMods, setActiveAnomalyMods] = useState<AnomalyBossModifier[] | undefined>();

  const [isInstallOpen, setIsInstallOpen] = useState<boolean>(false);
  const [isStoryOpen, setIsStoryOpen] = useState<boolean>(false);
  const [isBattleModesOpen, setIsBattleModesOpen] = useState<boolean>(false);
  const [isCharactersOpen, setIsCharactersOpen] = useState<boolean>(false);
  const [isShopOpen, setIsShopOpen] = useState<boolean>(false);
  const [isGDDOpen, setIsGDDOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isMailOpen, setIsMailOpen] = useState<boolean>(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState<boolean>(false);

  // Mail, Achievements, Daily Missions
  const [mailList, setMailList] = useState<MailItem[]>(() => getStored('MAIL', DEFAULT_MAIL_LIST));
  const [achievements, setAchievements] = useState<AchievementItem[]>(() =>
    getStored('ACHIEVEMENTS', DEFAULT_ACHIEVEMENTS)
  );
  const [dailyMissions, setDailyMissions] = useState(() =>
    getStored('MISSIONS', DEFAULT_MISSIONS)
  );

  // Offline detection for PWA
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    sounds.enabled = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save ALL state immediately to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PREFIX + 'LEVEL', JSON.stringify(playerLevel));
      localStorage.setItem(STORAGE_PREFIX + 'CRYSTALS', JSON.stringify(crystals));
      localStorage.setItem(STORAGE_PREFIX + 'COINS', JSON.stringify(coins));
      localStorage.setItem(STORAGE_PREFIX + 'ENERGY', JSON.stringify(energy));
      localStorage.setItem(STORAGE_PREFIX + 'CHARS', JSON.stringify(characters));
      localStorage.setItem(STORAGE_PREFIX + 'PARTY', JSON.stringify(activePartyIds));
      localStorage.setItem(STORAGE_PREFIX + 'CLEARED', JSON.stringify(clearedStageIds));
      localStorage.setItem(STORAGE_PREFIX + 'MAIL', JSON.stringify(mailList));
      localStorage.setItem(STORAGE_PREFIX + 'ACHIEVEMENTS', JSON.stringify(achievements));
      localStorage.setItem(STORAGE_PREFIX + 'MISSIONS', JSON.stringify(dailyMissions));
      localStorage.setItem(STORAGE_PREFIX + 'SOUND', JSON.stringify(soundEnabled));
      localStorage.setItem(STORAGE_PREFIX + 'SPEED', JSON.stringify(battleSpeed));
    } catch (e) {
      console.error('Auto-save error', e);
    }
  }, [
    playerLevel,
    crystals,
    coins,
    energy,
    characters,
    activePartyIds,
    clearedStageIds,
    mailList,
    achievements,
    dailyMissions,
    soundEnabled,
    battleSpeed,
  ]);

  // Window close / tab switch flush
  useEffect(() => {
    const handleFlush = () => {
      try {
        localStorage.setItem(STORAGE_PREFIX + 'LEVEL', JSON.stringify(playerLevel));
        localStorage.setItem(STORAGE_PREFIX + 'CRYSTALS', JSON.stringify(crystals));
        localStorage.setItem(STORAGE_PREFIX + 'COINS', JSON.stringify(coins));
        localStorage.setItem(STORAGE_PREFIX + 'ENERGY', JSON.stringify(energy));
        localStorage.setItem(STORAGE_PREFIX + 'CHARS', JSON.stringify(characters));
        localStorage.setItem(STORAGE_PREFIX + 'PARTY', JSON.stringify(activePartyIds));
        localStorage.setItem(STORAGE_PREFIX + 'CLEARED', JSON.stringify(clearedStageIds));
        localStorage.setItem(STORAGE_PREFIX + 'MAIL', JSON.stringify(mailList));
        localStorage.setItem(STORAGE_PREFIX + 'ACHIEVEMENTS', JSON.stringify(achievements));
        localStorage.setItem(STORAGE_PREFIX + 'MISSIONS', JSON.stringify(dailyMissions));
        localStorage.setItem(STORAGE_PREFIX + 'SOUND', JSON.stringify(soundEnabled));
        localStorage.setItem(STORAGE_PREFIX + 'SPEED', JSON.stringify(battleSpeed));
      } catch {}
    };

    window.addEventListener('beforeunload', handleFlush);
    document.addEventListener('visibilitychange', handleFlush);
    return () => {
      window.removeEventListener('beforeunload', handleFlush);
      document.removeEventListener('visibilitychange', handleFlush);
    };
  }, [
    playerLevel,
    crystals,
    coins,
    energy,
    characters,
    activePartyIds,
    clearedStageIds,
    mailList,
    achievements,
    dailyMissions,
    soundEnabled,
    battleSpeed,
  ]);

  const handleManualSave = () => {
    try {
      localStorage.setItem(STORAGE_PREFIX + 'LEVEL', JSON.stringify(playerLevel));
      localStorage.setItem(STORAGE_PREFIX + 'CRYSTALS', JSON.stringify(crystals));
      localStorage.setItem(STORAGE_PREFIX + 'COINS', JSON.stringify(coins));
      localStorage.setItem(STORAGE_PREFIX + 'ENERGY', JSON.stringify(energy));
      localStorage.setItem(STORAGE_PREFIX + 'CHARS', JSON.stringify(characters));
      localStorage.setItem(STORAGE_PREFIX + 'PARTY', JSON.stringify(activePartyIds));
      localStorage.setItem(STORAGE_PREFIX + 'CLEARED', JSON.stringify(clearedStageIds));
      localStorage.setItem(STORAGE_PREFIX + 'MAIL', JSON.stringify(mailList));
      localStorage.setItem(STORAGE_PREFIX + 'ACHIEVEMENTS', JSON.stringify(achievements));
      localStorage.setItem(STORAGE_PREFIX + 'MISSIONS', JSON.stringify(dailyMissions));
      localStorage.setItem(STORAGE_PREFIX + 'SOUND', JSON.stringify(soundEnabled));
      localStorage.setItem(STORAGE_PREFIX + 'SPEED', JSON.stringify(battleSpeed));
    } catch {}
  };

  const handleExportSave = (): string => {
    const fullState = {
      playerLevel,
      crystals,
      coins,
      energy,
      characters,
      activePartyIds,
      clearedStageIds,
      mailList,
      achievements,
      dailyMissions,
      soundEnabled,
      battleSpeed,
      version: '2.0',
      timestamp: Date.now(),
    };
    return btoa(unescape(encodeURIComponent(JSON.stringify(fullState))));
  };

  const handleImportSave = (code: string): boolean => {
    try {
      const json = decodeURIComponent(escape(atob(code.trim())));
      const data = JSON.parse(json);
      if (data && data.characters) {
        if (typeof data.playerLevel === 'number') setPlayerLevel(data.playerLevel);
        if (typeof data.crystals === 'number') setCrystals(data.crystals);
        if (typeof data.coins === 'number') setCoins(data.coins);
        if (typeof data.energy === 'number') setEnergy(data.energy);
        if (Array.isArray(data.characters)) setCharacters(data.characters);
        if (Array.isArray(data.activePartyIds)) setActivePartyIds(data.activePartyIds);
        if (Array.isArray(data.clearedStageIds)) setClearedStageIds(data.clearedStageIds);
        if (Array.isArray(data.mailList)) setMailList(data.mailList);
        if (Array.isArray(data.achievements)) setAchievements(data.achievements);
        if (Array.isArray(data.dailyMissions)) setDailyMissions(data.dailyMissions);
        if (typeof data.soundEnabled === 'boolean') setSoundEnabled(data.soundEnabled);
        if (typeof data.battleSpeed === 'number') setBattleSpeed(data.battleSpeed);
        return true;
      }
    } catch (err) {
      console.error('Import save failed', err);
    }
    return false;
  };

  // Sound sync
  const handleToggleSound = () => {
    setSoundEnabled((prev) => {
      sounds.enabled = !prev;
      return !prev;
    });
  };

  // Launch battle stage
  const handleStartStage = (
    stage: StageInfo,
    phaseBuff?: PhaseBuffOption,
    anomalyMods?: AnomalyBossModifier[]
  ) => {
    if (energy < 10) {
      alert('Not enough Energy ⚡! Refill in Shop.');
      return;
    }
    setEnergy((e) => Math.max(0, e - 10));
    setActiveStage(stage);
    setActivePhaseBuff(phaseBuff);
    setActiveAnomalyMods(anomalyMods);
    setIsStoryOpen(false);
    setIsBattleModesOpen(false);
    setView('battle');
  };

  const handleBattleVictory = (rewards: { crystals: number; coins: number }, score?: number) => {
    if (activeStage && !clearedStageIds.includes(activeStage.id)) {
      setClearedStageIds((prev) => [...prev, activeStage.id]);
    }
    setCrystals((c) => c + rewards.crystals);
    setCoins((coins) => coins + rewards.coins);
    setPlayerLevel((lvl) => lvl + 1);

    // Update mission & achievements
    setDailyMissions((prev) =>
      prev.map((m) => (m.id === 'dm_1' ? { ...m, progress: Math.min(m.max, m.progress + 1) } : m))
    );
    setAchievements((prev) =>
      prev.map((a) => {
        if (a.id === 'ach_first_battle') return { ...a, progress: 1 };
        if (a.id === 'ach_stages_3') return { ...a, progress: clearedStageIds.length + 1 };
        return a;
      })
    );

    setView('menu');
  };

  const handleBattleDefeat = () => {
    setView('menu');
  };

  const handleLevelUpCharacter = (charId: string) => {
    const target = characters.find((c) => c.id === charId);
    if (!target) return;
    const cost = target.level * 500;
    if (coins < cost) return;

    setCoins((c) => c - cost);
    setCharacters((prev) =>
      prev.map((c) => {
        if (c.id !== charId) return c;
        const newLvl = c.level + 1;
        return {
          ...c,
          level: newLvl,
          maxHp: c.maxHp + 50,
          hp: c.maxHp + 50,
          atk: c.atk + 15,
          def: c.def + 10,
        };
      })
    );

    setDailyMissions((prev) =>
      prev.map((m) => (m.id === 'dm_2' ? { ...m, progress: Math.min(m.max, m.progress + 1) } : m))
    );
    setAchievements((prev) =>
      prev.map((a) => (a.id === 'ach_level_up' ? { ...a, progress: 1 } : a))
    );
  };

  const handleUnlockCharacter = (charId: string) => {
    setCharacters((prev) =>
      prev.map((c) => (c.id === charId ? { ...c, isUnlocked: true } : c))
    );
    setAchievements((prev) =>
      prev.map((a) =>
        a.id === 'ach_unlocked_5'
          ? { ...a, progress: characters.filter((c) => c.isUnlocked).length + 1 }
          : a
      )
    );
  };

  const handleClaimMission = (missionId: string) => {
    const target = dailyMissions.find((m) => m.id === missionId);
    if (!target || target.claimed || target.progress < target.max) return;

    setCrystals((c) => c + target.reward);
    setDailyMissions((prev) =>
      prev.map((m) => (m.id === missionId ? { ...m, claimed: true } : m))
    );
  };

  const handleClaimMail = (mailId: string) => {
    const mail = mailList.find((m) => m.id === mailId);
    if (!mail || mail.isClaimed) return;

    if (mail.rewards.crystals) setCrystals((c) => c + mail.rewards.crystals!);
    if (mail.rewards.coins) setCoins((c) => c + mail.rewards.coins!);
    if (mail.rewards.energy) setEnergy((e) => Math.min(maxEnergy, e + mail.rewards.energy!));

    setMailList((prev) =>
      prev.map((m) => (m.id === mailId ? { ...m, isClaimed: true, isRead: true } : m))
    );
  };

  const handleClaimAllMail = () => {
    mailList.forEach((mail) => {
      if (!mail.isClaimed) {
        if (mail.rewards.crystals) setCrystals((c) => c + mail.rewards.crystals!);
        if (mail.rewards.coins) setCoins((c) => c + mail.rewards.coins!);
        if (mail.rewards.energy) setEnergy((e) => Math.min(maxEnergy, e + mail.rewards.energy!));
      }
    });
    setMailList((prev) => prev.map((m) => ({ ...m, isClaimed: true, isRead: true })));
  };

  const handleClaimAchievement = (achId: string) => {
    const target = achievements.find((a) => a.id === achId);
    if (!target || target.isClaimed || target.progress < target.max) return;

    setCrystals((c) => c + target.reward);
    setAchievements((prev) =>
      prev.map((a) => (a.id === achId ? { ...a, isClaimed: true } : a))
    );
  };

  const handleResetProgress = () => {
    try {
      localStorage.clear();
    } catch {}
    setCharacters(INITIAL_CHARACTERS);
    setActivePartyIds(['ember', 'kai', 'stone', 'flora']);
    setClearedStageIds([]);
    setCrystals(1800);
    setCoins(65000);
    setEnergy(120);
    setPlayerLevel(5);
    setIsSettingsOpen(false);
  };

  const activePartyMembers = characters.filter((c) => activePartyIds.includes(c.id));
  const activePartyEmojis = activePartyMembers.map((c) => c.emoji);

  return (
    <div className="min-h-screen bg-[#090a16] text-slate-100 flex flex-col font-sans select-none antialiased">
      {/* Offline Status Badge */}
      {!isOnline && (
        <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-center text-xs font-bold flex items-center justify-center gap-2 shadow">
          <span className="w-2 h-2 rounded-full bg-slate-950 animate-pulse" />
          Offline Mode — All assets, battles & data work offline without internet.
        </div>
      )}

      {/* Main Top Header */}
      <Header
        playerLevel={playerLevel}
        crystals={crystals}
        coins={coins}
        energy={energy}
        maxEnergy={maxEnergy}
        unreadMail={mailList.some((m) => !m.isClaimed)}
        unclaimedAchievements={achievements.some((a) => !a.isClaimed && a.progress >= a.max)}
        onOpenInstall={() => setIsInstallOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenMail={() => setIsMailOpen(true)}
        onOpenAchievements={() => setIsAchievementsOpen(true)}
        onOpenGDD={() => setIsGDDOpen(true)}
      />

      {/* Screen Views */}
      {view === 'menu' ? (
        <MainMenu
          onOpenStory={() => setIsStoryOpen(true)}
          onOpenBattleModes={() => setIsBattleModesOpen(true)}
          onOpenCharacters={() => setIsCharactersOpen(true)}
          onOpenShop={() => setIsShopOpen(true)}
          onOpenInstall={() => setIsInstallOpen(true)}
          dailyMissions={dailyMissions}
          onClaimMission={handleClaimMission}
          activePartyEmojis={activePartyEmojis}
        />
      ) : activeStage ? (
        <BattleView
          stage={activeStage}
          party={activePartyMembers}
          onVictory={handleBattleVictory}
          onDefeat={handleBattleDefeat}
          onRetreat={() => setView('menu')}
          initialSpeed={battleSpeed}
          phaseBuff={activePhaseBuff}
          anomalyModifiers={activeAnomalyMods}
        />
      ) : null}

      {/* Modal Dialogs */}
      <InstallModal isOpen={isInstallOpen} onClose={() => setIsInstallOpen(false)} />
      <GDDViewerModal isOpen={isGDDOpen} onClose={() => setIsGDDOpen(false)} />
      <StoryModal
        isOpen={isStoryOpen}
        onClose={() => setIsStoryOpen(false)}
        onStartStage={handleStartStage}
        clearedStageIds={clearedStageIds}
      />
      <BattleModesModal
        isOpen={isBattleModesOpen}
        onClose={() => setIsBattleModesOpen(false)}
        onStartStage={handleStartStage}
        energy={energy}
      />
      <CharacterRoster
        isOpen={isCharactersOpen}
        onClose={() => setIsCharactersOpen(false)}
        characters={characters}
        activePartyIds={activePartyIds}
        onUpdateParty={setActivePartyIds}
        coins={coins}
        onLevelUpCharacter={handleLevelUpCharacter}
      />
      <ShopModal
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        crystals={crystals}
        coins={coins}
        energy={energy}
        maxEnergy={maxEnergy}
        characters={characters}
        onUnlockCharacter={handleUnlockCharacter}
        onAddCrystals={(amt) => setCrystals((c) => Math.max(0, c + amt))}
        onAddCoins={(amt) => setCoins((c) => Math.max(0, c + amt))}
        onAddEnergy={(amt) => setEnergy((e) => Math.min(maxEnergy, e + amt))}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        battleSpeed={battleSpeed}
        onChangeBattleSpeed={setBattleSpeed}
        onOpenInstall={() => setIsInstallOpen(true)}
        onResetProgress={handleResetProgress}
        onManualSave={handleManualSave}
        onExportSave={handleExportSave}
        onImportSave={handleImportSave}
      />
      <MailModal
        isOpen={isMailOpen}
        onClose={() => setIsMailOpen(false)}
        mailList={mailList}
        onClaimMail={handleClaimMail}
        onClaimAll={handleClaimAllMail}
      />
      <AchievementsModal
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
        achievements={achievements}
        onClaimAchievement={handleClaimAchievement}
      />
    </div>
  );
}
