import { ReactNode } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { github } from 'react-syntax-highlighter/dist/esm/styles/hljs'

type Props = {
  title: string;
  description: string;
  children: ReactNode;
  log: string;
}

export const Card = (props: Props) => {
  const { title, description, log, children } = props;

  return (
    <div>
      <div className="border p-4 rounded-xl shadow text-left mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-gray-500 mb-2">{description}</p>
        <div className="p-4 border rounded bg-gray-50">
          {children}
        </div>
      </div>
      <div className='max-h-52 min-h-52 overflow-y-auto rounded-xl'>
        <SyntaxHighlighter
          customStyle={{ minHeight: 208 }}
          language="javascript"
          style={github}
        >
          {log}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}