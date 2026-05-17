import { render } from './main';

beforeEach(() => {
  window.dataLayer = [];
});

afterEach(() => {
  window.dataLayer = [];
});

describe('TagTracker Visibility', () => {
  it('should not track visibility when enableVisibilityTracking is disabled.', () => {
    const { container } = render(<div data-track='{"eventTracker":"visibility"}'>visibility</div>);
    const element = container.querySelector('[data-track]');
    expect(element).toBeInTheDocument();
    expect(element).toHaveAttribute('data-track', '{"eventTracker":"visibility"}');

    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 1000,
    });

    jest.spyOn(element!, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      bottom: 900,
      left: 0,
      right: 0,
      width: 0,
      height: 800,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    window.dispatchEvent(new Event('scroll'));
    expect(window.dataLayer.length).toBe(0);
    expect(window.dataLayer).toEqual([]);
  });

  it('should not track visibility on an element without data-track attribute', () => {
    const { container } = render(<button>click</button>, {
      providerProps: {
        enableVisibilityTracking: true,
      },
    });

    const element = container.querySelector('button');
    expect(element).toBeInTheDocument();
    expect(element).not.toHaveAttribute('data-track');

    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 1000,
    });

    jest.spyOn(element!, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      bottom: 900,
      left: 0,
      right: 0,
      width: 0,
      height: 800,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    window.dispatchEvent(new Event('scroll'));
    expect(window.dataLayer.length).toBe(0);
    expect(window.dataLayer).toEqual([]);
  });

  it('should track visibility on an element with data-track attribute', () => {
    const { container } = render(<button data-track='{"eventTracker":"visibility"}'>click</button>, {
      providerProps: {
        enableVisibilityTracking: true,
      },
    });

    const element = container.querySelector('button');
    expect(element).toBeInTheDocument();
    expect(element).toHaveAttribute('data-track');

    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 1000,
    });

    jest.spyOn(element!, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      bottom: 900,
      left: 0,
      right: 0,
      width: 0,
      height: 800,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    window.dispatchEvent(new Event('scroll'));
    expect(window.dataLayer.length).toBe(1);
    expect(window.dataLayer).toEqual([{ eventTracker: 'visibility' }]);
  });

  it('should track visibility only once per element by default', () => {
    const { container } = render(<button data-track='{"eventTracker":"visibility","page":"default-once"}'>default once</button>, {
      providerProps: {
        enableVisibilityTracking: true,
      },
    });

    const element = container.querySelector('button');

    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 1000,
    });

    jest.spyOn(element!, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      bottom: 900,
      left: 0,
      right: 0,
      width: 0,
      height: 800,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    window.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('scroll'));

    expect(window.dataLayer).toEqual([{ eventTracker: 'visibility', page: 'default-once' }]);
  });

  it('should track visibility repeatedly when visibilityTrackingMode is repeat', () => {
    const { container } = render(<button data-track='{"eventTracker":"visibility","page":"repeat-mode"}'>repeat mode</button>, {
      providerProps: {
        enableVisibilityTracking: true,
        visibilityTrackingMode: 'repeat',
      },
    });

    const element = container.querySelector('button');

    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 1000,
    });

    jest.spyOn(element!, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      bottom: 900,
      left: 0,
      right: 0,
      width: 0,
      height: 800,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    window.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('scroll'));

    expect(window.dataLayer).toEqual([
      { eventTracker: 'visibility', page: 'repeat-mode' },
      { eventTracker: 'visibility', page: 'repeat-mode' },
    ]);
  });

  it('should track visibility on all elements with data-track attribute', () => {
    const { container } = render(
      <>
        <button data-track='{"eventTracker":"visibility", "page": "test1"}'>hover1</button>
        <button data-track='{"eventTracker":"visibility", "page": "test2"}'>hover2</button>
      </>,
      {
        providerProps: {
          enableVisibilityTracking: true,
        },
      }
    );
    const elements = container.querySelectorAll('[data-track]');
    expect(elements.length).toBe(2);
    expect(elements[0]).toHaveAttribute('data-track', '{"eventTracker":"visibility", "page": "test1"}');
    expect(elements[1]).toHaveAttribute('data-track', '{"eventTracker":"visibility", "page": "test2"}');

    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 1000,
    });

    jest.spyOn(elements[0], 'getBoundingClientRect').mockReturnValue({
      top: 100,
      bottom: 900,
      left: 0,
      right: 0,
      width: 0,
      height: 800,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    jest.spyOn(elements[1], 'getBoundingClientRect').mockReturnValue({
      top: 100,
      bottom: 900,
      left: 0,
      right: 0,
      width: 0,
      height: 800,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    window.dispatchEvent(new Event('scroll'));

    expect(window.dataLayer.length).toBe(2);
    expect(window.dataLayer).toEqual([
      { eventTracker: 'visibility', page: 'test1' },
      { eventTracker: 'visibility', page: 'test2' },
    ]);
  });

  it('should track visibility on all elements with data-track attribute and not on elements without data-track attribute', () => {
    const { container } = render(
      <>
        <button data-track='{"eventTracker":"visibility", "page": "test1"}'>click1</button>
        <button>click2</button>
        <button data-track='{"eventTracker":"visibility", "page": "test2"}'>click1</button>
      </>,
      {
        providerProps: {
          enableVisibilityTracking: true,
        },
      }
    );
    const elements = container.querySelectorAll('[data-track]');
    expect(elements.length).toBe(2);
    expect(elements[0]).toHaveAttribute('data-track', '{"eventTracker":"visibility", "page": "test1"}');
    expect(elements[1]).toHaveAttribute('data-track', '{"eventTracker":"visibility", "page": "test2"}');

    jest.spyOn(elements[0], 'getBoundingClientRect').mockReturnValue({
      top: 100,
      bottom: 900,
      left: 0,
      right: 0,
      width: 0,
      height: 800,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    jest.spyOn(elements[1], 'getBoundingClientRect').mockReturnValue({
      top: 100,
      bottom: 900,
      left: 0,
      right: 0,
      width: 0,
      height: 800,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    window.dispatchEvent(new Event('scroll'));
    expect(window.dataLayer.length).toBe(2);
    expect(window.dataLayer).toEqual([
      { eventTracker: 'visibility', page: 'test1' },
      { eventTracker: 'visibility', page: 'test2' },
    ]);

    const elementWithoutTrack = container.querySelector('button:not([data-track])');

    jest.spyOn(elementWithoutTrack!, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      bottom: 900,
      left: 0,
      right: 0,
      width: 0,
      height: 800,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    expect(window.dataLayer.length).toBe(2);
  });

  it('should ignore invalid JSON and still track next valid visibility event', () => {
    const { container } = render(
      <>
        <button data-track='{"eventTracker":invalid}'>invalid</button>
        <button data-track='{"eventTracker":"visibility", "page": "valid"}'>valid</button>
      </>,
      {
        providerProps: {
          enableVisibilityTracking: true,
        },
      }
    );

    const elements = container.querySelectorAll('[data-track]');

    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 1000,
    });

    jest.spyOn(elements[0], 'getBoundingClientRect').mockReturnValue({
      top: 100,
      bottom: 900,
      left: 0,
      right: 0,
      width: 0,
      height: 800,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    jest.spyOn(elements[1], 'getBoundingClientRect').mockReturnValue({
      top: 100,
      bottom: 900,
      left: 0,
      right: 0,
      width: 0,
      height: 800,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    window.dispatchEvent(new Event('scroll'));
    expect(window.dataLayer).toEqual([{ eventTracker: 'visibility', page: 'valid' }]);
  });

  it('should not track visibility when eventTracker is missing', () => {
    const { container } = render(<button data-track='{"page":"missing-event-route"}'>visibility</button>, {
      providerProps: {
        enableVisibilityTracking: true,
      },
    });

    const element = container.querySelector('[data-track]');

    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 1000,
    });

    jest.spyOn(element!, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      bottom: 900,
      left: 0,
      right: 0,
      width: 0,
      height: 800,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    window.dispatchEvent(new Event('scroll'));
    expect(window.dataLayer).toEqual([]);
  });

  it('should not track visibility when eventTracker route is incorrect', () => {
    const { container } = render(<button data-track='{"eventTracker":"hover", "page":"wrong-route"}'>visibility</button>, {
      providerProps: {
        enableVisibilityTracking: true,
      },
    });

    const element = container.querySelector('[data-track]');

    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 1000,
    });

    jest.spyOn(element!, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      bottom: 900,
      left: 0,
      right: 0,
      width: 0,
      height: 800,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    window.dispatchEvent(new Event('scroll'));
    expect(window.dataLayer).toEqual([]);
  });

  it('should stop tracking visibility after provider unmount', () => {
    const externalElement = document.createElement('div');
    externalElement.setAttribute('data-track', '{"eventTracker":"visibility","page":"outside"}');
    document.body.appendChild(externalElement);

    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 1000,
    });

    jest.spyOn(externalElement, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      bottom: 900,
      left: 0,
      right: 0,
      width: 0,
      height: 800,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    const { unmount } = render(<div>mounted</div>, {
      providerProps: {
        enableVisibilityTracking: true,
      },
    });

    window.dispatchEvent(new Event('scroll'));
    expect(window.dataLayer).toEqual([{ eventTracker: 'visibility', page: 'outside' }]);

    unmount();
    window.dispatchEvent(new Event('scroll'));
    expect(window.dataLayer).toEqual([{ eventTracker: 'visibility', page: 'outside' }]);

    externalElement.remove();
  });
});
