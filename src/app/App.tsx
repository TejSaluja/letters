import { useState, useEffect, useCallback } from 'react';
import { LetterList } from './components/LetterList';
import { WriteLetter } from './components/WriteLetter';
import { ViewLetter } from './components/ViewLetter';

type Recipient = 'tej' | 'ridhi';

interface Letter {
  id: string;
  recipient: Recipient;
  author: string;
  content: string;
  date: string;
}

type View = 'list' | 'write' | 'view';

function normalizeLetter(letter: Partial<Letter>): Letter | null {
  if (typeof letter.id !== 'string') {
    return null;
  }

  return {
    id: letter.id,
    recipient: letter.recipient === 'ridhi' ? 'ridhi' : 'tej',
    author: typeof letter.author === 'string' ? letter.author : '',
    content: typeof letter.content === 'string' ? letter.content : '',
    date: typeof letter.date === 'string' ? letter.date : new Date().toISOString(),
  };
}

async function parseApiError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (typeof data?.error === 'string' && data.error) {
      return data.error;
    }
  } catch {
    // Fall back to generic message when response is not JSON.
  }
  return `Request failed with status ${response.status}`;
}

export default function App() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>('list');
  const [selectedLetterId, setSelectedLetterId] = useState<string | null>(null);
  const [editingLetterId, setEditingLetterId] = useState<string | null>(null);

  const loadLetters = useCallback(async () => {
    setErrorMessage(null);
    try {
      const response = await fetch('/api/letters');
      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }

      const data = await response.json();
      if (!Array.isArray(data?.letters)) {
        throw new Error('Invalid server response while loading letters');
      }

      const normalized = data.letters
        .map((letter: Partial<Letter>) => normalizeLetter(letter))
        .filter((letter: Letter | null): letter is Letter => letter !== null);
      setLetters(normalized);
    } catch (error) {
      console.error('Error loading letters:', error);
      setErrorMessage('Could not load letters from the server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLetters();
  }, [loadLetters]);

  useEffect(() => {
    const pollTimer = window.setInterval(() => {
      void loadLetters();
    }, 15000);

    return () => {
      window.clearInterval(pollTimer);
    };
  }, [loadLetters]);

  const handleNewLetter = () => {
    setEditingLetterId(null);
    setCurrentView('write');
  };

  const handleSaveLetter = async (letterData: { recipient: Recipient; author: string; content: string }) => {
    setErrorMessage(null);

    try {
      if (editingLetterId) {
        const response = await fetch(`/api/letters?id=${encodeURIComponent(editingLetterId)}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(letterData),
        });

        if (!response.ok) {
          throw new Error(await parseApiError(response));
        }

        const data = await response.json();
        const updatedLetter = normalizeLetter(data?.letter as Partial<Letter>);
        if (!updatedLetter) {
          throw new Error('Invalid server response while updating letter');
        }

        setLetters((prev) => prev.map((letter) => (letter.id === updatedLetter.id ? updatedLetter : letter)));
        setEditingLetterId(null);
      } else {
        const response = await fetch('/api/letters', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(letterData),
        });

        if (!response.ok) {
          throw new Error(await parseApiError(response));
        }

        const data = await response.json();
        const createdLetter = normalizeLetter(data?.letter as Partial<Letter>);
        if (!createdLetter) {
          throw new Error('Invalid server response while creating letter');
        }

        setLetters((prev) => [createdLetter, ...prev]);
      }

      setCurrentView('list');
    } catch (error) {
      console.error('Failed to save letter:', error);
      setErrorMessage('Could not save letter right now. Please try again.');
    }
  };

  const handleEditLetter = (id: string) => {
    setEditingLetterId(id);
    setCurrentView('write');
  };

  const handleDeleteLetter = (id: string) => {
    void (async () => {
      setErrorMessage(null);

      try {
        const response = await fetch(`/api/letters?id=${encodeURIComponent(id)}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(await parseApiError(response));
        }

        setLetters((prev) => prev.filter((letter) => letter.id !== id));
        if (selectedLetterId === id) {
          handleBackToList();
        }
      } catch (error) {
        console.error('Failed to delete letter:', error);
        setErrorMessage('Could not delete this letter right now. Please try again.');
      }
    })();
  };

  const handleViewLetter = (id: string) => {
    setSelectedLetterId(id);
    setCurrentView('view');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedLetterId(null);
    setEditingLetterId(null);
  };

  const selectedLetter = selectedLetterId
    ? letters.find((letter) => letter.id === selectedLetterId)
    : null;

  const editingLetter = editingLetterId
    ? letters.find((letter) => letter.id === editingLetterId)
    : null;

  return (
    <div className="size-full overflow-auto">
      {errorMessage && (
        <div className="sticky top-0 z-10 bg-rose-100 border-b border-rose-300 px-4 py-3 text-rose-900 flex items-center justify-between gap-3">
          <span>{errorMessage}</span>
          <button
            onClick={() => {
              if (currentView === 'list') {
                setIsLoading(true);
                void loadLetters();
              }
              setErrorMessage(null);
            }}
            className="px-3 py-1 rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {currentView === 'list' && isLoading && (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 p-8 flex items-center justify-center text-rose-700">
          Loading letters...
        </div>
      )}

      {currentView === 'list' && (
        !isLoading && (
          <LetterList
            letters={letters}
            onNewLetter={handleNewLetter}
            onViewLetter={handleViewLetter}
            onEditLetter={handleEditLetter}
            onDeleteLetter={handleDeleteLetter}
          />
        )
      )}

      {currentView === 'write' && (
        <WriteLetter
          onBack={handleBackToList}
          onSave={handleSaveLetter}
          initialData={editingLetter ? {
            recipient: editingLetter.recipient,
            author: editingLetter.author,
            content: editingLetter.content,
          } : undefined}
          isEditing={!!editingLetterId}
        />
      )}

      {currentView === 'view' && selectedLetter && (
        <ViewLetter letter={selectedLetter} onBack={handleBackToList} />
      )}
    </div>
  );
}