# React Tag Tracker for `Tag Manager`

A lightweight and customizable event tracking library for React that simplifies integration with Google Tag Manager (GTM). It provides tracking for click events, hover interactions and scroll visibility, with the flexibility to customize the tracking attributes and enable/disable features dynamically.

## 🚀 Features
- **Customizable tracking attribute** (default: `data-track`).
- **Track click events** on elements with the tracking attribute.
- **Track hover interactions** (optional).
- **Track element visibility** when it enters the viewport (optional).
- **Manual custom event tracking** via the trackCustomEvent method.
- **Push events directly to Google Tag Manager’s Data Layer**.

## 📦 Installation
You can install the library via npm or yarn:

```sh
npm install react-tag-tracker
# or
yarn add react-tag-tracker
```

## 🎯 Usage
### 1️⃣ Wrap Your App with TagTrackerProvider
Wrap your application with the `TagTrackerProvider` and configure the features you want to enable (such as custom attributes, hover tracking, visibility tracking, etc.).

```jsx
import React from 'react';
import { TagTrackerProvider } from 'react-tag-tracker';
import App from './App';

const Root = () => (
  <TagTrackerProvider
    trackingAttribute="data-custom-track"  // Customize the tracking attribute if needed
    enableHoverTracking={true}  // Enable hover tracking (optional)
    enableVisibilityTracking={true}  // Enable visibility tracking (optional)
  >
    <App />
  </TagTrackerProvider>
);

export default Root;
```

### 2️⃣ Track Click Events
You can now track click events on elements with the `data-track` (or your custom attribute) attribute:

```jsx
<button data-track='{"event":"click", "category":"button", "label":"Buy Now"}'>
  Buy Now
</button>
```

### 3️⃣ Track Hover Events (Optional)
If you’ve enabled `enableHoverTracking`, hover events will be tracked for elements with the tracking attribute:

```jsx
<div data-track='{"event":"hover", "category":"section", "label":"Special Offer"}'>
  Hover over me!
</div>
```

### 4️⃣ Track Visibility Events (Optional)
If you’ve enabled `enableVisibilityTracking`, the library will track when elements with the tracking attribute enter the viewport:

```jsx
<div data-track='{"event":"visibility", "category":"section", "label":"Featured Product"}'>
  This element is visible when it enters the viewport!
</div>
```

### 5️⃣ Manually Track Custom Events
You can also manually push custom events to the GTM Data Layer using the `trackCustomEvent` function from the `useTagTracker` hook:

```jsx
import { useTagTracker } from 'react-tag-tracker';

const MyComponent = () => {
  const { trackCustomEvent } = useTagTracker();

  const handleCustomEvent = () => {
    trackCustomEvent({
      event: 'custom_event',
      action: 'User clicked custom button'
    });
  };

  return (
    <button onClick={handleCustomEvent}>
      Track Custom Event
    </button>
  );
};
```

### 6️⃣ Full Example
Here’s a complete example:

```jsx
import React from 'react';
import { TagTrackerProvider, useTagTracker } from 'react-tag-tracker';

const App = () => {
  const { trackCustomEvent } = useTagTracker();

  return (
    <div>
      <button
        data-track='{"event":"click", "category":"button", "label":"Buy Now"}'
      >
        Buy Now
      </button>

      <div
        data-track='{"event":"hover", "category":"section", "label":"Special Offer"}'
      >
        Hover over me to track hover event!
      </div>

      <div
        data-track='{"event":"visibility", "category":"section", "label":"Featured Product"}'
      >
        I will be tracked when I become visible!
      </div>

      <button onClick={() => trackCustomEvent({
        event: 'custom_event',
        action: 'User clicked custom button'
      })}>
        Track Custom Event
      </button>
    </div>
  );
};

const Root = () => (
  <TagTrackerProvider
    trackingAttribute="data-track"
    enableHoverTracking={true}
    enableVisibilityTracking={true}
  >
    <App />
  </TagTrackerProvider>
);

export default Root;
```

## 🛠️ Configuration Options
You can configure the following options when using the `TagTrackerProvider`:

`trackingAttribute`: The attribute used for event tracking. Default is `data-track`.

Example: ```<button data-custom-track='{"event":"click", "category":"button"}'>Click Me</button>```

`enableHoverTracking`: Set this to `true` to enable hover event tracking for elements with the tracking attribute. Default is `false`.

`enableVisibilityTracking`: Set this to `true` to enable visibility tracking for elements with the tracking attribute. Default is false.

`enableCustomTracking`: Set this to `true` to enable custom event tracking via the trackCustomEvent function. Default is true.

## 🎯 Roadmap
- 🔹 **GA4 Integration**: Send events to Google Analytics 4 (GA4).
- 🔹 **Mixpanel Integration**: Track events with Mixpanel.
- 🔹 **Event Filters**: Add filtering options to track only specific events.

## 📜 License
MIT License. Open to contributions! 🚀
