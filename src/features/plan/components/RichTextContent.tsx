import { Fragment, type ReactNode } from 'react';

type RichTextContentProps = {
  content: string;
};

export function RichTextContent({ content }: RichTextContentProps) {
  return <div className="rich-copy">{renderTextBlocks(content)}</div>;
}

function renderTextBlocks(content: string): ReactNode[] {
  return content.split('\n\n').map((block, blockIndex) => {
    const lines = block.split('\n').filter(Boolean);

    if (lines.every((line) => line.trimStart().startsWith('- '))) {
      return (
        <ul key={`block-${blockIndex}`} className="text-list compact-list">
          {lines.map((line, lineIndex) => (
            <li key={`line-${lineIndex}`}>{renderInline(line.replace(/^\s*-\s*/, ''))}</li>
          ))}
        </ul>
      );
    }

    return (
      <p key={`block-${blockIndex}`}>
        {lines.map((line, lineIndex) => (
          <Fragment key={`line-${lineIndex}`}>
            {lineIndex > 0 ? <br /> : null}
            {renderInline(line)}
          </Fragment>
        ))}
      </p>
    );
  });
}

function renderInline(line: string): ReactNode[] {
  return line
    .split(/(\*\*.*?\*\*)/g)
    .filter(Boolean)
    .map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
      }

      return <Fragment key={`${part}-${index}`}>{part}</Fragment>;
    });
}
