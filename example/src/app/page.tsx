'use client';
import { Card } from '@/components/Card';
import { useMemo, useState } from 'react';
import { useTagTracker, DataLayerEventProps, TagTrackerProvider } from 'react-tag-tracker';

declare global {
  interface Window {
    dataLayer: DataLayerEventProps[];
  }
}

export default function Home() {
  const { trackCustomEvent } = useTagTracker();
  const [renderTick, setRenderTick] = useState(0);

  const forceRefreshLogs = () => setRenderTick((value) => value + 1);

  const logs = useMemo<DataLayerEventProps[]>(() => {
    void renderTick;
    if (typeof window === 'undefined') {
      return [];
    }
    return window.dataLayer ?? [];
  }, [renderTick]);

  const clearLogs = () => {
    if (typeof window === 'undefined') {
      return;
    }
    window.dataLayer = [];
    forceRefreshLogs();
  };

  const onceVisibilityLogs = logs.filter((event) => event.eventTracker === 'visibility' && event.label === 'visibility-once');
  const repeatVisibilityLogs = logs.filter((event) => event.eventTracker === 'visibility' && event.label === 'visibility-repeat');
  const customDisabledLogs = logs.filter((event) => event.eventTracker === 'custom_tracking_disabled');

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-4xl text-center font-bold mb-6">📦 react-tag-tracker</h1>
      <p className="text-gray-600 mb-10">
        Minimal provider to track user events using <code>window.dataLayer</code>.
      </p>

      <div className="mb-8 rounded-xl border p-4 bg-gray-50 text-sm text-gray-600">
        <p>
          This demo shows the current API: click tracking, hover tracking, visibility tracking (scroll-based), custom/manual events,
          custom tracking attribute, and ignored invalid cases.
        </p>
        <div className="mt-3 flex gap-2">
          <button
            className="rounded border border-gray-300 px-3 py-1.5 font-medium cursor-pointer"
            onClick={forceRefreshLogs}
          >
            Refresh logs
          </button>
          <button
            className="rounded border border-gray-300 px-3 py-1.5 font-medium cursor-pointer"
            onClick={clearLogs}
          >
            Clear logs
          </button>
        </div>
      </div>

      <div className='flex flex-col gap-8'>
        <Card
          tracking='custom_event'
          title='Custom/Manual Event Tracking'
          description='Calls trackCustomEvent(payload) directly.'
          events={logs}
        >
          <button
            className="w-full cursor-pointer group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md border border-neutral-200 bg-transparent px-6 font-bold text-neutral-900 transition-all duration-100 [box-shadow:5px_5px_rgb(82_82_82)] active:translate-x-0.75 active:translate-y-0.75 active:[box-shadow:0px_0px_rgb(82_82_82)]"
            onClick={() => {
              trackCustomEvent({ eventTracker: 'custom_event', action: 'User triggered manual event', source: 'manual-button' });
              forceRefreshLogs();
            }}
          >
            Trigger custom event
          </button>
        </Card>
        <Card
          tracking='click'
          title='Click Tracking'
          description='Uses custom tracking attribute: data-analytics.'
          events={logs}
        >
          <button
            className="w-full cursor-pointer group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md border border-neutral-200 bg-transparent px-6 font-bold text-neutral-900 transition-all duration-100 [box-shadow:5px_5px_rgb(82_82_82)] active:translate-x-0.75 active:translate-y-0.75 active:[box-shadow:0px_0px_rgb(82_82_82)]"
            data-analytics='{"eventTracker":"click","category":"demo","label":"primary-click"}'
            onClick={forceRefreshLogs}
          >
            Click tracked button
          </button>
        </Card>
        <Card
          tracking='hover'
          title='Hover Tracking'
          description='Hover this button to generate hover events.'
          events={logs}
        >
          <button
            className="w-full cursor-pointer group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md border border-neutral-200 bg-transparent px-6 font-bold text-neutral-900 transition-all duration-100 [box-shadow:5px_5px_rgb(82_82_82)] hover:translate-x-0.75 hover:translate-y-0.75 hover:[box-shadow:0px_0px_rgb(82_82_82)]"
            data-analytics='{"eventTracker":"hover", "category":"demo", "label":"hover-target"}'
            onMouseOver={forceRefreshLogs}
          >
            Hover tracked button
          </button>
        </Card>

        <Card
          tracking='visibility'
          title='Visibility Tracking (scroll-based)'
          description='Scroll the page to reveal the tracked box. Visibility events fire from window scroll.'
          events={logs}
        >
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              The tracked element starts below the viewport. Scroll down until you see it.
            </p>
            <div className="rounded border p-3 bg-white">
              <div className="h-[70vh] text-sm text-gray-400">Keep scrolling down…</div>
              <div
                className="rounded border border-dashed p-4 text-center text-sm"
                data-analytics='{"eventTracker":"visibility","category":"demo","label":"scroll-visible-box"}'
              >
                Visibility tracked target
              </div>
            </div>
          </div>
        </Card>

        <div className="border p-4 rounded-xl shadow text-left">
          <h2 className="text-xl font-semibold">Visibility mode: once vs repeat</h2>
          <p className="text-sm text-gray-500 mb-4">
            Two isolated providers use different tracking attributes, so each target only listens to its own config.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <TagTrackerProvider
              trackingAttribute="data-analytics-once"
              enableVisibilityTracking
              visibilityTrackingMode="once"
            >
              <div className="rounded border p-3 bg-gray-50">
                <p className="text-sm text-gray-600 mb-2">Mode: <code>once</code></p>
                <div className="h-[40vh] text-sm text-gray-400">Scroll until this box appears</div>
                <div
                  className="rounded border border-dashed p-3 text-center text-sm"
                  data-analytics-once='{"eventTracker":"visibility","category":"demo","label":"visibility-once"}'
                >
                  Once target
                </div>
                <p className="mt-2 text-xs text-gray-500">Expected: logs only first reveal.</p>
              </div>
            </TagTrackerProvider>

            <TagTrackerProvider
              trackingAttribute="data-analytics-repeat"
              enableVisibilityTracking
              visibilityTrackingMode="repeat"
            >
              <div className="rounded border p-3 bg-gray-50">
                <p className="text-sm text-gray-600 mb-2">Mode: <code>repeat</code></p>
                <div className="h-[40vh] text-sm text-gray-400">Scroll past and back to retrigger</div>
                <div
                  className="rounded border border-dashed p-3 text-center text-sm"
                  data-analytics-repeat='{"eventTracker":"visibility","category":"demo","label":"visibility-repeat"}'
                >
                  Repeat target
                </div>
                <p className="mt-2 text-xs text-gray-500">Expected: logs every re-entry into viewport.</p>
              </div>
            </TagTrackerProvider>
          </div>

          <pre className="mt-4 max-h-52 overflow-auto rounded bg-gray-100 p-3 text-xs">
            {JSON.stringify({ once: onceVisibilityLogs, repeat: repeatVisibilityLogs }, null, 2)}
          </pre>
        </div>

        <Card
          tracking='click'
          title='Custom Tracking Attribute (data-analytics)'
          description='This button is tracked with data-analytics instead of data-track.'
          events={logs}
        >
          <button
            className="w-full cursor-pointer group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md border border-neutral-200 bg-transparent px-6 font-bold text-neutral-900 transition-all duration-100 [box-shadow:5px_5px_rgb(82_82_82)] active:translate-x-0.75 active:translate-y-0.75 active:[box-shadow:0px_0px_rgb(82_82_82)]"
            data-analytics='{"eventTracker":"click","category":"custom-attribute","label":"analytics-click"}'
            onClick={forceRefreshLogs}
          >
            Click custom attribute button
          </button>
        </Card>

        <Card
          tracking='click'
          title='Ignored invalid payloads'
          description='These actions are intentionally ignored: invalid JSON and route mismatch.'
          events={logs}
        >
          <div className="flex flex-col gap-3">
            <button
              className="w-full rounded border border-neutral-200 bg-white px-4 py-2 text-sm font-medium cursor-pointer"
              data-analytics='{"eventTracker":"click","broken":}'
              onClick={forceRefreshLogs}
            >
              Invalid JSON (ignored)
            </button>
            <button
              className="w-full rounded border border-neutral-200 bg-white px-4 py-2 text-sm font-medium cursor-pointer"
              data-analytics='{"eventTracker":"hover","category":"wrong-route"}'
              onClick={forceRefreshLogs}
            >
              Route mismatch on click (ignored)
            </button>
          </div>
        </Card>

        <TagTrackerProvider trackingAttribute="data-no-custom" enableCustomTracking={false}>
          <CustomTrackingDisabledDemo logs={customDisabledLogs} onAfterAction={forceRefreshLogs} />
        </TagTrackerProvider>
      </div>
    </main>
  );
}

function CustomTrackingDisabledDemo({
  logs,
  onAfterAction,
}: {
  logs: DataLayerEventProps[];
  onAfterAction: () => void;
}) {
  const { trackCustomEvent } = useTagTracker();

  return (
    <div className="border p-4 rounded-xl shadow text-left">
      <h2 className="text-xl font-semibold">enableCustomTracking: false</h2>
      <p className="text-sm text-gray-500 mb-2">
        This section has its own provider with <code>enableCustomTracking=&#123;false&#125;</code>. The custom call below should be ignored.
      </p>
      <div className="p-4 border rounded bg-gray-50">
        <button
          className="w-full rounded border border-neutral-200 bg-white px-4 py-2 text-sm font-medium cursor-pointer"
          onClick={() => {
            trackCustomEvent({
              eventTracker: 'custom_tracking_disabled',
              category: 'demo',
              label: 'should-not-appear',
            });
            onAfterAction();
          }}
        >
          Attempt custom event (should be ignored)
        </button>
      </div>
      <pre className="mt-4 max-h-52 overflow-auto rounded bg-gray-100 p-3 text-xs">
        {JSON.stringify(logs, null, 2)}
      </pre>
    </div>
  );
}
