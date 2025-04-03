import { render, fireEvent } from '@testing-library/react';
import { TagTrackerProvider } from '..';

describe('Tag Tracker Provider', () => {
  test('CLICK', () => {
    const { getByText } = render(
      <TagTrackerProvider>
        <button data-track='{"event": "click"}'>Click me</button>
      </TagTrackerProvider>
    );

    fireEvent.click(getByText('Click me'));
    expect(window.dataLayer).toBeDefined();
  });
});
