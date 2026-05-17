import { render, fireEvent } from './main';
import { useTagTracker } from '../src';
import type { DataLayerEventProps } from '../src';

beforeEach(() => {
  window.dataLayer = [];
});

afterEach(() => {
  window.dataLayer = [];
});

const CustomEventButton = ({ payload }: { payload: DataLayerEventProps }) => {
  const { trackCustomEvent } = useTagTracker();

  return <button onClick={() => trackCustomEvent(payload)}>track</button>;
};

describe('TagTracker Custom Event', () => {
  it('should accept payload objects containing arrays and pass them unchanged', () => {
    const payload = {
      eventTracker: 'custom',
      tags: ['react', 'tag-tracker'],
      nested: {
        categories: ['ui', 'analytics'],
      },
    };

    const { getByRole } = render(<CustomEventButton payload={payload} />);

    fireEvent.click(getByRole('button', { name: 'track' }));

    expect(window.dataLayer).toEqual([payload]);
  });
});
