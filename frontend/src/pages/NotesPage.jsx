import { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Save, Search, Tag, Clock } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import toast from 'react-hot-toast';

const STORAGE_KEY = 'evalai_notes';

function loadNotes() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
}

function saveNotes(notes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export default function NotesPage() {
  const [notes, setNotes] = useState(loadNotes);
  const [activeNote, setActiveNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState('');

  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  const createNote = () => {
    const newNote = {
      id: Date.now(),
      title: 'Untitled Note',
      content: '',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes(prev => [newNote, ...prev]);
    selectNote(newNote);
  };

  const selectNote = (note) => {
    setActiveNote(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditTags(note.tags.join(', '));
  };

  const saveCurrentNote = () => {
    setNotes(prev => prev.map(n =>
      n.id === activeNote ? {
        ...n,
        title: editTitle || 'Untitled Note',
        content: editContent,
        tags: editTags.split(',').map(t => t.trim()).filter(Boolean),
        updatedAt: new Date().toISOString(),
      } : n
    ));
    toast.success('Note saved');
  };

  const deleteNote = (id) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (activeNote === id) {
      setActiveNote(null);
      setEditTitle('');
      setEditContent('');
      setEditTags('');
    }
    toast.success('Note deleted');
  };

  const filtered = notes.filter(n => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.tags.some(t => t.toLowerCase().includes(q));
  });

  const currentNote = notes.find(n => n.id === activeNote);

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FileText className="w-7 h-7 text-indigo-500" />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Study Notes</h1>
            <span className="text-sm text-gray-400">({notes.length})</span>
          </div>
          <button
            onClick={createNote}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all text-sm font-medium shadow-lg shadow-indigo-500/25"
          >
            <Plus className="w-4 h-4" />
            New Note
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Notes List */}
          <div className="lg:col-span-1 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search notes..."
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">{notes.length === 0 ? 'No notes yet. Create one!' : 'No matching notes.'}</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {filtered.map(note => (
                  <div
                    key={note.id}
                    onClick={() => selectNote(note)}
                    className={`p-3 rounded-xl cursor-pointer transition-all border ${
                      activeNote === note.id
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium text-sm text-gray-800 dark:text-white truncate flex-1">{note.title}</h3>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors shrink-0"
                        aria-label="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{note.content || 'Empty note'}</p>
                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {note.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full text-[10px]">{tag}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-400">
                      <Clock className="w-3 h-3" />
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Editor */}
          <div className="lg:col-span-2">
            {currentNote ? (
              <GlassCard hover={false}>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    placeholder="Note title"
                    className="w-full text-xl font-bold bg-transparent border-0 border-b border-gray-200 dark:border-gray-700 pb-2 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={editTags}
                      onChange={e => setEditTags(e.target.value)}
                      placeholder="Tags (comma separated, e.g., physics, quantum)"
                      className="flex-1 text-sm bg-transparent border-0 text-gray-600 dark:text-gray-400 placeholder-gray-400 focus:outline-none"
                    />
                  </div>
                  <textarea
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    placeholder="Start writing your study notes here..."
                    rows={18}
                    className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed resize-none focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {editContent.split(/\s+/).filter(Boolean).length} words
                    </span>
                    <button
                      onClick={saveCurrentNote}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                    >
                      <Save className="w-4 h-4" />
                      Save Note
                    </button>
                  </div>
                </div>
              </GlassCard>
            ) : (
              <div className="flex items-center justify-center h-[50vh] text-gray-400">
                <div className="text-center">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="text-sm">Select a note to edit or create a new one</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
