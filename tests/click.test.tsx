import { render, fireEvent } from './main.test';

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
    const { container } = render(<button data-track='{"event":"test"}'>click</button>);
    const element = container.querySelector('[data-track]');
    expect(element).toBeInTheDocument();
    expect(element).toHaveAttribute('data-track', '{"event":"test"}');

    fireEvent.click(element!);
    expect(window.dataLayer.length).toBe(1);
    expect(window.dataLayer).toEqual([{ event: 'test' }]);
  });

  it('should click on all elements with data-track attribute', () => {
    const { container } = render(
      <>
        <button data-track='{"event":"test1"}'>click1</button>
        <button data-track='{"event":"test2"}'>click2</button>
      </>
    );
    const elements = container.querySelectorAll('[data-track]');
    expect(elements.length).toBe(2);
    expect(elements[0]).toHaveAttribute('data-track', '{"event":"test1"}');
    expect(elements[1]).toHaveAttribute('data-track', '{"event":"test2"}');

    fireEvent.click(elements[0]);
    expect(window.dataLayer.length).toBe(1);
    expect(window.dataLayer).toEqual([{ event: 'test1' }]);

    fireEvent.click(elements[1]);
    expect(window.dataLayer.length).toBe(2);
    expect(window.dataLayer).toEqual([{ event: 'test1' }, { event: 'test2' }]);
  });

  it('should click on all elements with data-track attribut and not click on elements without data-track attribute', () => {
    const { container } = render(
      <>
        <button data-track='{"event":"test1"}'>click1</button>
        <button>click2</button>
        <button data-track='{"event":"test2"}'>click1</button>
      </>
    );
    const elements = container.querySelectorAll('[data-track]');
    expect(elements.length).toBe(2);
    expect(elements[0]).toHaveAttribute('data-track', '{"event":"test1"}');
    expect(elements[1]).toHaveAttribute('data-track', '{"event":"test2"}');

    fireEvent.click(elements[0]);
    expect(window.dataLayer.length).toBe(1);
    expect(window.dataLayer).toEqual([{ event: 'test1' }]);

    fireEvent.click(elements[1]);
    expect(window.dataLayer.length).toBe(2);
    expect(window.dataLayer).toEqual([{ event: 'test1' }, { event: 'test2' }]);

    const elementWithoutTrack = container.querySelector('button:not([data-track])');
    fireEvent.click(elementWithoutTrack!);
    expect(window.dataLayer.length).toBe(2);
  });
});