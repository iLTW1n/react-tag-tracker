'use client';
import { Card } from '@/components/Card';
import { useState } from 'react';
import { DataLayerEventProps } from 'react-tag-tracker';
import { useTagTracker } from '../../../dist';

declare global {
  interface Window {
    dataLayer: DataLayerEventProps[];
  }
}

export default function Home() {
  const { trackCustomEvent } = useTagTracker();
  const [log, setLog] = useState<string>('');

  const handleOnSubmit = () => {
    setTimeout(() => setLog(JSON.stringify(window.dataLayer, null, 2)), 100);
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-4xl text-center font-bold mb-6">📦 react-tag-tracker</h1>
      <p className="text-gray-600 mb-10">
        Minimal provider to track user events using <code>window.dataLayer</code>.
      </p>
      <div className='flex flex-col gap-8'>
        <Card
          tracking='custom_event'
          title='Custom Click Tracking'
          description='Track user custom clicks on elements'
          log={log}
        >
          <button
            className="w-full cursor-pointer group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md border border-neutral-200 bg-transparent px-6 font-bold text-neutral-900 transition-all duration-100 [box-shadow:5px_5px_rgb(82_82_82)] active:translate-x-0.75 active:translate-y-0.75 active:[box-shadow:0px_0px_rgb(82_82_82)]"
            onClick={() => {
              trackCustomEvent({ eventTracker: 'custom_event', action: 'User clicked custom button' });
              handleOnSubmit();
            }}
          >
            Click me
          </button>
        </Card>
        <Card
          tracking='click'
          title='Click Tracking'
          description='Track user clicks on elements'
          log={log}
        >
          <button
            className="w-full cursor-pointer group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md border border-neutral-200 bg-transparent px-6 font-bold text-neutral-900 transition-all duration-100 [box-shadow:5px_5px_rgb(82_82_82)] active:translate-x-0.75 active:translate-y-0.75 active:[box-shadow:0px_0px_rgb(82_82_82)]"
            data-track='{"eventTracker":"click","category":"demo"}'
            onClick={handleOnSubmit}
          >
            Click me
          </button>
        </Card>
        <Card
          tracking='hover'
          title='Hover Tracking'
          description='Track user hover on elements'
          log={log}
        >
          <button
            className="w-full cursor-pointer group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md border border-neutral-200 bg-transparent px-6 font-bold text-neutral-900 transition-all duration-100 [box-shadow:5px_5px_rgb(82_82_82)] hover:translate-x-0.75 hover:translate-y-0.75 hover:[box-shadow:0px_0px_rgb(82_82_82)]"
            data-track='{"eventTracker":"hover", "category":"section", "label":"Special Offer"}'
            onMouseOver={handleOnSubmit}
          >
            Hover me
          </button>
        </Card>
        <Card
          tracking='visibility'
          title='Visibility Tracking'
          description='Track when elements appear in viewport'
          log={log}
        >
          <button
            className="w-full cursor-pointer group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md border border-neutral-200 bg-transparent px-6 font-bold text-neutral-900 transition-all duration-100 [box-shadow:5px_5px_rgb(82_82_82)] hover:translate-x-0.75 hover:translate-y-0.75 hover:[box-shadow:0px_0px_rgb(82_82_82)]"
            data-track='{"eventTracker":"visibility", "category":"section", "label":"Special Offer"}'
            onMouseOver={handleOnSubmit}
          >
            Visibility
          </button>
        </Card>
      </div>
    </main>
  );
}
