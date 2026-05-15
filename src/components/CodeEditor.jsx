import React from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({ code, onChange, language, theme = "vs-dark", options = {} }) => {
  const handleEditorChange = (value) => {
    onChange(value);
  };

  const defaultOptions = {
    fontSize: 14,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    lineNumbers: 'on',
    roundedSelection: false,
    cursorStyle: 'line',
    automaticLayout: true,
    tabSize: 4,
    padding: { top: 16, bottom: 16 },
    fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
    fontLigatures: true,
    ...options
  };

  // Map our language keys to Monaco supported language keys
  const languageMap = {
    'javascript': 'javascript',
    'python': 'python',
    'cpp': 'cpp',
    'java': 'java'
  };

  return (
    <div className="h-full w-full bg-[#1e1e1e] overflow-hidden relative">
      <Editor
        height="100%"
        width="100%"
        language={languageMap[language] || 'javascript'}
        theme={theme}
        value={code}
        onChange={handleEditorChange}
        options={defaultOptions}
        loading={
          <div className="flex flex-col items-center justify-center h-full gap-4 bg-[#1e1e1e] text-slate-500">
            <div className="w-10 h-10 border-4 border-slate-700 border-t-orange-500 rounded-full animate-spin"></div>
            <span className="font-bold text-xs uppercase tracking-widest">Initializing Environment...</span>
          </div>
        }
      />
    </div>
  );
};

export default CodeEditor;
