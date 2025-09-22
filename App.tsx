import React, { useState, useMemo, useEffect } from 'react';
import CodeEditor from './components/CodeEditor';
import Preview from './components/Preview';
import FileExplorer from './components/FileExplorer';
import useLocalStorage from './hooks/useLocalStorage';
import { useDebounce } from './hooks/useDebounce';

// Type Definitions
export type FileType = 'html' | 'css' | 'js';
export interface IFile {
  id: string;
  name: string;
  type: FileType;
  content: string;
}
export interface ActiveFileIds {
    html: string | null;
    css: string | null;
    js: string | null;
}

// Initial Content for default files
const initialHtml = `<h1>Hello, Coder!</h1>
<p>This is your live code editor.</p>
<button id="myButton">Click Me</button>
`;

const initialCss = `body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: #f0f4f8;
  color: #1e293b;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
  text-align: center;
}

button {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  background-color: #3b82f6;
  color: white;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.3s;
}

button:hover {
  background-color: #2563eb;
  transform: translateY(-2px);
}
`;

const initialJs = `const button = document.getElementById('myButton');
const heading = document.querySelector('h1');

const greetings = ['Hello!', '¡Hola!', 'Bonjour!', 'Hallo!', 'Ciao!'];
let currentIndex = 0;

button.addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % greetings.length;
  heading.textContent = greetings[currentIndex];

  const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
  document.body.style.backgroundColor = randomColor;
});
`;

// Function to create initial files for first-time users
const createInitialFiles = (): IFile[] => [
    { id: crypto.randomUUID(), name: 'index.html', type: 'html', content: initialHtml },
    { id: crypto.randomUUID(), name: 'style.css', type: 'css', content: initialCss },
    { id: crypto.randomUUID(), name: 'script.js', type: 'js', content: initialJs }
];

// Icon components
const HtmlIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>;
const CssIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;
const JsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>;
const CodeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>;
const PreviewIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;


