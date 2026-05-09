Seasonal Idle ARPG
Game Design Document v1.0
1. High Concept
Working Title: Seasonal Idle ARPG
Genre: Browser ARPG / Idle / Auto-battle / Seasonal reset
Platform: Web browser
Session Length: 1–10 minutes
Season Length: 14 days

This is a browser-based seasonal action RPG with idle progression and auto-battle combat. Players configure their build first, then characters auto-clear maps, while boss fights allow limited manual intervention. Offline progression continues to generate resources and support long-term growth.

2. Design Goals
The game is designed around four pillars:

Fast reward loop. Players should gain noticeable progress within minutes.

Automated map progression. Most regular combat should be hands-off once the build is configured.

Seasonal replay value. Every 14-day season resets progression and introduces a new mechanical twist.

Clear build diversity. Different classes and archetypes must feel meaningfully different.

This structure follows common GDD best practices: define the core loop, document systems and constraints, and keep the player fantasy consistent across all major features.

3. Player Audience
3.1 Core Audience
Players who enjoy ARPG progression and build theorycrafting.

Players who are comfortable with auto-battle or idle mechanics.

Players who prefer short daily sessions with visible progress.

3.2 Secondary Audience
Players with limited playtime.

Browser game players.

Mid-core players who want low-friction progression.

3.3 Desired Player Mindset
“If I optimize my setup well, my runs are smoother.”

“I make progress even when offline.”

“This season feels different, so I want to try a new build.”

4. Core Gameplay Loop
4.1 Main Loop
Log in.

Collect idle resources.

Upgrade character, skills, and equipment.

Configure skill priority, target priority, and defensive triggers.

Auto-farm maps.

Fight elites and bosses.

Claim drops and rewards.

Log out and continue offline progression.

4.2 Short Loop
Clear a stage → get loot → swap gear → upgrade skills → challenge harder content.

4.3 Loop Intent
The loop should reward both active optimization and passive accumulation. Players should feel that their preparation affects battle outcomes more than moment-to-moment manual skill.

5. Game Structure
5.1 Town / Hub
The hub is the player’s main management space. It contains:

Character panel

Skill panel

Inventory

Workshop / idle buildings

Season panel

Quest / mission board

5.2 Map Types
Normal maps.

Elite maps.

Boss maps.

Seasonal activity maps.

5.3 Seasonal Content Examples
Seasonal affixes.

Seasonal boss.

Seasonal currency.

Seasonal build bonuses.

6. Combat System
6.1 Mob Combat
Regular combat is fully automated. The player defines skill priority and conditions before entering battle, and the system executes actions according to those rules.

6.2 Boss Combat
Boss combat is automation-first, but players can manually trigger 2–3 key skills. Bosses include phases and special mechanics to create moments of decision-making.

6.3 Combat Design Goal
Combat should reward setup, build choice, and resource allocation rather than reflex-based execution.

6.4 Combat Rules
The combat engine should resolve actions in a deterministic order:

Check whether a skill is off cooldown.

Check whether resource cost can be paid.

Check whether target conditions are valid.

Check whether HP or boss-phase thresholds are met.

Resolve the highest-priority eligible action.

This keeps the system readable and easier to balance for auto-battle play.

7. Class and Archetype System
7.1 Initial Classes
Season 1 includes:

Warrior

Mage

Hunter

Optional later: Summoner

7.2 Archetype Branches
Each class should have 2–3 branches.

Warrior

Tank

Whirlwind

Burst

Mage

Fire

Frost

Curse

Hunter

Arrow Rain

Poison Arrow

Trap

7.3 Class Roles
Warrior: stable, survivable, boss-reliable.

Mage: high burst, fast clear.

Hunter: ranged, high attack speed, flexible.

Summoner: highly automated, idle-friendly.

7.4 Class Design Principle
Classes should create different decision patterns, not just different stats. A player should be able to tell at a glance how a class wants to fight.

8. Skill System
8.1 Skill Types
Basic attack

Active skill

Defensive skill

Passive skill

Summon or damage-over-time skill

8.2 Skill Slot Structure
Recommended slots per character:

1 basic attack

3 active skills

1 defensive skill

2 passive slots

1 manual burst slot

8.3 Skill Trigger Conditions
A skill may activate when:

Cooldown is ready.

Resource is sufficient.

Target condition is met.

HP threshold is met.

Boss phase condition is met.

Priority threshold is satisfied.

8.4 Player-Configurable Options
Skill order

Priority

Target mode

Auto-heal threshold

Burst trigger conditions

8.5 Target Modes
Boss first

Elite first

Lowest HP

Highest threat

Closest target

Highest enemy count in area

8.6 Skill Design Goal
Skill choice should create meaningful build identity. For example, the same skill can behave differently depending on gear, passives, and target rules.

9. Equipment System
9.1 Equipment Slots
Weapon

Helmet

Armor

Gloves

Leg armor

Ring

Necklace

9.2 Core Stats
Attack

Defense

HP

Crit

Attack speed

Elemental damage

Status effect bonuses

Skill bonuses

9.3 Equipment Design Principle
Items should change build behavior, not only increase raw values. A good item may:

Boost a skill family.

Alter cooldown behavior.

Increase status effect chance.

