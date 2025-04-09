'use client';
import { Card } from '@/components/Card';
import { DataLayerEventProps } from 'react-tag-tracker';

declare global {
  interface Window {
    dataLayer: DataLayerEventProps[];
  }
}

export default function Home() {
  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-4xl text-center font-bold mb-6">📦 react-tag-tracker</h1>
      <p className="text-gray-600 mb-10">
        Minimal provider to track user events using <code>window.dataLayer</code>.
      </p>
      <div className='flex flex-col gap-4'>
        <Card />
        <Card />
      </div>
      {/* <ExampleCard
        title="Click Tracking"
        description="Track user clicks on elements"
        example={<button data-track='{"event":"click","category":"demo"}'>Click me</button>}
      />

      <ExampleCard
        title="Visibility Tracking"
        description="Track when elements appear in viewport"
        example={<div data-track='{"event":"visible","category":"demo"}'>I'm visible!</div>}
      /> */}
    </main>
  );
}
