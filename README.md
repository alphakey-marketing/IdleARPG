# Seasonal Idle ARPG - Game Design Document (Draft)

## 1. Game Overview

- **Project Name (Working Title):** Seasonal Idle ARPG
- **Genre:** Browser ARPG / Idle / Auto-battle / Seasonal reset
- **Platform:** Web browser
- **Session Length:** 1-10 minutes
- **Season Length:** 14 days

Core concept: players configure their build first, then the character auto-progresses maps; boss fights allow light manual intervention, and offline progression continues growth.

---

## 2. Design Pillars

### 2.1 Fast Reward Loop
Players should gain progress quickly (levels, loot, power gains) within minutes.

### 2.2 Automated Map Progression
Regular combat is primarily automatic; player agency focuses on pre-battle setup.

### 2.3 Seasonal Replay Value
Each 14-day season resets progression while adding new mechanics or meta shifts.

### 2.4 Clear Build Diversity
Classes/skills/archetypes must feel distinct to avoid single-build dominance.

---

## 3. Target Audience

### 3.1 Core Audience
- Likes ARPG growth and build theorycrafting
- Accepts auto-battle/idle structure
- Prefers short daily sessions with visible progress

### 3.2 Mid-core Audience
- Limited playtime
- Prefers browser games and low-friction progression

### 3.3 Desired Player Mindset
- "If I optimize setup well, my runs are smoother."
- "I grow even when offline."
- "This season feels different; I want to try a new build."

---

## 4. Core Gameplay Loop

### 4.1 Main Loop
1. Log in  
2. Collect idle resources  
3. Upgrade character/skills/equipment  
4. Configure skill priority/target/defense conditions  
5. Auto-farm maps  
6. Fight elites/bosses  
7. Claim drops  
8. Log out and continue idle progression

### 4.2 Short Loop
Clear stage -> get loot -> swap gear -> upgrade skill -> challenge higher difficulty.

---

## 5. Game Structure

### 5.1 Town / Hub
- Character panel
- Skill panel
- Inventory
- Workshop / idle buildings
- Season panel
- Quest / mission board

### 5.2 Map Types
- Normal
- Elite
- Boss
- Seasonal activity maps

### 5.3 Seasonal Content Examples
- Seasonal affixes
- Seasonal boss
- Seasonal currency
- Seasonal build bonuses

---

## 6. Combat System Summary

### 6.1 Mob Combat
- Fully automated
- Skill usage based on player-defined priority and conditions

### 6.2 Boss Combat
- Automation-first
- 2-3 key skills can be manually triggered
- Includes boss phases and special mechanics

### 6.3 Combat Goal
Reward strategic setup and resource allocation, not reaction speed.

---

## 7. Class / Archetype System

### 7.1 Initial Classes (Season 1)
- Warrior
- Mage
- Hunter
- (Optional later) Summoner

### 7.2 Build Branches (2-3 per class)
- Warrior: Tank / Whirlwind / Burst
- Mage: Fire / Frost / Curse
- Hunter: Arrow Rain / Poison Arrow / Trap

### 7.3 Roles
- Warrior: stable, survivable, boss-reliable
- Mage: high burst, fast clear
- Hunter: ranged, high attack speed, flexible
- Summoner: highly automated, idle-friendly

---

## 8. Skill System Summary

### 8.1 Skill Types
- Basic attack
- Active
- Defensive
- Passive
- Summon / damage-over-time

### 8.2 Cast Logic Conditions
- Cooldown ready
- Resource sufficient
- Target condition met
- HP condition met
- Boss phase condition met
- Priority threshold

### 8.3 Player-configurable Options
- Skill order
- Priority
- Target mode
- Auto-heal threshold
- Burst skill trigger conditions

---

## 9. Equipment System

### 9.1 Slots
- Weapon
- Helmet
- Armor
- Gloves
- Leg armor
- Ring
- Necklace

### 9.2 Stats
- Attack
- Defense
- HP
- Crit
- Attack speed
- Elemental damage
- Status effect bonuses
- Skill bonuses

