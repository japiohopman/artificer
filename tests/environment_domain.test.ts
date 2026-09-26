import { describe, it, expect } from 'vitest';
import {
  resolveLocationSummary,
  resolveTimeContext,
  resolveWeatherContext,
  resolveTemperatureContext,
  resolveForecast,
  getWeatherForTimeBlock,
  resolveWorldEnvironmentSnapshot,
} from '../src/domain/environment/environmentResolver';
import type { WorldState } from '../src/store/useWorldStore';

describe('WorldEnvironmentSnapshot & Environment Resolver Domain Tests', () => {
  it('resolves location summary cleanly with fallback defaults', () => {
    const rawLoc = {
      id: 'waterdeep_1',
      name: 'Waterdeep',
      category: 'city',
      coordinates: { x: 100, y: 200 },
    };

    const summary = resolveLocationSummary(rawLoc, 'Sword Coast');
    expect(summary).not.toBeNull();
    expect(summary?.id).toBe('waterdeep_1');
    expect(summary?.name).toBe('Waterdeep');
    expect(summary?.category).toBe('city');
    expect(summary?.region).toBe('Sword Coast');
    expect(summary?.isUnderground).toBe(false);
    expect(summary?.coordinates).toEqual({ x: 100, y: 200 });
  });

  it('identifies underground location categories correctly', () => {
    const dungeonLoc = { id: 'd1', name: 'Undermountain', category: 'dungeon' };
    const underdarkLoc = { id: 'u1', name: 'Menzoberranzan', category: 'underdark' };

    expect(resolveLocationSummary(dungeonLoc)?.isUnderground).toBe(true);
    expect(resolveLocationSummary(underdarkLoc)?.isUnderground).toBe(true);
  });

  it('calculates time context and time of day deterministically', () => {
    // 8:30 AM (510 minutes) on day 15 of Month 4 (Tarsakh), 1492 DR
    const timeCtx = resolveTimeContext(1492, 4, 15, 510);
    expect(timeCtx.gameYear).toBe(1492);
    expect(timeCtx.formattedTime).toBe('08:30');
    expect(timeCtx.calendarDate).toBe('15th of Tarsakh, 1492 DR');
    expect(timeCtx.isNight).toBe(false);
    expect(timeCtx.timeOfDay).toBe('day');

    // 11:45 PM (1425 minutes)
    const nightCtx = resolveTimeContext(1492, 4, 15, 1425);
    expect(nightCtx.formattedTime).toBe('23:45');
    expect(nightCtx.isNight).toBe(true);
    expect(nightCtx.timeOfDay).toBe('night');
  });

  it('evaluates weather context properties strictly', () => {
    const sunny = resolveWeatherContext('Sunny');
    expect(sunny.visibility).toBe('clear');
    expect(sunny.isExtreme).toBe(false);

    const blizzard = resolveWeatherContext('Blizzard');
    expect(blizzard.visibility).toBe('near_zero');
    expect(blizzard.precipitation).toBe('severe');
    expect(blizzard.isExtreme).toBe(true);
  });

  it('calculates temperature deterministically across terrain, month, time, and weather', () => {
    // Desert at noon (720 min) in Kythorn (Month 6) with Sunny weather
    const desertTemp = resolveTemperatureContext('desert', 6, 720, 'Sunny');
    expect(desertTemp.baseTemp).toBe(35);
    expect(desertTemp.category).toBe('extreme_heat');
    expect(desertTemp.celsius).toBeGreaterThan(40);

    // Arctic in winter (Month 1) with Blizzard
    const arcticTemp = resolveTemperatureContext('arctic', 1, 0, 'Blizzard');
    expect(arcticTemp.category).toBe('freezing');
    expect(arcticTemp.celsius).toBeLessThan(-20);
  });

  it('ensures physical environment context uses partyLocation and ignores inspectedLocation', () => {
    const mockState: Partial<WorldState> = {
      gameYear: 1492,
      gameMonth: 1,
      gameDay: 1,
      gameTime: 480,
      weather: 'Sunny',
      temperature: 18,
      currentRegion: 'Sword Coast',
      isTraveling: false,
      travelProgress: 0,
      mapZoom: 2,
      isFastForwarding: false,
      partyLocation: {
        id: 'party_camp',
        name: 'High Road Encampment',
        category: 'landmark',
      },
      currentLocation: {
        id: 'phandalin',
        name: 'Phandalin',
        category: 'village',
      },
      inspectedLocation: {
        id: 'neverwinter',
        name: 'Neverwinter',
        category: 'city',
      },
    };

    const snapshot = resolveWorldEnvironmentSnapshot(mockState as WorldState);

    // Physical context MUST be based strictly on partyLocation
    expect(snapshot.locations.physical?.id).toBe('party_camp');
    expect(snapshot.locations.physical?.name).toBe('High Road Encampment');

    // Presentation and inspected locations remain separate
    expect(snapshot.locations.presentation?.id).toBe('phandalin');
    expect(snapshot.locations.inspected?.id).toBe('neverwinter');
  });

  it('guarantees identical authoritative inputs resolve to identical snapshot outputs', () => {
    const mockState: Partial<WorldState> = {
      gameYear: 1492,
      gameMonth: 5,
      gameDay: 10,
      gameTime: 600,
      weather: 'Rainy',
      temperature: 14,
      currentRegion: 'Sword Coast',
      isTraveling: true,
      travelProgress: 0.4,
      mapZoom: 3,
      isFastForwarding: true,
      partyLocation: { id: 'road_1', name: 'Coast Way' },
      currentLocation: null,
      inspectedLocation: null,
    };

    const snap1 = resolveWorldEnvironmentSnapshot(mockState as WorldState);
    const snap2 = resolveWorldEnvironmentSnapshot(mockState as WorldState);

    // Timestamps can differ slightly if created sequentially, compare domain contents
    expect(snap1.time).toEqual(snap2.time);
    expect(snap1.locations).toEqual(snap2.locations);
    expect(snap1.weather).toEqual(snap2.weather);
    expect(snap1.temperature).toEqual(snap2.temperature);
    expect(snap1.forecast).toEqual(snap2.forecast);
  });

  it('provides persistent weather continuity via time-block resolution', () => {
    // Calling getWeatherForTimeBlock at minute 10 vs minute 350 of the same 6h block (0-360) returns the exact same weather
    const w1 = getWeatherForTimeBlock(1492, 5, 10, 10, 'Sword Coast', 'landmark');
    const w2 = getWeatherForTimeBlock(1492, 5, 10, 350, 'Sword Coast', 'landmark');

    expect(w1).toBe(w2);
  });
});