Improve summon uptime.

Enable a new playstyle.

9.4 Equipment Rarity
Recommended rarity tiers:

Common

Magic

Rare

Epic

Legendary

Seasonal

9.5 Item Comparison Rules
Gear comparison should show:

Stat differences.

Skill interaction differences.

Whether the item supports the current archetype.

10. Idle System
10.1 Idle Buildings
Mine: materials.

Workshop: upgrade resources.

Expedition team: map fragments.

Altar: seasonal currency.

10.2 Idle Principle
Players should feel meaningful offline progress and long-term investment payoff.

10.3 Idle Balance
Idle systems should support progress, not replace active play. Active play must remain the fastest and most rewarding way to advance.

10.4 Offline Cap
Offline rewards should have a cap to encourage re-engagement.
Recommended starting range:

Short-term resource caps: a few hours.

Mid-term resource caps: half-day to one day.

Long-term resource caps: up to several days.

This creates multiple return intervals, which is a common retention principle in idle design.

11. Season System
11.1 Season Length
14 days.

11.2 Season Timeline
Day 1–2: onboarding boost

Day 3–5: build formation

Day 6–8: seasonal mechanics unfold

Day 9–11: optimization

Day 12–14: climax / boss / ranking

11.3 Reset Rules
Reset each season:

Character level

Equipment

Seasonal resources

Persist across seasons:

Cosmetics

Titles

Collection / logbook

Account-wide meta unlocks

11.4 Season Goals
Each season should feel like:

A fresh start.

A new build puzzle.

A new reason to return.

11.5 Seasonal Content Plan
Season 1: 3 core classes, 6 archetypes, 1 map set, 1 end boss, 1 seasonal mechanic.

Season 2: new boss, new seasonal affix, +1 branch upgrade path per class.

Season 3+: new class, new region, new seasonal meta systems.

12. Progression System
12.1 Short-Term Progression
Level up

New gear drops

Skill unlocks

New stage clears

12.2 Mid-Term Progression
Build completion

Skill breakpoint upgrades

Gear affix optimization

12.3 Long-Term Progression
Archetype unlocks

Account-wide bonuses

Seasonal meta accumulation

12.4 Progression Intent
Progression should alternate between small gains and major breakthrough moments. This helps avoid stagnation and supports the “one more run” feeling common in progression-driven games.

13. Quest and Mission System
13.1 Daily Missions
Kill a target number of monsters

Clear a specific stage

Upgrade equipment once

Defeat one boss

13.2 Seasonal Missions
Clear using a specific archetype

Defeat the designated seasonal boss

Collect seasonal currency

Reach a target combat power

13.3 Purpose
Missions guide players toward core systems and seasonal features without forcing them into unrelated content.

14. Economy
14.1 Currencies
Gold

Upgrade materials

Skill shards

Season tokens

Premium cosmetic currency (future option)

14.2 Economy Principles
Generous early game

Meaningful mid-game tradeoffs

Late-game resource sinks

Seasonal reset rebalances the economy

14.3 Economy Intent
The economy should create choices:

Spend now for power.

Save for a stronger upgrade.

Invest in idle growth.

Push active progression.

15. UI / UX
15.1 UI Priorities
Combat state readable at a glance

Skill setup fast and simple

Gear comparison quick

Idle rewards prominent

15.2 Main Layout
Left: character info

Center: combat view

Right: skill / priority panel

Bottom: manual skill bar

Hub: resources / buildings / missions / season

15.3 Screen Flow
Hub → Battle → Results → Inventory / Skills / Hub

15.4 UI Intent
The player should always know:

what they are doing,

what they gained,

what they should do next.

16. Art Direction
16.1 Visual Style
Clear 2D or semi-2D

Distinct elemental color language

Impactful but lightweight effects

Clean UI

16.2 Performance Principle
Fast browser loading and stable performance are more important than heavy animation or particle density.

17. Audio Direction
Clear hit feedback

Distinct loot-drop sounds

Satisfying level-up cue

Boss phase music variation

Audio matters especially in auto-battle because players may not always be watching the screen closely.

18. MVP Scope
18.1 Initial Playable MVP
1 class

3 skills

1 equipment system

1 idle building

1 normal map

1 boss

1 seasonal reset

1 daily mission

18.2 MVP Validation Goals
The MVP should answer:

Do players enjoy automated map farming?

Do players enjoy build-crafting?

Do players accept a 14-day seasonal cadence?

18.3 Out of Scope for MVP
PvP

Guilds

Trading

Multiplayer raids

Complex crafting

Open-world exploration

19. Risks and Open Questions
19.1 Risks
Too few skills → boredom.

Too many skills → complexity overload.

Heavy reset → players feel their progress was wasted.

Idle too strong → active play becomes irrelevant.

19.2 Open Questions
Should trading exist in Season 1?

Should boss fights have time limits?

Should PvP be included?

Should guilds or social features be added?

19.3 Recommendation
Defer deep social systems until the core loop is validated.

20. Production Notes
This document should be treated as the source of truth for the first playable version.
Any new feature should be checked against the core pillars:

fast reward loop,

automated progression,

seasonal replay value,

build diversity.

If a proposed feature does not strengthen one of those pillars, it should probably be cut or delayed.