### 9.3 Principle
Items should change build behavior, not only increase raw values.

---

## 10. Idle System

### 10.1 Idle Buildings
- Mine: materials
- Workshop: upgrade resources
- Expedition team: map fragments
- Altar: seasonal currency

### 10.2 Design Principle
Players should feel meaningful offline progress and long-term investment payoff.

### 10.3 Balance
Idle should not replace active play; active play remains the main progression accelerator.

---

## 11. Season System

### 11.1 Season Length
14 days

### 11.2 Season Timeline
- Day 1-2: onboarding boost
- Day 3-5: build formation
- Day 6-8: seasonal mechanics unfold
- Day 9-11: optimization
- Day 12-14: climax / boss / ranking

### 11.3 Reset Rules
Reset each season:
- Character level
- Equipment
- Seasonal resources

Persist across seasons:
- Cosmetics
- Titles
- Collection/logbook
- Account-wide meta unlocks

### 11.4 Season Goals
Players should feel each season has new content, new build opportunities, and desire to continue into next season.

---

## 12. Progression System

### 12.1 Short-term
- Level up
- New gear drops
- Skill unlocks
- New stage clears

### 12.2 Mid-term
- Build completion
- Skill breakpoint upgrades
- Gear affix optimization

### 12.3 Long-term
- Archetype unlocks
- Account-wide bonuses
- Seasonal meta accumulation

---

## 13. Quest / Mission System

### 13.1 Daily Missions
- Kill target number of monsters
- Clear specific stage
- Upgrade equipment once
- Defeat one boss

### 13.2 Seasonal Missions
- Clear using specific archetype
- Defeat designated seasonal boss
- Collect seasonal currency
- Reach target combat power

### 13.3 Purpose
Guide players toward core loop participation and seasonal feature engagement.

---

## 14. Economy

### 14.1 Currencies
- Gold
- Upgrade materials
- Skill shards
- Season tokens
- Premium cosmetic currency (future option)

### 14.2 Economy Principles
- Generous early game
- Mid-game tradeoffs in resource allocation
- Late-game sink pressure
- Rebalanced by seasonal reset

---

## 15. UI / UX Principles

### 15.1 Priorities
- Combat state readable at a glance
- Skill setup simple and fast
- Gear comparison quick
- Idle reward claim prominent

### 15.2 Layout
- Left: character info
- Center: combat view
- Right: skill/priority panel
- Bottom: manual skill bar
- Hub: resources/buildings/missions/season

---

## 16. Art Direction

### 16.1 Style
- Clear 2D / semi-2D
- Distinct elemental color language
- Impactful but lightweight effects
- Clean UI

### 16.2 Performance Principle
Fast browser loading and stable performance over heavy animation/particle complexity.

---

## 17. Audio Direction

- Clear hit feedback
- Distinct loot-drop sounds
- Satisfying level-up cue
- Boss phase music variation

Audio is especially important in auto-battle because players may not continuously watch visuals.

---

## 18. Seasonal Content Plan

### Season 1
- 3 core classes
- 6 archetype branches
- 1 core map set
- 1 end boss
- 1 seasonal mechanic

### Season 2
- New boss
- New seasonal affix
- +1 branch upgrade path per class

### Season 3+
- New class
- New region
- New seasonal meta systems

---

## 19. MVP Scope

Initial playable MVP:
- 1 class
- 3 skills
- 1 equipment system
- 1 idle building
- 1 normal map
- 1 boss
- 1 seasonal reset
- 1 daily mission

MVP validates:
- Interest in automated map farming
- Interest in build-crafting
- Acceptance of 14-day seasonal cadence

---

## 20. Risks / Open Questions

### 20.1 Risks
- Too few skills -> boredom
- Too many skills -> complexity overload
- Heavy reset -> loss of investment feeling
- Idle too strong -> active play loses meaning

### 20.2 Open Questions
- Include trading in Season 1?
- Time limit for boss fights?
- Add PvP?
- Add guild/social layer?

Recommendation: defer deep social systems until core loop is validated.
