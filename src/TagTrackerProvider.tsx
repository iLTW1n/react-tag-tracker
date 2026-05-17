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

  const visibilityTrackedElementsRef = useRef<WeakSet<Element>>(new WeakSet());

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

  const handleVisibilityTracking = useCallback(() => {
    if (enableVisibilityTracking) {
      const elements = document.querySelectorAll(`[${trackingAttribute}]`);

      elements.forEach((element) => {
        const trackData = element.getAttribute(trackingAttribute);
        const rect = element.getBoundingClientRect();

        if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
          const parsedData = parseTrackData(trackData, 'visibility');

          if (!parsedData) return;

          if (!hasExpectedEventRoute(parsedData, 'visibility')) return;

          const shouldTrackOnce = visibilityTrackingMode === 'once';
          if (shouldTrackOnce && visibilityTrackedElementsRef.current.has(element)) {
            return;
          }

          if (shouldTrackOnce) {
            visibilityTrackedElementsRef.current.add(element);
          }

          pushToDataLayer(parsedData);
          console.log('[TagTracker] Visibility Event:', parsedData);
        }
      });
    }
  }, [trackingAttribute, enableVisibilityTracking, visibilityTrackingMode]);

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
    const onScroll = () => handleVisibilityTracking();

    document.addEventListener('click', onClick);

    if (enableHoverTracking) {
      document.addEventListener('mouseover', onMouseOver);
    }

    if (enableVisibilityTracking) {
      window.addEventListener('scroll', onScroll);
    }

    return () => {
      document.removeEventListener('click', onClick);

      if (enableHoverTracking) {
        document.removeEventListener('mouseover', onMouseOver);
      }

      if (enableVisibilityTracking) {
        window.removeEventListener('scroll', onScroll);
      }
    };
  }, [enableHoverTracking, enableVisibilityTracking, handleEvent, handleHoverTracking, handleVisibilityTracking]);

  return (
    <TagTrackerContext.Provider value={{ trackCustomEvent }}>{children}</TagTrackerContext.Provider>
  );
};

export default TagTrackerProvider;
