import React, { useState } from 'react';
import type { IFile, FileType, ActiveFileIds } from '../App';

interface FileExplorerProps {
  files: IFile[];
  activeFileIds: ActiveFileIds;
  onAddFile: (name: string, type: FileType) => void;
  onDeleteFile: (id: string) => void;
  onRenameFile: (id: string, newName: string) => void;
  onSelectFile: (id: string) => void;
  onClose?: () => void;
}

// Action Icons
const AddIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;

const FileTypeIcon = ({ type }: { type: FileType }) => {
    const styleMap = {
        html: { icon: '</>', color: 'text-red-500' },
        css: { icon: '#', color: 'text-blue-400' },
        js: { icon: '{}', color: 'text-yellow-500' }
    };
    const { icon, color } = styleMap[type];
    return <span className={`mr-2 font-mono font-bold ${color}`}>{icon}</span>;
};


const FileExplorer: React.FC<FileExplorerProps> = ({ files, activeFileIds, onAddFile, onDeleteFile, onRenameFile, onSelectFile, onClose }) => {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newFileInput, setNewFileInput] = useState<{name: string, type: FileType}>({name: '', type: 'html'});
  const [showAddForm, setShowAddForm] = useState(false);

  const handleRenameStart = (file: IFile) => {
    setRenamingId(file.id);
    setNewName(file.name);
  };

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (renamingId && newName.trim()) {
      onRenameFile(renamingId, newName.trim());
    }
    setRenamingId(null);
    setNewName('');
  };

  const handleAddFile = (e: React.FormEvent) => {
      e.preventDefault();
      if (newFileInput.name.trim()) {
          onAddFile(newFileInput.name.trim(), newFileInput.type);
          setNewFileInput({name: '', type: 'html'});
          setShowAddForm(false);
      }
  }

  const FileList = ({ type }: { type: FileType }) => {
    const filesOfType = files.filter(f => f.type === type);
    const activeId = activeFileIds[type];

    return (
      <div>
        <h3 className="text-sm font-bold uppercase text-gray-400 px-2 mt-4 mb-1 tracking-wider">{type} Files</h3>
        {filesOfType.map(file => (
          <div
            key={file.id}
            className={`flex items-center justify-between text-sm py-1.5 px-2 rounded-md cursor-pointer group ${
              activeId === file.id ? 'bg-cyan-900/50 text-cyan-300' : 'hover:bg-gray-700'
            }`}
            onClick={() => onSelectFile(file.id)}
            onDoubleClick={() => handleRenameStart(file)}
          >
            {renamingId === file.id ? (
              <form onSubmit={handleRenameSubmit} className="flex-grow">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onBlur={handleRenameSubmit}
                  autoFocus
                  className="w-full bg-gray-600 text-white px-1 py-0 rounded focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </form>
            ) : (
              <span className="flex items-center truncate">
                 <FileTypeIcon type={file.type} />
                 {file.name}
              </span>
            )}
            {renamingId !== file.id && (
                <div className="hidden group-hover:flex items-center space-x-2 ml-2 text-gray-400">
                    <button onClick={(e) => { e.stopPropagation(); handleRenameStart(file); }} title="Rename file" className="hover:text-cyan-400"><EditIcon /></button>
                    <button onClick={(e) => { e.stopPropagation(); if(window.confirm(`Are you sure you want to delete ${file.name}?`)) onDeleteFile(file.id); }} title="Delete file" className="hover:text-red-500"><DeleteIcon /></button>
                </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-800 border-r border-gray-700 p-2">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold tracking-wider px-2">Files</h2>
        <div className="flex items-center">
            <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="p-2 rounded-md hover:bg-gray-700 transition-colors"
            title="Add new file"
            aria-label="Add new file"
            >
            <AddIcon />
            </button>
            {onClose && (
                <button 
                onClick={onClose}
                className="p-2 rounded-md hover:bg-gray-700 transition-colors lg:hidden"
                title="Close file explorer"
                aria-label="Close file explorer"
                >
                <CloseIcon />
                </button>
            )}
        </div>
      </div>
        {showAddForm && (
            <form onSubmit={handleAddFile} className="bg-gray-900/50 p-3 rounded-md mb-4 space-y-3">
                <input
                    type="text"
                    placeholder="filename.ext"
                    value={newFileInput.name}
                    onChange={(e) => setNewFileInput({...newFileInput, name: e.target.value})}
                    className="w-full bg-gray-800 text-white px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    autoFocus
                    required
                />
                <select
                    value={newFileInput.type}
                    onChange={(e) => setNewFileInput({...newFileInput, type: e.target.value as FileType})}
                    className="w-full bg-gray-800 text-white px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                    <option value="js">JavaScript</option>
                </select>
                <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-1.5 rounded-md transition-colors">
                    Create File
                </button>
            </form>
        )}

      <div className="flex-grow overflow-y-auto pr-1">
        <FileList type="html" />
        <FileList type="css" />
        <FileList type="js" />
      </div>
    </div>
  );
};

export default FileExplorer;