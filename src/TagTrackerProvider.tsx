import { useCallback, useEffect, useRef } from 'react';
import TagTrackerContext from './TagTrackerContext.js';
import { DataLayerEventProps, TagTrackerProviderProps } from './types.js';

const TagTrackerProvider = (props: TagTrackerProviderProps) => {
  const {
    children,
    trackingAttribute = 'data-track',
    enableHoverTracking = false,
    enableVisibilityTracking = false,
    visibilityTrackingMode = 'once',
    enableCustomTracking = true,
  } = props;

  // Elements that have already produced a visibility event in `once` mode.
  const visibilityTrackedOnceRef = useRef<WeakSet<Element>>(new WeakSet());
  // Elements that are currently fully inside the viewport. Drives the
  // enter/exit gating for `repeat` mode so the provider only fires on
  // re-entry, not on every observer callback while the element is still visible.
  const currentlyVisibleRef = useRef<WeakSet<Element>>(new WeakSet());

  const pushToDataLayer = (data: DataLayerEventProps) => {
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(data);
    } catch (error) {
      console.warn('Failed to push to dataLayer:', error);
    }
  }

  const parseTrackData = (trackData: string | null, eventName: string): DataLayerEventProps | null => {
    if (!trackData) return null;

    try {
      return JSON.parse(trackData) as DataLayerEventProps;
    } catch (error) {
      console.warn(`[TagTracker] Invalid JSON in ${trackingAttribute} for ${eventName} event:`, error);
      return null;
    }
  };

  const hasExpectedEventRoute = (data: DataLayerEventProps, expectedRoute: string): boolean => {
    return typeof data?.eventTracker === 'string' && data.eventTracker === expectedRoute;
  };

  const findTrackedElement = (target: EventTarget | null): HTMLElement | null => {
    let element = target as HTMLElement | null;

    while (element && !element.hasAttribute(trackingAttribute)) {
      element = element.parentElement;
    }

    return element;
  };

  const handleEvent = useCallback((event: MouseEvent): void => {
    const element = findTrackedElement(event.target);

    if (element) {
      const trackData = element.getAttribute(trackingAttribute);
      const parsedData = parseTrackData(trackData, 'click');

      if (!parsedData) return;

      if (!hasExpectedEventRoute(parsedData, 'click')) return;

      pushToDataLayer(parsedData);
      console.log('[TagTracker] Event:', parsedData);
    }
  }, [trackingAttribute]);

  const handleHoverTracking = useCallback((event: MouseEvent): void => {
    if (enableHoverTracking) {
      const element = findTrackedElement(event.target);

      if (element) {
        const trackData = element.getAttribute(trackingAttribute);
        const parsedData = parseTrackData(trackData, 'hover');

        if (!parsedData) return;

        if (!hasExpectedEventRoute(parsedData, 'hover')) return;

        pushToDataLayer(parsedData);
        console.log('[TagTracker] Hover Event:', parsedData);
      }
    }
  }, [trackingAttribute, enableHoverTracking]);

  const trackCustomEvent = (eventData: DataLayerEventProps) => {
    if (enableCustomTracking) {
      if (typeof eventData !== 'object') {
        console.warn('trackCustomEvent requires an object parameter');
        return;
      }

      pushToDataLayer(eventData);
      console.log('[TagTracker] Custom Event:', eventData);
    }
  };

  useEffect(() => {
    const onClick = (event: MouseEvent) => handleEvent(event);
    const onMouseOver = (event: MouseEvent) => handleHoverTracking(event);

    document.addEventListener('click', onClick);

    if (enableHoverTracking) {
      document.addEventListener('mouseover', onMouseOver);
    }

    let visibilityObserver: IntersectionObserver | null = null;
    let mutationObserver: MutationObserver | null = null;

    if (enableVisibilityTracking) {
      // threshold: 1 approximates the "fully inside the viewport" contract
      // previously enforced by the scroll-based getBoundingClientRect check.
      // root: null (the default) means the viewport.
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const target = entry.target;
            const trackData = target.getAttribute(trackingAttribute);
            const parsedData = parseTrackData(trackData, 'visibility');

            if (!parsedData) continue;
            if (!hasExpectedEventRoute(parsedData, 'visibility')) continue;

            const isFullyVisible =
              entry.isIntersecting && entry.intersectionRatio >= 1;

            if (isFullyVisible) {
              const wasAlreadyVisible = currentlyVisibleRef.current.has(target);
              currentlyVisibleRef.current.add(target);

              if (visibilityTrackingMode === 'once') {
                if (visibilityTrackedOnceRef.current.has(target)) continue;
                visibilityTrackedOnceRef.current.add(target);
                observer.unobserve(target);
                pushToDataLayer(parsedData);
                console.log('[TagTracker] Visibility Event:', parsedData);
              } else {
                // repeat: only fire on the enter transition, not while
                // the element is continuously fully visible.
                if (wasAlreadyVisible) continue;
                pushToDataLayer(parsedData);
                console.log('[TagTracker] Visibility Event:', parsedData);
              }
            } else {
              // The element left full visibility — clear the enter flag
              // so the next re-entry can fire in repeat mode.
              currentlyVisibleRef.current.delete(target);
            }
          }
        },
        { threshold: 1, root: null }
      );

      visibilityObserver = observer;

      const elements = document.querySelectorAll(`[${trackingAttribute}]`);
      elements.forEach((el) => observer.observe(el));

      // Observe tracked elements that are inserted into the DOM after mount.
      // The initial querySelectorAll above only captures elements present at
      // provider setup; this MutationObserver keeps the IntersectionObserver
      // in sync with later additions (e.g. route changes, conditional UI).
      // Removed nodes need no explicit handling: the WeakSet-backed state
      // (visibilityTrackedOnceRef, currentlyVisibleRef) lets GC reclaim
      // entries for detached elements automatically, and the IO simply stops
      // firing for elements that leave the DOM.
      const observeTrackedInSubtree = (root: Node) => {
        if (root.nodeType !== Node.ELEMENT_NODE) return;
        const el = root as Element;
        const matched: Element[] = el.matches(`[${trackingAttribute}]`) ? [el] : [];
        matched.push(...el.querySelectorAll(`[${trackingAttribute}]`));
        matched.forEach((node) => observer.observe(node));
      };

      mutationObserver = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          mutation.addedNodes.forEach((node) => observeTrackedInSubtree(node));
        }
      });
      mutationObserver.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      document.removeEventListener('click', onClick);

      if (enableHoverTracking) {
        document.removeEventListener('mouseover', onMouseOver);
      }

      // Per design: cleanup via disconnect() / unobserve() in useEffect return.
      // disconnect() covers all observed elements; per-element unobserve() for
      // once-mode elements happens at the moment of the first visibility event.
      if (visibilityObserver) {
        visibilityObserver.disconnect();
      }
      if (mutationObserver) {
        mutationObserver.disconnect();
      }
    };
  }, [
    enableHoverTracking,
    enableVisibilityTracking,
    visibilityTrackingMode,
    trackingAttribute,
    handleEvent,
    handleHoverTracking,
  ]);

  return (
    <TagTrackerContext.Provider value={{ trackCustomEvent }}>{children}</TagTrackerContext.Provider>
  );
};

export default TagTrackerProvider;
