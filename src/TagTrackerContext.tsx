import { createContext, useContext } from 'react';
import { DataLayerEvent } from './types';

interface TagTrackerContextType {
  trackCustomEvent: (eventData: DataLayerEvent) => void;
}

const TagTrackerContext = createContext<TagTrackerContextType | null>(null);

export const useTagTracker = () => {
  const context = useContext(TagTrackerContext);

  if (!context) throw new Error('useTagTracker must be used within a TagTrackerProvider');
  return context;
};

export default TagTrackerContext;
