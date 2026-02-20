import { render, fireEvent } from './main';

beforeEach(() => {
  window.dataLayer = [];
});

afterEach(() => {
  window.dataLayer = [];
});

describe('TagTracker Hover', () => {
  it('should not hover over an element without the enableHoverTracking attribute activated.', () => {
    const { container } = render(<button data-track='{"eventTracker":"hover"}'>hover</button>);
    const element = container.querySelector('[data-track]');
    expect(element).toBeInTheDocument();
    expect(element).toHaveAttribute('data-track', '{"eventTracker":"hover"}');

    fireEvent.mouseOver(element!);
    expect(window.dataLayer.length).toBe(0);
    expect(window.dataLayer).toEqual([]);
  });

  it('should not hover on an element without data-track attribute', () => {
    const { container } = render(<button>click</button>);
    const element = container.querySelector('button');
    expect(element).toBeInTheDocument();
    expect(element).not.toHaveAttribute('data-track');

    fireEvent.mouseOver(element!);
    expect(window.dataLayer.length).toBe(0);
    expect(window.dataLayer).toEqual([]);
  });

  it('should hover on an element with data-track attribute', () => {
    const { container } = render(<button data-track='{"eventTracker":"hover"}'>click</button>, {
      providerProps: {
        enableHoverTracking: true,
      },
    });
    const element = container.querySelector('[data-track]');
    expect(element).toBeInTheDocument();
    expect(element).toHaveAttribute('data-track', '{"eventTracker":"hover"}');

    fireEvent.mouseOver(element!);
    expect(window.dataLayer.length).toBe(1);
    expect(window.dataLayer).toEqual([{ eventTracker: 'hover' }]);
  });

  it('should hover on all elements with data-track attribute', () => {
    const { container } = render(
      <>
        <button data-track='{"eventTracker":"hover", "page": "test1"}'>hover1</button>
        <button data-track='{"eventTracker":"hover", "page": "test2"}'>hover2</button>
      </>,
      {
        providerProps: {
          enableHoverTracking: true,
        },
      }
    );
    const elements = container.querySelectorAll('[data-track]');
    expect(elements.length).toBe(2);
    expect(elements[0]).toHaveAttribute('data-track', '{"eventTracker":"hover", "page": "test1"}');
    expect(elements[1]).toHaveAttribute('data-track', '{"eventTracker":"hover", "page": "test2"}');

    fireEvent.mouseOver(elements[0]);
    expect(window.dataLayer.length).toBe(1);
    expect(window.dataLayer).toEqual([{ eventTracker: 'hover', page: 'test1' }]);

    fireEvent.mouseOver(elements[1]);
    expect(window.dataLayer.length).toBe(2);
    expect(window.dataLayer).toEqual([
      { eventTracker: 'hover', page: 'test1' },
      { eventTracker: 'hover', page: 'test2' },
    ]);
  });

  it('should hover on all elements with data-track attribut and not click on elements without data-track attribute', () => {
    const { container } = render(
      <>
        <button data-track='{"eventTracker":"hover", "page": "test1"}'>click1</button>
        <button>click2</button>
        <button data-track='{"eventTracker":"hover", "page": "test2"}'>click1</button>
      </>,
      {
        providerProps: {
          enableHoverTracking: true,
        },
      }
    );
    const elements = container.querySelectorAll('[data-track]');
    expect(elements.length).toBe(2);
    expect(elements[0]).toHaveAttribute('data-track', '{"eventTracker":"hover", "page": "test1"}');
    expect(elements[1]).toHaveAttribute('data-track', '{"eventTracker":"hover", "page": "test2"}');

    fireEvent.mouseOver(elements[0]);
    expect(window.dataLayer.length).toBe(1);
    expect(window.dataLayer).toEqual([{ eventTracker: 'hover', page: 'test1' }]);

    fireEvent.mouseOver(elements[1]);
    expect(window.dataLayer.length).toBe(2);
    expect(window.dataLayer).toEqual([
      { eventTracker: 'hover', page: 'test1' },
      { eventTracker: 'hover', page: 'test2' },
    ]);

    const elementWithoutTrack = container.querySelector('button:not([data-track])');
    fireEvent.mouseOver(elementWithoutTrack!);
    expect(window.dataLayer.length).toBe(2);
  });

  it('should hover on an child element and parent element with data-track attribute', () => {
    const { container } = render(
      <div data-track='{"eventTracker":"hover", "page": "test"}'>
        <div>
          <p>
            <button>click</button>
          </p>
        </div>
      </div>,
      {
        providerProps: {
          enableHoverTracking: true,
        },
      }
    );
    const element = container.querySelector('button');
    expect(element).toBeInTheDocument();
    expect(element).not.toHaveAttribute('data-track');

    fireEvent.mouseOver(element!);
    expect(window.dataLayer.length).toBe(1);
    expect(window.dataLayer).toEqual([{ eventTracker: 'hover', page: 'test' }]);
  });
});
