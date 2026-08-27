/**
 * Name Component Composer
 * Composes raw components into a final display name using the rule composition pattern.
 */

import { NameComponent, Candidate } from '../types';

export function composeCandidateName(
  components: NameComponent[],
  compositionPattern: string
): string {
  let result = compositionPattern;

  // Build a map of component values by type
  const compMap = new Map<string, string>();
  for (const comp of components) {
    compMap.set(comp.type, comp.value);
  }

  // Replace placeholders like {given}, {clan}, {nickname}, {family}, {surname}, {virtue}, {child}
  result = result.replace(/\{(\w+)\}/g, (_, key) => {
    return compMap.get(key) || '';
  });

  // Clean up extra spaces or empty quotes if optional components were omitted
  result = result
    .replace(/\s+/g, ' ')
    .replace(/''|""/g, '')
    .trim();

  return result;
}
