import { useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { github } from 'react-syntax-highlighter/dist/esm/styles/hljs'

type Props = {
  title: string;
  description: string;
  example: React.ReactNode;
}

export const Card = () => {
  const [log, setLog] = useState<string>('');

  return (
    <>
      <div className="border p-4 rounded-xl shadow text-left">
        <h2 className="text-xl font-semibold">Click Tracking</h2>
        <p className="text-sm text-gray-500 mb-2">Track user clicks on elements</p>
        <div className="p-4 border rounded bg-gray-50">
          <button
            className="w-full cursor-pointer group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md border border-neutral-200 bg-transparent px-6 font-bold text-neutral-900 transition-all duration-100 [box-shadow:5px_5px_rgb(82_82_82)] active:translate-x-[3px] active:translate-y-[3px] active:[box-shadow:0px_0px_rgb(82_82_82)]"
            data-track='{"event":"click","category":"demo"}'
            onClick={() => {
              setTimeout(() => {
                console.log('jaaaa', window.dataLayer);
                console.log('jaaaa', JSON.stringify(window.dataLayer, null, 2));
                setLog(JSON.stringify(window.dataLayer, null, 2));
              }, 100);
            }}
          >
            Click me
          </button>
        </div>
      </div>
      {!!log.length &&
        <div className='max-h-100 overflow-y-auto'>
          <SyntaxHighlighter language="javascript" style={github}>
            {log}
          </SyntaxHighlighter>
        </div>
      }
    </>
  )
}