function App() {
  const [files, setFiles] = useLocalStorage<IFile[]>('live-editor-files', []);
  const [activeFileIds, setActiveFileIds] = useLocalStorage<ActiveFileIds>('live-editor-active-files', { html: null, css: null, js: null });
  const [isPreviewFullScreen, setIsPreviewFullScreen] = useState(false);
  
  // State for mobile responsiveness
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeMobileView, setActiveMobileView] = useState<'code' | 'preview'>('code');

  // This effect runs once on mount to initialize files if localStorage is empty.
  useEffect(() => {
    if (files.length === 0) {
      const defaultFiles = createInitialFiles();
      setFiles(defaultFiles);
      setActiveFileIds({
        html: defaultFiles.find(f => f.type === 'html')?.id || null,
        css: defaultFiles.find(f => f.type === 'css')?.id || null,
        js: defaultFiles.find(f => f.type === 'js')?.id || null,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeHtmlFile = useMemo(() => files.find(f => f.id === activeFileIds.html), [files, activeFileIds.html]);
  const activeCssFile = useMemo(() => files.find(f => f.id === activeFileIds.css), [files, activeFileIds.css]);
  const activeJsFile = useMemo(() => files.find(f => f.id === activeFileIds.js), [files, activeFileIds.js]);

  const debouncedHtml = useDebounce(activeHtmlFile?.content || '', 500);
  const debouncedCss = useDebounce(activeCssFile?.content || '', 500);
  const debouncedJs = useDebounce(activeJsFile?.content || '', 500);

  const handleUpdateFileContent = (fileType: FileType, newContent: string) => {
      const activeId = activeFileIds[fileType];
      if (!activeId) return;

      setFiles(currentFiles => currentFiles.map(file =>
          file.id === activeId ? { ...file, content: newContent } : file
      ));
  };

  const handleSelectFile = (id: string) => {
      const file = files.find(f => f.id === id);
      if (file) {
          setActiveFileIds(prev => ({ ...prev, [file.type]: file.id }));
      }
      // Close sidebar on file selection in mobile
      if (window.innerWidth < 1024) { // lg breakpoint
        setIsSidebarOpen(false);
      }
  };

  const handleAddFile = (name: string, type: FileType) => {
      const newFile: IFile = {
          id: crypto.randomUUID(),
          name,
          type,
          content: `/* New ${type} file: ${name} */\n`
      };
      setFiles(prevFiles => [...prevFiles, newFile]);
      // If no file of this type was active, make the new one active
      if (!activeFileIds[type]) {
          handleSelectFile(newFile.id);
      }
  };

  const handleDeleteFile = (id: string) => {
      const fileToDelete = files.find(f => f.id === id);
      if (!fileToDelete) return;

      const remainingFiles = files.filter(f => f.id !== id);
      setFiles(remainingFiles);

      // If the deleted file was active, select a new one
      if (activeFileIds[fileToDelete.type] === id) {
          const nextFile = remainingFiles.find(f => f.type === fileToDelete.type);
          setActiveFileIds(prev => ({ ...prev, [fileToDelete.type]: nextFile?.id || null }));
      }
  };

  const handleRenameFile = (id: string, newName: string) => {
      setFiles(currentFiles => currentFiles.map(file =>
        file.id === id ? { ...file, name: newName } : file
      ));
  };
  
  if (isPreviewFullScreen) {
      return (
          <div className="h-screen w-screen bg-gray-900 p-2">
            <Preview
                html={debouncedHtml}
                css={debouncedCss}
                js={debouncedJs}
                isFullScreen={true}
                onToggleFullScreen={() => setIsPreviewFullScreen(false)}
            />
          </div>
      );
  }

  const fileExplorerProps = {
    files,
    activeFileIds,
    onAddFile: handleAddFile,
    onDeleteFile: handleDeleteFile,
    onRenameFile: handleRenameFile,
    onSelectFile: handleSelectFile,
    onClose: () => setIsSidebarOpen(false),
  };

  return (
    <div className="relative h-screen w-screen bg-gray-900 text-white overflow-hidden lg:flex">
      {/* --- MOBILE SIDEBAR OVERLAY --- */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      {/* --- SIDEBAR --- */}
      <div 
        className={`fixed top-0 left-0 h-full w-64 flex-shrink-0 z-30
                    transform transition-transform duration-300 ease-in-out lg:static lg:transform-none
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <FileExplorer {...fileExplorerProps} />
      </div>
        
      <div className="flex flex-col flex-grow min-w-0 h-full">
        {/* --- HEADER --- */}
        <header className="flex items-center gap-3 border-b border-gray-700 p-4 pb-3 flex-shrink-0">
            <button 
              className="p-1 rounded-md hover:bg-gray-700 lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open file explorer"
            >
              <MenuIcon />
            </button>
            <div className="p-2 bg-gray-800 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </div>
            <h1 className="text-xl lg:text-2xl font-bold tracking-wider">Live Web Code</h1>
        </header>

        {/* --- MOBILE TABS --- */}
        <div className="flex border-b border-gray-700 lg:hidden">
          <button 
            className={`flex-1 flex items-center justify-center p-3 font-semibold text-sm ${activeMobileView === 'code' ? 'bg-gray-800 text-cyan-400' : 'text-gray-400'}`}
            onClick={() => setActiveMobileView('code')}
          >
            <CodeIcon/> Code
          </button>
          <button 
            className={`flex-1 flex items-center justify-center p-3 font-semibold text-sm ${activeMobileView === 'preview' ? 'bg-gray-800 text-cyan-400' : 'text-gray-400'}`}
            onClick={() => setActiveMobileView('preview')}
          >
            <PreviewIcon /> Preview
          </button>
        </div>

        {/* --- CONTENT PANES --- */}
        <main className="flex-grow flex lg:grid lg:grid-cols-2 lg:gap-4 min-h-0 lg:p-4">
            {/* Code Editors Pane */}
            <div className={`grid-rows-3 gap-4 min-h-0 w-full h-full p-4 lg:p-0 ${activeMobileView === 'code' ? 'grid' : 'hidden'} lg:grid`}>
                <CodeEditor
                    language="HTML"
                    value={activeHtmlFile?.content ?? ''}
                    onChange={(val) => handleUpdateFileContent('html', val)}
                    icon={<HtmlIcon />}
                />
                <CodeEditor
                    language="CSS"
                    value={activeCssFile?.content ?? ''}
                    onChange={(val) => handleUpdateFileContent('css', val)}
                    icon={<CssIcon />}
                />
                {/* Fix: Corrected component name from CodeExplorer to CodeEditor to resolve reference error. */}
                <CodeEditor
                    language="JavaScript"
                    value={activeJsFile?.content ?? ''}
                    onChange={(val) => handleUpdateFileContent('js', val)}
                    icon={<JsIcon />}
                />
            </div>
            {/* Preview Pane */}
            <div className={`min-h-0 w-full h-full p-4 lg:p-0 ${activeMobileView === 'preview' ? 'block' : 'hidden'} lg:block`}>
                <Preview
                    html={debouncedHtml}
                    css={debouncedCss}
                    js={debouncedJs}
                    isFullScreen={false}
                    onToggleFullScreen={() => setIsPreviewFullScreen(true)}
                />
            </div>
        </main>
      </div>
    </div>
  );
}

export default App;