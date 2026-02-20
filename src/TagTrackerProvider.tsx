import { useEffect } from 'react';
import TagTrackerContext from './TagTrackerContext';
import { DataLayerEventProps, TagTrackerProviderProps } from './types';

const TagTrackerProvider = (props: TagTrackerProviderProps) => {
  const {
    children,
    trackingAttribute = 'data-track',
    enableHoverTracking = false,
    enableVisibilityTracking = false,
    enableCustomTracking = true,
  } = props;

  const pushToDataLayer = (data: DataLayerEventProps) => {
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(data);
    } catch (error) {
      console.warn('Failed to push to dataLayer:', error);
    }
  }

  const handleEvent = (event: MouseEvent): void => {
    let element = event.target as HTMLElement;

    while (element && !element.hasAttribute(trackingAttribute)) {
      element = element.parentElement as HTMLElement;
    }

    if (element) {
      const trackData = element.getAttribute(trackingAttribute);

      try {
        const parsedData: DataLayerEventProps = JSON.parse(trackData || '{}');

        if (['hover', 'visibility'].includes(parsedData.eventTracker)) return;
        if (!parsedData.eventTracker) throw new Error('Event property is required');

        pushToDataLayer(parsedData);
        console.log('[TagTracker] Event:', parsedData);
      } catch (error) {
        console.warn('Click event failed:', error);
      }
    }
  };

  const handleHoverTracking = (event: MouseEvent): void => {
    if (enableHoverTracking) {
      let element = event.target as HTMLElement;

      while (element && !element.hasAttribute(trackingAttribute)) {
        element = element.parentElement as HTMLElement;
      }
      if (element) {
        const trackData = element.getAttribute(trackingAttribute);

        try {
          const parsedData: DataLayerEventProps = JSON.parse(trackData || '{}');

          if (parsedData.eventTracker !== 'hover') return;

          pushToDataLayer(parsedData);
          console.log('[TagTracker] Hover Event:', parsedData);
        } catch (error) {
          console.warn('Hover event failed:', error);
        }
      }
    }
  };

  const handleVisibilityTracking = () => {
    if (enableVisibilityTracking) {
      const elements = document.querySelectorAll(`[${trackingAttribute}]`);

      elements.forEach((element) => {
        const trackData = element.getAttribute(trackingAttribute);
        const rect = element.getBoundingClientRect();

        if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
          try {
            const parsedData = JSON.parse(trackData || '{}');

            if (parsedData.eventTracker !== 'visibility') return;

            pushToDataLayer(parsedData);
            console.log('[TagTracker] Visibility Event:', parsedData);
            window.removeEventListener('scroll', handleVisibilityTracking);
          } catch (error) {
            console.warn('Visibility tracking failed:', error);
          }
        }
      });
    }
  };

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
    document.addEventListener('click', handleEvent);

    if (enableHoverTracking) {
      document.addEventListener('mouseover', handleHoverTracking);
    }

    if (enableVisibilityTracking) {
      window.addEventListener('scroll', handleVisibilityTracking);
    }

    return () => {
      document.removeEventListener('click', handleEvent);

      if (enableHoverTracking) {
        document.removeEventListener('mouseover', handleHoverTracking);
      }

      if (enableVisibilityTracking) {
        window.removeEventListener('scroll', handleVisibilityTracking);
      }
    };
  }, [trackingAttribute, enableHoverTracking, enableVisibilityTracking, enableCustomTracking]);

  return (
    <TagTrackerContext.Provider value={{ trackCustomEvent }}>{children}</TagTrackerContext.Provider>
  );
};

export default TagTrackerProvider;
