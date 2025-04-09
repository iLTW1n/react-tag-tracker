'use client';
import { ReactNode } from 'react';
import { TagTrackerProvider } from 'react-tag-tracker';

type Props = {
  children: ReactNode;
}

export const TagTrackerProviderWrapper = (props: Props) => {
  const { children } = props;
  return <TagTrackerProvider>{children}</TagTrackerProvider>;
}