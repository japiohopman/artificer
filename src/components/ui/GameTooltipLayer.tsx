import { useEffect, useRef, useState, type FC } from 'react';

interface TooltipState {
  text: string;
  left: number;
  top: number;
  placement: 'top' | 'bottom';
}

const TOOLTIP_SELECTOR = '[data-game-tooltip]';

/**
 * Replaces native browser title popovers with one consistent in-game tooltip.
 * The original title text is retained in data-game-tooltip so React components
 * can continue using the familiar title prop without custom wrappers.
 */
export const GameTooltipLayer: FC = () => {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const activeTarget = useRef<HTMLElement | null>(null);
  const internalTitleClears = useRef(new WeakSet<HTMLElement>());

  useEffect(() => {
    const syncTooltipDescription = (element: HTMLElement, text: string) => {
      if (!text.trim()) return;
      // Preserve the description for assistive technology after suppressing the
      // browser-native title popover. Never overwrite an authored description.
      if (!element.hasAttribute('aria-description') || element.dataset.gameTooltipDescriptionManaged === 'true') {
        element.setAttribute('aria-description', text);
        element.dataset.gameTooltipDescriptionManaged = 'true';
      }
    };

    const clearManagedDescription = (element: HTMLElement) => {
      if (element.dataset.gameTooltipDescriptionManaged === 'true') {
        element.removeAttribute('aria-description');
        delete element.dataset.gameTooltipDescriptionManaged;
      }
    };

    const hydrateTitle = (element: Element) => {
      if (!(element instanceof HTMLElement)) return;

      if (!element.hasAttribute('title')) {
        // GameIcon SVGs supply their description directly because SVG title is
        // not part of React's SVG attribute typings.
        const explicitTooltip = element.dataset.gameTooltip?.trim();
        if (explicitTooltip) syncTooltipDescription(element, explicitTooltip);
        else clearManagedDescription(element);
        internalTitleClears.current.delete(element);
        return;
      }

      const title = element.getAttribute('title') || '';
      if (title.trim()) {
        element.dataset.gameTooltip = title;
        syncTooltipDescription(element, title);
        internalTitleClears.current.add(element);
        element.setAttribute('title', '');
      } else if (internalTitleClears.current.has(element)) {
        // This is the empty title written above to suppress the browser tooltip.
        internalTitleClears.current.delete(element);
      } else {
        // An intentionally empty React title clears any previous tooltip.
        delete element.dataset.gameTooltip;
        clearManagedDescription(element);
      }
    };

    const hydrateTree = (node: Node) => {
      if (!(node instanceof Element)) return;
      hydrateTitle(node);
      node.querySelectorAll('[title], [data-game-tooltip]').forEach(hydrateTitle);
    };

    const observer = new MutationObserver(records => {
      records.forEach(record => {
        if (record.type === 'attributes') {
          hydrateTitle(record.target as Element);
          return;
        }

        record.addedNodes.forEach(hydrateTree);
      });
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['title', 'data-game-tooltip']
    });

    document.querySelectorAll('[title], [data-game-tooltip]').forEach(hydrateTitle);

    const getTooltipTarget = (target: EventTarget | null): HTMLElement | null => {
      if (!(target instanceof Element)) return null;
      return target.closest<HTMLElement>(TOOLTIP_SELECTOR);
    };

    const updateTooltip = (target: HTMLElement | null) => {
      if (!target) {
        activeTarget.current = null;
        setTooltip(null);
        return;
      }

      const text = target.dataset.gameTooltip?.trim();
      if (!text) {
        activeTarget.current = null;
        setTooltip(null);
        return;
      }

      activeTarget.current = target;
      const rect = target.getBoundingClientRect();
      const placement = rect.top >= 56 ? 'top' : 'bottom';
      const horizontalPadding = Math.min(150, Math.max(12, window.innerWidth / 2 - 12));
      const left = Math.min(
        Math.max(rect.left + rect.width / 2, horizontalPadding),
        Math.max(horizontalPadding, window.innerWidth - horizontalPadding)
      );
      const top = placement === 'top' ? rect.top - 9 : rect.bottom + 9;

      setTooltip({ text, left, top, placement });
    };

    const handlePointerOver = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      const target = getTooltipTarget(event.target);
      if (target && target !== activeTarget.current) updateTooltip(target);
    };

    const handlePointerOut = (event: PointerEvent) => {
      const current = getTooltipTarget(event.target);
      const next = getTooltipTarget(event.relatedTarget);
      if (current && current !== next && current === activeTarget.current) {
        updateTooltip(null);
      }
    };

    const handleFocusIn = (event: FocusEvent) => {
      updateTooltip(getTooltipTarget(event.target));
    };

    const handleFocusOut = (event: FocusEvent) => {
      const current = getTooltipTarget(event.target);
      const next = getTooltipTarget(event.relatedTarget);
      if (current && current !== next && current === activeTarget.current) {
        updateTooltip(null);
      }
    };

    const handleViewportChange = () => {
      if (activeTarget.current) updateTooltip(activeTarget.current);
    };

    document.addEventListener('pointerover', handlePointerOver);
    document.addEventListener('pointerout', handlePointerOut);
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    window.addEventListener('scroll', handleViewportChange, true);
    window.addEventListener('resize', handleViewportChange);

    return () => {
      observer.disconnect();
      document.removeEventListener('pointerover', handlePointerOver);
      document.removeEventListener('pointerout', handlePointerOut);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
      window.removeEventListener('scroll', handleViewportChange, true);
      window.removeEventListener('resize', handleViewportChange);
    };
  }, []);

  if (!tooltip) return null;

  return (
    <div
      className="game-tooltip"
      role="tooltip"
      data-placement={tooltip.placement}
      style={{
        left: tooltip.left,
        top: tooltip.top,
        transform: tooltip.placement === 'top' ? 'translate(-50%, -100%)' : 'translate(-50%, 0)'
      }}
    >
      {tooltip.text}
    </div>
  );
};
