'use client';
import { ReactNode } from 'react';
import { TagTrackerProvider } from '../../../../dist';

type Props = {
  children: ReactNode;
}

export const TagTrackerProviderWrapper = (props: Props) => {
  const { children } = props;
  return (
    <TagTrackerProvider enableHoverTracking enableVisibilityTracking>
      {children}
    </TagTrackerProvider>
  );
}