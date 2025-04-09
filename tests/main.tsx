import { render, RenderOptions } from '@testing-library/react';
import { TagTrackerProvider, TagTrackerProviderProps } from '../src';
import { ReactElement } from 'react';

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  providerProps?: Partial<TagTrackerProviderProps>;
}

const customRender = (ui: ReactElement, options?: CustomRenderOptions): ReturnType<typeof render> => {
  return render(
    <TagTrackerProvider {...options?.providerProps}>{ui}</TagTrackerProvider>,
    options
  );
}

export * from "@testing-library/react";
export { customRender as render };