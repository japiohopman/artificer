# Artificer Skill Database

## Overview
Artificer uses a dual-layer skill system:
1. **Mechanical Skills**: D&D 5.5e skills (Athletics, Arcana, etc.) used for game mechanics.
2. **LLM Skills**: Functional "capabilities" used by AI agents to interact with the world.

## LLM Skills
LLM skills are defined in the `/skills` directory. These follow the [Anthropic Skills Specification](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md).

### Skill Categories
- **Atlas Equipment**: Skills for interacting with item data.
- **Atlas Materials**: Skills for crafting and resource gathering.
- **Atlas Monsters**: Skills for bestiary interactions.
- **System Skills**: Core application logic skills.

## Mechanical Skills
| Skill | Ability | Description |
|-------|---------|-------------|
| Athletics | STR | Physical power and endurance. |
| Acrobatics | DEX | Balance and agility. |
| Arcana | INT | Magical knowledge. |
| ... | ... | ... |

*Refer to `src/store/useStore.ts` for the full `SKILL_LIST`.*
