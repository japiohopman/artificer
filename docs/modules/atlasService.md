# Atlas Data Module

## Status

**Implemented / evolving**

The Atlas data layer provides canonical game/content data to application features. It should be treated as a domain data source, not as a UI-specific asset helper.

## Responsibility

The Atlas layer is responsible for loading and resolving canonical data such as world entities and game definitions used by multiple features.

It should provide a stable boundary between stored Atlas assets/data and consumers such as the world map, DevKit, character systems and tactical systems.

## Architecture

Conceptually:

```text
Atlas assets / data
        ↓
Atlas loader / service
        ↓
Atlas state / indexes
        ↓
feature consumers
```

Consumers should not create parallel copies of canonical entity definitions merely for convenience.

## Ownership

This is an application architecture concern, not an agent-owned module. Do not assign ownership of the service to a specific coding agent in documentation.

## Current implementation

The implementation is evolving. Existing consumers and Atlas stores/services should be treated as the source of truth for the exact API and data shapes.

When changing the Atlas API:

1. inspect all consumers;
2. update the canonical TypeScript types;
3. update dependent module documentation;
4. verify local/deployed asset resolution;
5. add or update tests where practical.

## Data integrity

Atlas data should remain canonical. Feature code should resolve data through the Atlas boundary rather than hard-coding large game-data objects in React components.

Schema validation and stronger indexing/search capabilities are valid future improvements, but should only be marked implemented when corresponding code and tests exist.

## Related documentation

- `docs/systems/DATA_FLOW.md`
- `docs/ARCHITECTURE_STATUS.md`
- `docs/modules/devkit_workings.md`
- `docs/modules/mapEditor.md`
