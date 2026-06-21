import { render } from './main';

// ----- IntersectionObserver mock (jsdom does not implement it) -----
//
// Local to this file on purpose: the migration is isolated and only
// visibility tests need observer orchestration in jsdom. Mirrors the
// design decision in design.md ("Test mock location").

type MockObserverOptions = IntersectionObserverInit;

class MockIntersectionObserver {
  static allInstances: MockIntersectionObserver[] = [];
  static lastInstance: MockIntersectionObserver | null = null;

  callback: IntersectionObserverCallback;
  options: MockObserverOptions | undefined;
  observed: Set<Element> = new Set();
  observe = jest.fn((el: Element) => {
    this.observed.add(el);
  });
  unobserve = jest.fn((el: Element) => {
    this.observed.delete(el);
  });
  disconnect = jest.fn(() => {
    this.observed.clear();
  });
  takeRecords = jest.fn(() => [] as IntersectionObserverEntry[]);
  root: Element | Document | null = null;
  rootMargin = '0px';
  thresholds: ReadonlyArray<number> = [];

  constructor(callback: IntersectionObserverCallback, options?: MockObserverOptions) {
    this.callback = callback;
    this.options = options;
    if (options?.threshold !== undefined) {
      this.thresholds = Array.isArray(options.threshold)
        ? options.threshold
        : [options.threshold];
    }
    if (options?.root !== undefined) {
      this.root = options.root;
    }
    MockIntersectionObserver.lastInstance = this;
    MockIntersectionObserver.allInstances.push(this);
  }
}

/**
 * Drive a visibility state for the given elements through the observer's
 * callback, as if the browser had just reported their intersection state.
 * Default is "fully visible" (isIntersecting=true, intersectionRatio=1).
 */
function emitVisibilityEntries(
  observer: MockIntersectionObserver,
  elements: Element[],
  isIntersecting = true,
  intersectionRatio = 1
): void {
  const entries = elements.map((target) => ({
    isIntersecting,
    intersectionRatio,
    target,
    boundingClientRect: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRectReadOnly,
    intersectionRect: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRectReadOnly,
    rootBounds: null,
    time: Date.now(),
  })) as unknown as IntersectionObserverEntry[];
  observer.callback(entries, observer as unknown as IntersectionObserver);
}

beforeEach(() => {
  window.dataLayer = [];
  MockIntersectionObserver.allInstances = [];
  MockIntersectionObserver.lastInstance = null;
  (global as unknown as { IntersectionObserver: typeof MockIntersectionObserver }).IntersectionObserver =
    MockIntersectionObserver;
});

afterEach(() => {
  window.dataLayer = [];
  delete (global as unknown as { IntersectionObserver?: unknown }).IntersectionObserver;
});

// ----- Tests -----

