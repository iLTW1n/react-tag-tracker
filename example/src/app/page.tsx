'use client';
import { Card } from '@/components/Card';
import { useState } from 'react';
import { DataLayerEventProps } from 'react-tag-tracker';
import { useTagTracker } from '../../../src';

declare global {
  interface Window {
    dataLayer: DataLayerEventProps[];
  }
}

export default function Home() {
  const { trackCustomEvent } = useTagTracker();
  const [log, setLog] = useState<string>('');

  const handleOnSubmit = () => {
    setTimeout(() => {
      setLog(JSON.stringify(window.dataLayer, null, 2));
    }, 100);
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-4xl text-center font-bold mb-6">📦 react-tag-tracker</h1>
      <p className="text-gray-600 mb-10">
        Minimal provider to track user events using <code>window.dataLayer</code>.
      </p>
      <div className='flex flex-col gap-8'>
        <Card
          title='Custom Click Tracking'
          description='Track user custom clicks on elements'
          log={log}
        >
          <button
            className="w-full cursor-pointer group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md border border-neutral-200 bg-transparent px-6 font-bold text-neutral-900 transition-all duration-100 [box-shadow:5px_5px_rgb(82_82_82)] active:translate-x-[3px] active:translate-y-[3px] active:[box-shadow:0px_0px_rgb(82_82_82)]"
            onClick={() => {
              trackCustomEvent({ event: 'custom_event', action: 'User clicked custom button' });
              handleOnSubmit();
            }}
          >
            Click me
          </button>
        </Card>
        <Card
          title='Click Tracking'
          description='Track user clicks on elements'
          log={log}
        >
          <button
            className="w-full cursor-pointer group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md border border-neutral-200 bg-transparent px-6 font-bold text-neutral-900 transition-all duration-100 [box-shadow:5px_5px_rgb(82_82_82)] active:translate-x-[3px] active:translate-y-[3px] active:[box-shadow:0px_0px_rgb(82_82_82)]"
            data-track='{"event":"click","category":"demo"}'
            onClick={handleOnSubmit}
          >
            Click me
          </button>
        </Card>
        <Card
          title='Hover Tracking'
          description='Track user hover on elements'
          log={log}
        >
          <button
            className="w-full cursor-pointer group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md border border-neutral-200 bg-transparent px-6 font-bold text-neutral-900 transition-all duration-100 [box-shadow:5px_5px_rgb(82_82_82)] hover:translate-x-[3px] hover:translate-y-[3px] hover:[box-shadow:0px_0px_rgb(82_82_82)]"
            data-track='{"event":"hover", "category":"section", "label":"Special Offer"}'
            onMouseOver={handleOnSubmit}
          >
            Hover me
          </button>
        </Card>
        <Card
          title='Visibility Tracking'
          description='Track when elements appear in viewport'
          log={log}
        >
          <button
            className="w-full cursor-pointer group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md border border-neutral-200 bg-transparent px-6 font-bold text-neutral-900 transition-all duration-100 [box-shadow:5px_5px_rgb(82_82_82)] hover:translate-x-[3px] hover:translate-y-[3px] hover:[box-shadow:0px_0px_rgb(82_82_82)]"
            data-track='{"event":"visibility", "category":"section", "label":"Special Offer"}'
            onMouseOver={handleOnSubmit}
          >
            Hover me
          </button>
        </Card>
      </div>
    </main>
  );
}
