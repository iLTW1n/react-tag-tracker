import { render } from './main.test';

beforeEach(() => {
  window.dataLayer = [];
});

afterEach(() => {
  window.dataLayer = [];
});

describe('TagTracker Visibility', () => {
  it('should not visible an element without the enableVisibilityTracking attribute activated.', () => {
    const { container } = render(<div data-track='{"event":"visibility"}'>visibility</div>);
    const element = container.querySelector('[data-track]');
    expect(element).toBeInTheDocument();
    expect(element).toHaveAttribute('data-track', '{"event":"visibility"}');

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

  it('should not visible on an element without data-track attribute', () => {
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

  it('should visibility on an element with data-track attribute', () => {
    const { container } = render(<button data-track='{"event":"visibility"}'>click</button>, {
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
    expect(window.dataLayer).toEqual([{ event: 'visibility' }]);
  });

  it('should visibility on all elements with data-track attribute', () => {
    const { container } = render(
      <>
        <button data-track='{"event":"visibility", "page": "test1"}'>hover1</button>
        <button data-track='{"event":"visibility", "page": "test2"}'>hover2</button>
      </>,
      {
        providerProps: {
          enableVisibilityTracking: true,
        },
      }
    );
    const elements = container.querySelectorAll('[data-track]');
    expect(elements.length).toBe(2);
    expect(elements[0]).toHaveAttribute('data-track', '{"event":"visibility", "page": "test1"}');
    expect(elements[1]).toHaveAttribute('data-track', '{"event":"visibility", "page": "test2"}');

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
      { event: 'visibility', page: 'test1' },
      { event: 'visibility', page: 'test2' },
    ]);
  });

  it('should visibility on all elements with data-track attribute and not visibile on elements without data-track attribute', () => {
    const { container } = render(
      <>
        <button data-track='{"event":"visibility", "page": "test1"}'>click1</button>
        <button>click2</button>
        <button data-track='{"event":"visibility", "page": "test2"}'>click1</button>
      </>,
      {
        providerProps: {
          enableVisibilityTracking: true,
        },
      }
    );
    const elements = container.querySelectorAll('[data-track]');
    expect(elements.length).toBe(2);
    expect(elements[0]).toHaveAttribute('data-track', '{"event":"visibility", "page": "test1"}');
    expect(elements[1]).toHaveAttribute('data-track', '{"event":"visibility", "page": "test2"}');

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
      { event: 'visibility', page: 'test1' },
      { event: 'visibility', page: 'test2' },
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
});
