import React, { useState } from 'react';

interface PreviewProps {
  html: string;
  css: string;
  js: string;
  isFullScreen: boolean;
  onToggleFullScreen: () => void;
}

type ViewMode = 'desktop' | 'tablet' | 'mobile';

const DesktopIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const TabletIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
);

const MobileIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
);

const ExpandIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1v4m0 0h-4m4 0l-5-5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5 5" />
  </svg>
);

const CollapseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l-5 5m0 0v-4m0 4h4m1-9l5-5m0 0h-4m4 0v4m-1 9l5 5m0 0v-4m0 4h-4m1-9l-5-5m0 0h4m-4 0v4" />
    </svg>
);


const Preview: React.FC<PreviewProps> = ({ html, css, js, isFullScreen, onToggleFullScreen }) => {
  const [view, setView] = useState<ViewMode>('desktop');

  const srcDoc = `
    <html>
      <head>
        <style>${css}</style>
      </head>
      <body>
        ${html}
        <script>
          const handleError = (error) => {
            console.error(error);
            const body = document.querySelector('body');
            if (body) {
              let errorDiv = document.getElementById('runtime-error-display');
              if (!errorDiv) {
                errorDiv = document.createElement('div');
                errorDiv.id = 'runtime-error-display';
                errorDiv.style.position = 'fixed';
                errorDiv.style.bottom = '10px';
                errorDiv.style.left = '10px';
                errorDiv.style.padding = '12px';
                errorDiv.style.backgroundColor = 'rgba(239, 68, 68, 0.9)';
                errorDiv.style.color = 'white';
                errorDiv.style.fontFamily = 'monospace';
                errorDiv.style.fontSize = '14px';
                errorDiv.style.borderRadius = '8px';
                errorDiv.style.zIndex = '9999';
                body.appendChild(errorDiv);
              }
              errorDiv.textContent = 'JavaScript Error: ' + error.message;
            }
          };

          window.addEventListener('error', (event) => {
            handleError(event.error);
          });
          
          try {
            ${js}
          } catch (error) {
            handleError(error);
          }
        </script>
      </body>
    </html>
  `;
    
  const viewDimensions = {
    mobile: { width: '375px', height: '667px' },
    tablet: { width: '768px', height: '1024px' },
    desktop: { width: '100%', height: '100%' },
  };

  const ViewportControl = ({ mode, children }: { mode: ViewMode, children: React.ReactNode }) => (
    <button
      onClick={() => setView(mode)}
      title={`${mode.charAt(0).toUpperCase() + mode.slice(1)} View`}
      aria-label={`${mode} View`}
      className={`p-2 rounded-md transition-colors ${
        view === mode ? 'bg-cyan-600 text-white' : 'hover:bg-gray-700'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg overflow-hidden border border-gray-700 shadow-lg">
       <div className="flex items-center justify-between p-2 bg-gray-900 text-gray-300 border-b border-gray-700">
        <div className="flex items-center">
         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
        </svg>
        <h2 className="font-mono text-sm tracking-wider">Preview</h2>
        </div>
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <ViewportControl mode="desktop"><DesktopIcon /></ViewportControl>
              <ViewportControl mode="tablet"><TabletIcon /></ViewportControl>
              <ViewportControl mode="mobile"><MobileIcon /></ViewportControl>
            </div>
            <div className="h-6 w-px bg-gray-700"></div>
            <button
                onClick={onToggleFullScreen}
                title={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                aria-label={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                className="p-2 rounded-md transition-colors hover:bg-gray-700 text-gray-300"
            >
                {isFullScreen ? <CollapseIcon /> : <ExpandIcon />}
            </button>
        </div>
       </div>
      <div className="flex-grow flex items-center justify-center p-4 bg-gray-900 transition-all duration-300 overflow-auto">
        <iframe
            srcDoc={srcDoc}
            title="output"
            sandbox="allow-scripts"
            className="bg-white shadow-2xl rounded-md"
            style={{
                ...viewDimensions[view],
                transition: 'width 0.3s ease-in-out, height 0.3s ease-in-out',
            }}
        />
      </div>
    </div>
  );
};

export default Preview;