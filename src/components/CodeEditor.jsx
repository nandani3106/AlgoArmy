import React from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({ 
  code, 
  onChange, 
  language, 
  theme = "vs-dark", 
  fontSize = 14,
  minimapEnabled = false,
  onRun,
  onSubmit,
  onSave,
  options = {} 
}) => {
  
  const handleEditorChange = (value) => {
    onChange(value);
  };

  const defaultOptions = {
    fontSize: fontSize,
    minimap: { enabled: minimapEnabled },
    scrollBeyondLastLine: false,
    lineNumbers: 'on',
    roundedSelection: true,
    cursorStyle: 'line',
    automaticLayout: true,
    tabSize: 4,
    padding: { top: 16, bottom: 16 },
    fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
    fontLigatures: true,
    bracketPairColorization: { enabled: true },
    autoClosingBrackets: 'always',
    autoClosingQuotes: 'always',
    formatOnPaste: true,
    formatOnType: true,
    suggestOnTriggerCharacters: true,
    ...options
  };

  const handleEditorDidMount = (editor, monaco) => {
    // Add command for Run (Ctrl + Enter)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (onRun) onRun();
    });

    // Add command for Submit (Ctrl + Shift + Enter)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
      if (onSubmit) onSubmit();
    });

    // Add command for Save (Ctrl + S)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (onSave) onSave();
    });
  };

  // Map our language keys to Monaco supported language keys
  const languageMap = {
    'javascript': 'javascript',
    'python': 'python',
    'cpp': 'cpp',
    'java': 'java',
    'c': 'c'
  };

  return (
    <div className="h-full w-full bg-[#111322] overflow-hidden relative">
      <Editor
        height="100%"
        width="100%"
        language={languageMap[language] || 'javascript'}
        theme={theme}
        value={code}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={defaultOptions}
        loading={
          <div className="flex flex-col items-center justify-center h-full gap-4 bg-[#0a0c14] text-slate-500">
            <div className="w-10 h-10 border-4 border-slate-800 border-t-orange-500 rounded-full animate-spin"></div>
            <span className="font-black text-[10px] uppercase tracking-[0.2em]">Assembling Editor...</span>
          </div>
        }
      />
    </div>
  );
};

export default CodeEditor;
