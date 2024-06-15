import { Card, Typography } from 'antd';
import { useState } from 'react';

import Markdown from '@/components/markdown';
import { useThemeToken } from '@/theme/hooks';

const TEXT = `

\`\`\`tsx
import React from 'react';
import ReactDOM from 'react-dom';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';

ReactDOM.render(
  <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{'# Your markdown here'}</ReactMarkdown>,
  document.querySelector('#content')
);
\`\`\`

<br/>

![cover](https://res.cloudinary.com/trinhmai/image/upload/v1660897321/_minimal_mock/_Cover/cover_19.jpg)

> A block quote with ~~strikethrough~~ and a URL: [https://reactjs.org](https://reactjs.org).

`;

export default function MarkdownPage() {
  const [content] = useState(TEXT);
  const { colorPrimary } = useThemeToken();
  return (
    <>
      <Typography.Link
        href="https://github.com/remarkjs/react-markdown"
        style={{ color: colorPrimary }}
        className="mb-4 block"
      >
        https://github.com/remarkjs/react-markdown
      </Typography.Link>
      <Card title="Mardown content">
        <Markdown>{content}</Markdown>
      </Card>
    </>
  );
}
