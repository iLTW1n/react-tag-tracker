import { ReactNode, useEffect } from 'react';
import TagTrackerContext from './TagTrackerContext';
import { DataLayerEvent } from './types';

interface TagTrackerProviderType {
  children: ReactNode;
  trackingAttribute?: string;
  enableHoverTracking?: boolean;
  enableVisibilityTracking?: boolean;
  enableCustomTracking?: boolean;
}

const TagTrackerProvider = (props: TagTrackerProviderType) => {
  const {
    children,
    trackingAttribute = 'data-track',
    enableHoverTracking = false,
    enableVisibilityTracking = false,
    enableCustomTracking = true,
  } = props;

  const handleEvent = (event: MouseEvent): void => {
    let element = event.target as HTMLElement;

    while (element && !element.hasAttribute(trackingAttribute)) {
      element = element.parentElement as HTMLElement;
    }

    if (element) {
      const trackData = element.getAttribute(trackingAttribute);

      try {
        const parsedData: DataLayerEvent = JSON.parse(trackData || '{}');
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(parsedData);
        console.warn('[TagTracker] Event:', parsedData);
      } catch {
        console.warn(`Invalid JSON in ${trackingAttribute} attribute:`, trackData);
      }
    }
  };

  const handleHoverTracking = (event: MouseEvent): void => {
    if (enableHoverTracking) {
      const element = event.target as HTMLElement;

      if (element.hasAttribute(trackingAttribute)) {
        const trackData = element.getAttribute(trackingAttribute);

        try {
          const parsedData: DataLayerEvent = JSON.parse(trackData || '{}');
          parsedData.event = 'hover';
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push(parsedData);
          console.warn('[TagTracker] Hover Event:', parsedData);
        } catch (e) {
          console.warn('Hover event failed:', e);
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
            parsedData.event = 'visibility';
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push(parsedData);
            console.warn('[TagTracker] Visibility Event:', parsedData);
          } catch (e) {
            console.warn('Visibility tracking failed:', e);
          }
        }
      });
    }
  };

  const trackCustomEvent = (eventData: DataLayerEvent) => {
    if (enableCustomTracking) {
      if (typeof eventData !== 'object') {
        console.warn('trackCustomEvent requires an object parameter');
        return;
      }
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(eventData);
      console.warn('[TagTracker] Custom Event:', eventData);
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
