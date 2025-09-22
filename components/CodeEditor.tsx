import React from 'react';

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string) => void;
  // Fix: Changed type from JSX.Element to React.ReactNode to resolve "Cannot find namespace 'JSX'" error.
  icon: React.ReactNode;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ language, value, onChange, icon }) => {
  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg overflow-hidden border border-gray-700 shadow-lg">
      <div className="flex items-center p-2 bg-gray-900 text-gray-300 border-b border-gray-700">
        {icon}
        <h2 className="ml-2 font-mono text-sm tracking-wider">{language}</h2>
      </div>
      <textarea
        className="w-full h-full p-4 bg-gray-800 text-gray-200 font-mono text-sm resize-none focus:outline-none leading-relaxed"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck="false"
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
      />
    </div>
  );
};

export default CodeEditor;
