/**
 * Global UI Stacking & Layering Contract
 *
 * Defines authoritative z-index layer tokens across HUD, full-screen workspace overlays,
 * modal dialogs, and system layers to prevent arbitrary z-index escalation.
 */

export const UI_STACK = {
  /** HUD sidebars (WorldPanel, CharacterPanel) */
  HUD_SIDEBAR: 1000,
  /** HUD footer bar */
  HUD_FOOTER: 4500,
  /** HUD top header & navigation bar */
  HUD_NAV: 5000,
  /** Full-screen application workspace overlays (e.g. Equipment Workspace / FullInventoryMenu) */
  FULLSCREEN_WORKSPACE: 6000,
  /** Context menus rendered on workspace overlays */
  WORKSPACE_CONTEXT_MENU: 10060,
  /** Drag-and-drop preview overlay during active drags */
  WORKSPACE_DRAG_PREVIEW: 10100,
  /** Standard system modals and profile screens */
  MODAL: 9999,
  /** Critical system overlays (LoadingScreen, DiceBoxCanvas) */
  SYSTEM_CRITICAL: 100000,
} as const;

export const UI_STACK_CLASSES = {
  HUD_SIDEBAR: 'z-[1000]',
  HUD_FOOTER: 'z-[4500]',
  HUD_NAV: 'z-[5000]',
  FULLSCREEN_WORKSPACE: 'z-[6000]',
  WORKSPACE_CONTEXT_MENU: 'z-[10060]',
  WORKSPACE_DRAG_PREVIEW: 'z-[10100]',
  MODAL: 'z-[9999]',
  SYSTEM_CRITICAL: 'z-[100000]',
} as const;
