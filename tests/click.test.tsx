import { render, fireEvent } from './main';

beforeEach(() => {
  window.dataLayer = [];
});

afterEach(() => {
  window.dataLayer = [];
});

describe('TagTracker Click', () => {
  it('should not click on an element without data-track attribute', () => {
    const { container } = render(<button>click</button>);
    const element = container.querySelector('button');
    expect(element).toBeInTheDocument();
    expect(element).not.toHaveAttribute('data-track');

    fireEvent.click(element!);
    expect(window.dataLayer.length).toBe(0);
    expect(window.dataLayer).toEqual([]);
  });

  it('should click on an element with data-track attribute', () => {
    const { container } = render(<button data-track='{"eventTracker":"click"}'>click</button>);
    const element = container.querySelector('[data-track]');
    expect(element).toBeInTheDocument();
    expect(element).toHaveAttribute('data-track', '{"eventTracker":"click"}');

    fireEvent.click(element!);
    expect(window.dataLayer.length).toBe(1);
    expect(window.dataLayer).toEqual([{ eventTracker: 'click' }]);
  });

  it('should click on all elements with data-track attribute', () => {
    const { container } = render(
      <>
        <button data-track='{"eventTracker":"click", "page":"test1"}'>click1</button>
        <button data-track='{"eventTracker":"click", "page":"test2"}'>click2</button>
      </>
    );
    const elements = container.querySelectorAll('[data-track]');
    expect(elements.length).toBe(2);
    expect(elements[0]).toHaveAttribute('data-track', '{"eventTracker":"click", "page":"test1"}');
    expect(elements[1]).toHaveAttribute('data-track', '{"eventTracker":"click", "page":"test2"}');

    fireEvent.click(elements[0]);
    expect(window.dataLayer.length).toBe(1);
    expect(window.dataLayer).toEqual([{ eventTracker: 'click', page: 'test1' }]);

    fireEvent.click(elements[1]);
    expect(window.dataLayer.length).toBe(2);
    expect(window.dataLayer).toEqual([
      { eventTracker: 'click', page: 'test1' },
      { eventTracker: 'click', page: 'test2' },
    ]);
  });

  it('should click on all elements with data-track attribute and not click on elements without data-track attribute', () => {
    const { container } = render(
      <>
        <button data-track='{"eventTracker":"click", "page":"test1"}'>click1</button>
        <button>click2</button>
        <button data-track='{"eventTracker":"click", "page":"test2"}'>click1</button>
      </>
    );
    const elements = container.querySelectorAll('[data-track]');
    expect(elements.length).toBe(2);
    expect(elements[0]).toHaveAttribute('data-track', '{"eventTracker":"click", "page":"test1"}');
    expect(elements[1]).toHaveAttribute('data-track', '{"eventTracker":"click", "page":"test2"}');

    fireEvent.click(elements[0]);
    expect(window.dataLayer.length).toBe(1);
    expect(window.dataLayer).toEqual([{ eventTracker: 'click', page: 'test1' }]);

    fireEvent.click(elements[1]);
    expect(window.dataLayer.length).toBe(2);
    expect(window.dataLayer).toEqual([
      { eventTracker: 'click', page: 'test1' },
      { eventTracker: 'click', page: 'test2' },
    ]);

    const elementWithoutTrack = container.querySelector('button:not([data-track])');
    fireEvent.click(elementWithoutTrack!);
    expect(window.dataLayer.length).toBe(2);
  });

  it('should click on a child element and track parent element data-track attribute', () => {
    const { container } = render(
      <div data-track='{"eventTracker":"click"}'>
        <div>
          <p>
            <button>click</button>
          </p>
        </div>
      </div>
    );
    const element = container.querySelector('button');
    expect(element).toBeInTheDocument();
    expect(element).not.toHaveAttribute('data-track');

    fireEvent.click(element!);
    expect(window.dataLayer.length).toBe(1);
    expect(window.dataLayer).toEqual([{ eventTracker: 'click' }]);
  });

  it('should ignore invalid JSON and still track next valid click event', () => {
    const { container } = render(
      <>
        <button data-track='{"eventTracker":invalid}'>invalid</button>
        <button data-track='{"eventTracker":"click", "page": "valid"}'>valid</button>
      </>
    );

    const elements = container.querySelectorAll('[data-track]');

    fireEvent.click(elements[0]);
    expect(window.dataLayer).toEqual([]);

    fireEvent.click(elements[1]);
    expect(window.dataLayer).toEqual([{ eventTracker: 'click', page: 'valid' }]);
  });

  it('should not track click when eventTracker is missing', () => {
    const { container } = render(<button data-track='{"page":"missing-event-route"}'>click</button>);
    const element = container.querySelector('[data-track]');

    fireEvent.click(element!);
    expect(window.dataLayer).toEqual([]);
  });

  it('should not track click when eventTracker route is incorrect', () => {
    const { container } = render(<button data-track='{"eventTracker":"hover", "page":"wrong-route"}'>click</button>);
    const element = container.querySelector('[data-track]');

    fireEvent.click(element!);
    expect(window.dataLayer).toEqual([]);
  });

  it('should stop tracking clicks after provider unmount', () => {
    const externalElement = document.createElement('button');
    externalElement.setAttribute('data-track', '{"eventTracker":"click","page":"outside"}');
    document.body.appendChild(externalElement);

    const { unmount } = render(<div>mounted</div>);

    fireEvent.click(externalElement);
    expect(window.dataLayer).toEqual([{ eventTracker: 'click', page: 'outside' }]);

    unmount();
    fireEvent.click(externalElement);
    expect(window.dataLayer).toEqual([{ eventTracker: 'click', page: 'outside' }]);

    externalElement.remove();
  });

  it('should accept click payload objects containing arrays', () => {
    const { container } = render(
      <button data-track='{"eventTracker":"click","tags":["react","tracker"],"meta":{"source":"test"}}'>
        click
      </button>
    );

    const element = container.querySelector('[data-track]');
    fireEvent.click(element!);

    expect(window.dataLayer).toEqual([
      { eventTracker: 'click', tags: ['react', 'tracker'], meta: { source: 'test' } },
    ]);
  });
});