describe('TagTracker Visibility', () => {
  it('should not track visibility when enableVisibilityTracking is disabled.', () => {
    const { container } = render(<div data-track='{"eventTracker":"visibility"}'>visibility</div>);
    const element = container.querySelector('[data-track]');
    expect(element).toBeInTheDocument();
    expect(element).toHaveAttribute('data-track', '{"eventTracker":"visibility"}');

    // No IntersectionObserver should be created when visibility tracking is off.
    expect(MockIntersectionObserver.lastInstance).toBeNull();
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

    // The observer is created (visibility tracking is enabled) but the
    // un-tracked button must not be observed.
    const observer = MockIntersectionObserver.lastInstance!;
    expect(observer.observed.size).toBe(0);
    expect(window.dataLayer).toEqual([]);
  });

  it('should track visibility on an element with data-track attribute', () => {
    const { container } = render(
      <button data-track='{"eventTracker":"visibility"}'>click</button>,
      {
        providerProps: {
          enableVisibilityTracking: true,
        },
      }
    );

    const element = container.querySelector('button') as Element;
    expect(element).toBeInTheDocument();
    expect(element).toHaveAttribute('data-track');

    const observer = MockIntersectionObserver.lastInstance!;
    emitVisibilityEntries(observer, [element]);

    expect(window.dataLayer.length).toBe(1);
    expect(window.dataLayer).toEqual([{ eventTracker: 'visibility' }]);
  });

  it('should track visibility only once per element by default', () => {
    const { container } = render(
      <button data-track='{"eventTracker":"visibility","page":"default-once"}'>default once</button>,
      {
        providerProps: {
          enableVisibilityTracking: true,
        },
      }
    );

    const element = container.querySelector('button') as Element;
    const observer = MockIntersectionObserver.lastInstance!;

    // First full-visibility entry — pushes once and unobserves the element.
    emitVisibilityEntries(observer, [element]);
    // The element must be unobserved right after the first push (once mode).
    expect(observer.unobserve).toHaveBeenCalledWith(element);
    // A second full-visibility entry for the same element must NOT push again.
    emitVisibilityEntries(observer, [element]);

    expect(window.dataLayer).toEqual([{ eventTracker: 'visibility', page: 'default-once' }]);
  });

  it('should track visibility repeatedly when visibilityTrackingMode is repeat', () => {
    const { container } = render(
      <button data-track='{"eventTracker":"visibility","page":"repeat-mode"}'>repeat mode</button>,
      {
        providerProps: {
          enableVisibilityTracking: true,
          visibilityTrackingMode: 'repeat',
        },
      }
    );

    const element = container.querySelector('button') as Element;
    const observer = MockIntersectionObserver.lastInstance!;

    // Enter (initial full visibility) — pushes once.
    emitVisibilityEntries(observer, [element]);
    // Continuous visibility — must NOT push again (currentlyVisible ref is set).
    emitVisibilityEntries(observer, [element]);
    // Exit (leaves the viewport) — currentlyVisible ref is cleared, no push.
    emitVisibilityEntries(observer, [element], false, 0);
    // Re-enter — pushes a second time.
    emitVisibilityEntries(observer, [element]);

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

    const observer = MockIntersectionObserver.lastInstance!;
    emitVisibilityEntries(observer, Array.from(elements));

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

    const observer = MockIntersectionObserver.lastInstance!;
    emitVisibilityEntries(observer, Array.from(elements));

    expect(window.dataLayer.length).toBe(2);
    expect(window.dataLayer).toEqual([
      { eventTracker: 'visibility', page: 'test1' },
      { eventTracker: 'visibility', page: 'test2' },
    ]);

    // The un-tracked element must never have been observed by the IO.
    const elementWithoutTrack = container.querySelector('button:not([data-track])');
    expect(elementWithoutTrack).toBeInTheDocument();
    expect(observer.observed.has(elementWithoutTrack!)).toBe(false);
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
    const observer = MockIntersectionObserver.lastInstance!;
    emitVisibilityEntries(observer, Array.from(elements));

    expect(window.dataLayer).toEqual([{ eventTracker: 'visibility', page: 'valid' }]);
  });

  it('should not track visibility when eventTracker is missing', () => {
    const { container } = render(
      <button data-track='{"page":"missing-event-route"}'>visibility</button>,
      {
        providerProps: {
          enableVisibilityTracking: true,
        },
      }
    );

    const element = container.querySelector('[data-track]') as Element;
    const observer = MockIntersectionObserver.lastInstance!;
    emitVisibilityEntries(observer, [element]);

    expect(window.dataLayer).toEqual([]);
  });

  it('should not track visibility when eventTracker route is incorrect', () => {
    const { container } = render(
      <button data-track='{"eventTracker":"hover", "page":"wrong-route"}'>visibility</button>,
      {
        providerProps: {
          enableVisibilityTracking: true,
        },
      }
    );

    const element = container.querySelector('[data-track]') as Element;
    const observer = MockIntersectionObserver.lastInstance!;
    emitVisibilityEntries(observer, [element]);

    expect(window.dataLayer).toEqual([]);
  });

  it('should stop tracking visibility after provider unmount', () => {
    const externalElement = document.createElement('div');
    externalElement.setAttribute('data-track', '{"eventTracker":"visibility","page":"outside"}');
    document.body.appendChild(externalElement);

    const { unmount } = render(<div>mounted</div>, {
      providerProps: {
        enableVisibilityTracking: true,
      },
    });

    const observer = MockIntersectionObserver.lastInstance!;
    emitVisibilityEntries(observer, [externalElement]);
    expect(window.dataLayer).toEqual([{ eventTracker: 'visibility', page: 'outside' }]);

    unmount();

    // The provider must call disconnect() on the observer when it tears down.
    expect(observer.disconnect).toHaveBeenCalled();

    externalElement.remove();
  });

  it('should not push visibility when the element is only partially visible (intersectionRatio < 1)', () => {
    const { container } = render(
      <button data-track='{"eventTracker":"visibility","page":"partial"}'>partial</button>,
      {
        providerProps: {
          enableVisibilityTracking: true,
        },
      }
    );

    const element = container.querySelector('button') as Element;
    const observer = MockIntersectionObserver.lastInstance!;

    // Partial visibility — must NOT push (threshold is 1, full visibility required).
    emitVisibilityEntries(observer, [element], true, 0.5);

    expect(window.dataLayer).toEqual([]);
  });

  it('should not push visibility when the element is not intersecting', () => {
    const { container } = render(
      <button data-track='{"eventTracker":"visibility","page":"hidden"}'>hidden</button>,
      {
        providerProps: {
          enableVisibilityTracking: true,
        },
      }
    );

    const element = container.querySelector('button') as Element;
    const observer = MockIntersectionObserver.lastInstance!;

    // Not intersecting at all — must NOT push.
    emitVisibilityEntries(observer, [element], false, 0);

    expect(window.dataLayer).toEqual([]);
  });

  it('should not attach a window scroll listener (old visibility path is removed)', () => {
    const addSpy = jest.spyOn(window, 'addEventListener');
    const removeSpy = jest.spyOn(window, 'removeEventListener');

    render(
      <button data-track='{"eventTracker":"visibility","page":"no-scroll"}'>no scroll</button>,
      {
        providerProps: {
          enableVisibilityTracking: true,
        },
      }
    );

    // The provider must not register a `scroll` listener on `window` — the
    // old scroll-based visibility path is fully replaced by IntersectionObserver.
    const scrollRegistrations = addSpy.mock.calls.filter(([type]) => type === 'scroll');
    expect(scrollRegistrations).toHaveLength(0);

    // Dispatching a scroll event must not push anything to dataLayer.
    window.dispatchEvent(new Event('scroll'));
    expect(window.dataLayer).toEqual([]);

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  // ----- Dynamic insertion (regression: tracked elements added after mount) -----
  //
  // These tests prove the fix for the release blocker where the provider only
  // observed elements present at mount time. The MutationObserver flushes
  // asynchronously (microtask in jsdom / browsers), so the tests await a
  // macrotask tick before asserting the observer state.

  it('should observe tracked elements added to the DOM after provider mount', async () => {
    render(<div>initial</div>, {
      providerProps: {
        enableVisibilityTracking: true,
      },
    });

    const observer = MockIntersectionObserver.lastInstance!;
    // Sanity: nothing tracked at mount.
    expect(observer.observed.size).toBe(0);

    // Insert a tracked element AFTER the provider has set up its observers.
    const dynamicElement = document.createElement('button');
    dynamicElement.setAttribute('data-track', '{"eventTracker":"visibility","page":"dynamic"}');
    document.body.appendChild(dynamicElement);

    // Wait for the MutationObserver microtask to flush.
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(observer.observed.has(dynamicElement)).toBe(true);

    emitVisibilityEntries(observer, [dynamicElement]);

    expect(window.dataLayer).toEqual([{ eventTracker: 'visibility', page: 'dynamic' }]);

    dynamicElement.remove();
  });

  it('should observe nested tracked elements when a parent subtree is added after mount', async () => {
    render(<div>initial</div>, {
      providerProps: {
        enableVisibilityTracking: true,
      },
    });

    const observer = MockIntersectionObserver.lastInstance!;

    // Insert an untracked wrapper that contains two tracked descendants.
    const wrapper = document.createElement('section');
    wrapper.innerHTML = `
      <button data-track='{"eventTracker":"visibility","page":"nested-1"}'>a</button>
      <button data-track='{"eventTracker":"visibility","page":"nested-2"}'>b</button>
    `;
    document.body.appendChild(wrapper);

    await new Promise((resolve) => setTimeout(resolve, 0));

    const nestedButtons = wrapper.querySelectorAll('[data-track]');
    expect(nestedButtons.length).toBe(2);
    expect(observer.observed.has(nestedButtons[0])).toBe(true);
    expect(observer.observed.has(nestedButtons[1])).toBe(true);

    emitVisibilityEntries(observer, Array.from(nestedButtons));

    expect(window.dataLayer).toEqual([
      { eventTracker: 'visibility', page: 'nested-1' },
      { eventTracker: 'visibility', page: 'nested-2' },
    ]);

    wrapper.remove();
  });

  it('should track dynamically inserted elements exactly once in once mode (default)', async () => {
    render(<div>initial</div>, {
      providerProps: {
        enableVisibilityTracking: true,
      },
    });

    const observer = MockIntersectionObserver.lastInstance!;
    const dynamicElement = document.createElement('button');
    dynamicElement.setAttribute('data-track', '{"eventTracker":"visibility","page":"dynamic-once"}');
    document.body.appendChild(dynamicElement);

    await new Promise((resolve) => setTimeout(resolve, 0));

    // First full visibility → push + unobserves the element (once mode).
    emitVisibilityEntries(observer, [dynamicElement]);
    expect(observer.unobserve).toHaveBeenCalledWith(dynamicElement);

    // Second emission must NOT push again.
    emitVisibilityEntries(observer, [dynamicElement]);

    expect(window.dataLayer).toEqual([{ eventTracker: 'visibility', page: 'dynamic-once' }]);

    dynamicElement.remove();
  });

  it('should re-fire visibility for dynamically inserted elements on re-entry in repeat mode', async () => {
    render(<div>initial</div>, {
      providerProps: {
        enableVisibilityTracking: true,
        visibilityTrackingMode: 'repeat',
      },
    });

    const observer = MockIntersectionObserver.lastInstance!;
    const dynamicElement = document.createElement('button');
    dynamicElement.setAttribute('data-track', '{"eventTracker":"visibility","page":"dynamic-repeat"}');
    document.body.appendChild(dynamicElement);

    await new Promise((resolve) => setTimeout(resolve, 0));

    // Enter (initial full visibility) — pushes once.
    emitVisibilityEntries(observer, [dynamicElement]);
    // Continuous visibility — must NOT push again.
    emitVisibilityEntries(observer, [dynamicElement]);
    // Exit — no push.
    emitVisibilityEntries(observer, [dynamicElement], false, 0);
    // Re-enter — pushes a second time.
    emitVisibilityEntries(observer, [dynamicElement]);

    expect(window.dataLayer).toEqual([
      { eventTracker: 'visibility', page: 'dynamic-repeat' },
      { eventTracker: 'visibility', page: 'dynamic-repeat' },
    ]);

    dynamicElement.remove();
  });

  it('should not observe dynamically added elements when enableVisibilityTracking is disabled', async () => {
    render(<div>initial</div>);

    // No IntersectionObserver was ever created.
    expect(MockIntersectionObserver.lastInstance).toBeNull();

    const dynamicElement = document.createElement('button');
    dynamicElement.setAttribute('data-track', '{"eventTracker":"visibility","page":"no-visibility"}');
    document.body.appendChild(dynamicElement);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(window.dataLayer).toEqual([]);

    dynamicElement.remove();
  });

  it('should stop observing new elements after provider unmount', async () => {
    const { unmount } = render(<div>initial</div>, {
      providerProps: {
        enableVisibilityTracking: true,
      },
    });

    const observer = MockIntersectionObserver.lastInstance!;
    expect(observer.observed.size).toBe(0);

    unmount();

    // After teardown, inserting a new tracked element must not result in
    // any push — the provider is gone. The observer was also disconnected,
    // so we use a freshly-constructed element to prove no callback fires.
    const dynamicElement = document.createElement('button');
    dynamicElement.setAttribute('data-track', '{"eventTracker":"visibility","page":"after-unmount"}');
    document.body.appendChild(dynamicElement);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(window.dataLayer).toEqual([]);

    dynamicElement.remove();
  });

  // ----- Custom `trackingAttribute` contract -----
  //
  // The provider accepts any `data-${string}` as the tracking attribute.
  // These tests pin the contract for the observer-based visibility path:
  // both the initial querySelectorAll and the MutationObserver subtree
  // scan must use the configured attribute, not a hard-coded `data-track`.

  it('should observe initially rendered elements using a custom trackingAttribute', () => {
    const { container } = render(
      <button data-my-track='{"eventTracker":"visibility","page":"custom-attr"}'>
        custom attribute
      </button>,
      {
        providerProps: {
          enableVisibilityTracking: true,
          trackingAttribute: 'data-my-track',
        },
      }
    );

    const element = container.querySelector('[data-my-track]') as Element;
    expect(element).toBeInTheDocument();
    expect(element).not.toHaveAttribute('data-track');

    const observer = MockIntersectionObserver.lastInstance!;
    // The custom-attribute element must be observed on mount.
    expect(observer.observed.has(element)).toBe(true);

    emitVisibilityEntries(observer, [element]);

    expect(window.dataLayer).toEqual([
      { eventTracker: 'visibility', page: 'custom-attr' },
    ]);
  });

  it('should not observe the default data-track attribute when a custom trackingAttribute is configured', () => {
    const { container } = render(
      <>
        <button data-track='{"eventTracker":"visibility","page":"default-leak"}'>
          default attribute
        </button>
        <button data-my-track='{"eventTracker":"visibility","page":"custom-only"}'>
          custom attribute
        </button>
      </>,
      {
        providerProps: {
          enableVisibilityTracking: true,
          trackingAttribute: 'data-my-track',
        },
      }
    );

    const defaultEl = container.querySelector('[data-track]') as Element;
    const customEl = container.querySelector('[data-my-track]') as Element;
    expect(defaultEl).toBeInTheDocument();
    expect(customEl).toBeInTheDocument();

    const observer = MockIntersectionObserver.lastInstance!;
    expect(observer.observed.has(customEl)).toBe(true);
    // Hard guarantee: a custom attribute does NOT silently fall back to
    // observing the default `data-track` element. The provider must honor
    // the configured attribute exclusively.
    expect(observer.observed.has(defaultEl)).toBe(false);

    // Only the custom-attribute element should fire a visibility event.
    emitVisibilityEntries(observer, [customEl, defaultEl]);

    expect(window.dataLayer).toEqual([
      { eventTracker: 'visibility', page: 'custom-only' },
    ]);
  });

  it('should observe dynamically inserted elements using a custom trackingAttribute', async () => {
    render(<div>initial</div>, {
      providerProps: {
        enableVisibilityTracking: true,
        trackingAttribute: 'data-my-track',
      },
    });

    const observer = MockIntersectionObserver.lastInstance!;
    // Sanity: nothing matched the custom attribute at mount.
    expect(observer.observed.size).toBe(0);

    // Insert a tracked element AFTER the provider set up its observers.
    const dynamicElement = document.createElement('button');
    dynamicElement.setAttribute(
      'data-my-track',
      '{"eventTracker":"visibility","page":"custom-dynamic"}'
    );
    document.body.appendChild(dynamicElement);

    // Wait for the MutationObserver microtask to flush.
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(observer.observed.has(dynamicElement)).toBe(true);

    emitVisibilityEntries(observer, [dynamicElement]);

    expect(window.dataLayer).toEqual([
      { eventTracker: 'visibility', page: 'custom-dynamic' },
    ]);

    dynamicElement.remove();
  });

  it('should not observe dynamically inserted elements using the default attribute when a custom trackingAttribute is configured', async () => {
    render(<div>initial</div>, {
      providerProps: {
        enableVisibilityTracking: true,
        trackingAttribute: 'data-my-track',
      },
    });

    const observer = MockIntersectionObserver.lastInstance!;

    // Default-attribute element inserted after mount — must be ignored.
    const defaultDynamic = document.createElement('button');
    defaultDynamic.setAttribute(
      'data-track',
      '{"eventTracker":"visibility","page":"default-dynamic-leak"}'
    );
    document.body.appendChild(defaultDynamic);

    // Custom-attribute element inserted after mount — must be observed.
    const customDynamic = document.createElement('button');
    customDynamic.setAttribute(
      'data-my-track',
      '{"eventTracker":"visibility","page":"custom-dynamic-only"}'
    );
    document.body.appendChild(customDynamic);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(observer.observed.has(customDynamic)).toBe(true);
    expect(observer.observed.has(defaultDynamic)).toBe(false);

    emitVisibilityEntries(observer, [customDynamic, defaultDynamic]);

    expect(window.dataLayer).toEqual([
      { eventTracker: 'visibility', page: 'custom-dynamic-only' },
    ]);

    defaultDynamic.remove();
    customDynamic.remove();
  });
});
