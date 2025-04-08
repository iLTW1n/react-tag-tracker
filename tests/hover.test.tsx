import { render, fireEvent } from './main.test';

beforeEach(() => {
  window.dataLayer = [];
});

afterEach(() => {
  window.dataLayer = [];
});

describe('TagTracker Hover', () => {
  it('should not hover over an element without the enableHoverTracking attribute activated.', () => {
    const { container } = render(<button data-track='{"event":"hover"}'>hover</button>);
    const element = container.querySelector('[data-track]');
    expect(element).toBeInTheDocument();
    expect(element).toHaveAttribute('data-track', '{"event":"hover"}');

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
    const { container } = render(<button data-track='{"event":"hover"}'>click</button>, {
      providerProps: {
        enableHoverTracking: true,
      },
    });
    const element = container.querySelector('[data-track]');
    expect(element).toBeInTheDocument();
    expect(element).toHaveAttribute('data-track', '{"event":"hover"}');

    fireEvent.mouseOver(element!);
    expect(window.dataLayer.length).toBe(1);
    expect(window.dataLayer).toEqual([{ event: 'hover' }]);
  });
});