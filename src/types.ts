import { ReactNode } from 'react';

type DataPrefixedString = `data-${string}`;

export interface DataLayerEventProps {
  eventTracker: 'click' | 'hover' | 'visibility' | string;
  [key: string]: string;
}

export interface TagTrackerProviderProps {
  children: ReactNode;
  trackingAttribute?: DataPrefixedString;
  enableHoverTracking?: boolean;
  enableVisibilityTracking?: boolean;
  enableCustomTracking?: boolean;
}