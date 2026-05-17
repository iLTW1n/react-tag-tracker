<img
  src="https://raw.githubusercontent.com/jose-oscategui/react-tag-tracker/main/docs/assets/react-tag-tracker.png"
  alt="react-tag-tracker preview"
  width="100%"
/>

# react-tag-tracker

React provider + hook to push DOM interaction events into `window.dataLayer` (GTM style).

[![npm version](https://img.shields.io/npm/v/react-tag-tracker.svg)](https://www.npmjs.com/package/react-tag-tracker)
[![Bundle Size](https://img.shields.io/bundlephobia/min/react-tag-tracker)](https://bundlephobia.com/result?p=react-tag-tracker)
[![npm downloads](https://img.shields.io/npm/dt/react-tag-tracker.svg)](https://www.npmjs.com/package/react-tag-tracker)

## Install

The package is published on npm as [`react-tag-tracker`](https://www.npmjs.com/package/react-tag-tracker).

```bash
# npm
npm install react-tag-tracker

# yarn
yarn add react-tag-tracker

# pnpm
pnpm add react-tag-tracker
```

## Quick start

```tsx
import { TagTrackerProvider } from 'react-tag-tracker';

export function Root({ children }: { children: React.ReactNode }) {
  return (
    <TagTrackerProvider enableHoverTracking enableVisibilityTracking>
      {children}
    </TagTrackerProvider>
  );
}
```

```tsx
<button data-track='{"eventTracker":"click","category":"cta","tags":["pricing","hero"]}'>
  Buy now
</button>
```

### Dynamic payloads

When the payload depends on variables, use `JSON.stringify(...)` instead of writing JSON manually inside the attribute.

```tsx
const trackingData = {
  eventTracker: 'click',
  category: 'Learn more',
  tags: ['pricing', 'hero'],
};

<button data-track={JSON.stringify(trackingData)}>
  Learn more
</button>
```

```tsx
const category = title;
const tags = dynamicTags;

<button
  data-track={JSON.stringify({
    eventTracker: 'click',
    category,
    tags,
  })}
>
  {title}
</button>
```

Avoid hand-written dynamic JSON strings. `data-track` must always be a valid JSON string.

## Payload contract (important)

`data-track` (or your custom tracking attribute) must contain a valid JSON string.

1. The payload must be a **valid JSON object**.
2. `eventTracker` determines the route and **must** match the event type:
   - click listener expects `"click"`
   - hover listener expects `"hover"`
   - visibility listener expects `"visibility"`
3. The rest of the payload is user-defined and passed through unchanged.
   - Your object properties can include arrays, nested objects, booleans, numbers, `null`, etc.
4. Invalid JSON is ignored safely (no event is pushed for that element/event).

### Route matching example

Each listener only pushes events that match its own route. In plain language:

- Click listener only accepts `eventTracker: "click"`
- Hover listener only accepts `eventTracker: "hover"`
- Visibility listener only accepts `eventTracker: "visibility"`

```html
<!-- Tracked on click -->
<button data-track='{"eventTracker":"click","page":"checkout"}'>Pay</button>

<!-- Ignored by click listener because route does not match -->
<button data-track='{"eventTracker":"hover","page":"checkout"}'>Pay</button>
```

That second button is ignored **for click tracking**. But if hover tracking is enabled, it can still be tracked by the hover listener.

## What gets tracked

- **Click** (always enabled): delegated `document` click listener.
- **Hover** (`enableHoverTracking`): delegated `document` mouseover listener.
- **Visibility** (`enableVisibilityTracking`): checked on window `scroll`; events are pushed when an element is fully inside viewport. By default, each element is tracked once (`visibilityTrackingMode="once"`).
- **Custom/manual events** (`enableCustomTracking`, default `true`): `trackCustomEvent(payload)` from `useTagTracker()`.

Notes:
- The provider initializes `window.dataLayer` if it does not already exist.
- Visibility tracking runs on `scroll`, not automatically on mount.

## Public API

### `TagTrackerProvider`

```tsx
<TagTrackerProvider
  trackingAttribute="data-track"
  enableHoverTracking={false}
  enableVisibilityTracking={false}
  visibilityTrackingMode="once"
  enableCustomTracking={true}
>
  {children}
</TagTrackerProvider>
```

| Prop | Type | Default | Description |
|---|---|---:|---|
| `trackingAttribute` | ``data-${string}`` | `"data-track"` | Attribute read from elements for payload JSON. |
| `enableHoverTracking` | `boolean` | `false` | Enables hover tracking. |
| `enableVisibilityTracking` | `boolean` | `false` | Enables visibility tracking on scroll. |
| `visibilityTrackingMode` | `'once' \| 'repeat'` | `'once'` | Controls whether a visible element is tracked one time (`'once'`) or on every eligible scroll check (`'repeat'`). |
| `enableCustomTracking` | `boolean` | `true` | Enables `trackCustomEvent`. |

### `useTagTracker`

```tsx
import { useTagTracker } from 'react-tag-tracker';

const { trackCustomEvent } = useTagTracker();
trackCustomEvent({ eventTracker: 'custom', tags: ['react', 'analytics'] });
```

Notes:
- Must be used inside `TagTrackerProvider`.
- `trackCustomEvent` expects an object payload.
- `trackCustomEvent` does not route-check `eventTracker` like DOM listeners do; it pushes the object as provided when custom tracking is enabled.

## License

MIT
