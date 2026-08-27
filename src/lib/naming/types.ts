/**
 * Naming Domain Types & Models
 * Application-wide domain infrastructure for Artificer naming capabilities.
 */

export type GenderOption = 'male' | 'female' | 'non-binary' | 'unspecified' | string;

export type LifeStage = 'child' | 'adult' | 'elder' | string;

export type NameComponentType =
  | 'given'
  | 'family'
  | 'clan'
  | 'nickname'
  | 'child'
  | 'virtue'
  | 'surname'
  | 'title'
  | 'epithet';

export interface NamingContext {
  species?: string;
  subrace?: string;
  gender?: GenderOption;
  culture?: string;
  background?: string;
  class?: string;
  alignment?: string;
  lifeStage?: LifeStage;
  socialContext?: string;
  origin?: string;
  traditionStyle?: string;
  seed?: number | string;
  candidateCount?: number;
  [key: string]: unknown; // Extensibility without breaking public API
}

export interface NamingProfileRef {
  id: string;
  species: string;
  subrace?: string;
  culture?: string;
  tradition: string;
  description: string;
}

export interface NameComponent {
  type: NameComponentType;
  value: string;
  sourceCategory?: string;
  isOptional?: boolean;
}

export interface ScoreBreakdown {
  profileMatch: number;
  contextMatch: number;
  componentCompleteness: number;
  diversityPenalty: number;
  total: number;
}

export interface Candidate {
  components: NameComponent[];
  compositionPattern: string; // e.g., "{given} {family}", "{clan} {given}", "{given} '{nickname}' {clan}"
  score?: number;
  scoreBreakdown?: ScoreBreakdown;
}

export interface NamingResult {
  displayName: string;
  resolvedProfile: NamingProfileRef;
  components: NameComponent[];
  score: number;
  metadata: {
    seed: number | string;
    candidatesEvaluated: number;
    warnings?: string[];
    fallbackApplied?: boolean;
    ruleId?: string;
  };
}

export type NamingErrorCode =
  | 'UNKNOWN_SPECIES'
  | 'UNSUPPORTED_PROFILE'
  | 'INSUFFICIENT_DATA'
  | 'INVALID_CONTEXT';

export class NamingDomainError extends Error {
  readonly code: NamingErrorCode;
  readonly context?: NamingContext;

  constructor(code: NamingErrorCode, message: string, context?: NamingContext) {
    super(`[NamingDomain:${code}] ${message}`);
    this.name = 'NamingDomainError';
    this.code = code;
    this.context = context;
  }
}
