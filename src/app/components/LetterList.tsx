import { useEffect, useState } from 'react';
import { Heart, PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';

interface Letter {
  id: string;
  recipient: 'tej' | 'ridhi';
  author: string;
  content: string;
  date: string;
}

interface LetterListProps {
  letters: Letter[];
  onNewLetter: () => void;
  onViewLetter: (id: string) => void;
  onEditLetter: (id: string) => void;
  onDeleteLetter: (id: string) => void;
  onLogout: () => void;
}

export function LetterList({ letters, onNewLetter, onViewLetter, onEditLetter, onDeleteLetter, onLogout }: LetterListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [letterToDelete, setLetterToDelete] = useState<string | null>(null);
  const [previewCharLimit, setPreviewCharLimit] = useState(220);
  const sortedLetters = [...letters].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  useEffect(() => {
    const updatePreviewLimit = () => {
      setPreviewCharLimit(window.innerWidth < 768 ? 160 : 260);
    };

    updatePreviewLimit();
    window.addEventListener('resize', updatePreviewLimit);

    return () => {
      window.removeEventListener('resize', updatePreviewLimit);
    };
  }, []);

  const getPreviewText = (content: string) => {
    const normalized = content.replace(/\s+/g, ' ').trim();
    if (normalized.length <= previewCharLimit) {
      return normalized;
    }

    return `${normalized.slice(0, previewCharLimit).trimEnd()}...`;
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLetterToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onEditLetter(id);
  };

  const confirmDelete = () => {
    if (letterToDelete) {
      onDeleteLetter(letterToDelete);
      setDeleteDialogOpen(false);
      setLetterToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setLetterToDelete(null);
  };

  const letterToDeleteData = letterToDelete
    ? letters.find((l) => l.id === letterToDelete)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <div className="flex justify-end mb-4">
            <button
              onClick={onLogout}
              className="rounded-xl border border-rose-300 bg-white/70 px-4 py-2 text-rose-800 hover:bg-white transition-colors"
            >
              Logout
            </button>
          </div>
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="w-10 h-10 text-rose-500 fill-rose-500" />
            <h1 className="text-4xl md:text-5xl text-rose-900">Our Love Letters</h1>
            <Heart className="w-10 h-10 text-rose-500 fill-rose-500" />
          </div>
          <p className="text-rose-700 text-lg">A collection of our thoughts and feelings</p>
        </div>

        {/* Add New Letter Button */}
        <button
          onClick={onNewLetter}
          className="w-full mb-8 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
        >
          <PlusCircle className="w-6 h-6" />
          <span className="text-xl">Add New Letter</span>
        </button>

        {/* Letters Grid */}
        {sortedLetters.length === 0 ? (
          <div className="text-center py-16 bg-white/50 rounded-2xl backdrop-blur-sm">
            <Heart className="w-16 h-16 text-rose-300 mx-auto mb-4" />
            <p className="text-rose-600 text-lg">No letters yet. Start writing your first love letter!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {sortedLetters.map((letter) => (
              <div
                key={letter.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border-2 border-rose-100 hover:border-rose-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />
                    <span className="text-rose-900">From: {letter.author}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-rose-600">
                      {new Date(letter.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                    <button
                      onClick={(e) => handleEditClick(letter.id, e)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit letter"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteClick(letter.id, e)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete letter"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => onViewLetter(letter.id)}
                  className="w-full text-left"
                >
                  <h3 className="text-xl text-rose-950 mb-2">To: {letter.recipient}</h3>
                  <p className="text-rose-700 letter-preview-safe">
                    {getPreviewText(letter.content)}
                  </p>
                </button>
              </div>
            ))}
          </div>
        )}

        <ConfirmDialog
          isOpen={deleteDialogOpen}
          title="Delete Letter?"
          message={
            letterToDeleteData
              ? `Are you sure you want to delete the letter to ${letterToDeleteData.recipient}? This action cannot be undone.`
              : 'Are you sure you want to delete this letter? This action cannot be undone.'
          }
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      </div>
    </div>
  );
}
