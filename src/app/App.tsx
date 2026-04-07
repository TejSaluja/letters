import { useState, useEffect, useCallback } from 'react';
import { LetterList } from './components/LetterList';
import { WriteLetter } from './components/WriteLetter';
import { ViewLetter } from './components/ViewLetter';
import { LoginPage } from './components/LoginPage';

type Recipient = 'tej' | 'ridhi';

interface Letter {
  id: string;
  recipient: Recipient;
  author: string;
  content: string;
  date: string;
}

type View = 'login' | 'list' | 'write' | 'view';

const CLIENT_PASSWORD = 'twopindiyaaninapateela';
const ACCESS_STORAGE_KEY = 'letters_access_granted';
const API_UNAVAILABLE_MESSAGE = 'API is unavailable at this URL. Run `npm run dev:vercel` from the letters folder and open the exact URL shown in terminal.';

function isJsonResponse(response: Response): boolean {
  const contentType = response.headers.get('content-type') ?? '';
  return contentType.includes('application/json');
}

async function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    window.clearTimeout(timeoutId);
  }
}

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
    if (isJsonResponse(response)) {
      const data = await response.json();
      if (typeof data?.error === 'string' && data.error) {
        return data.error;
      }
    } else {
      const text = await response.text();
      if (text.includes('<!DOCTYPE html>') || text.includes('<html')) {
        return API_UNAVAILABLE_MESSAGE;
      }
    }
  } catch {
    // Fall back to generic message when response is not JSON.
  }
  return `Request failed with status ${response.status}`;
}

export default function App() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginErrorMessage, setLoginErrorMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>('login');
  const [selectedLetterId, setSelectedLetterId] = useState<string | null>(null);
  const [editingLetterId, setEditingLetterId] = useState<string | null>(null);

  const loadLetters = useCallback(async () => {
    setErrorMessage(null);
    try {
      const response = await fetchWithTimeout('/api/letters');
      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }

      if (!isJsonResponse(response)) {
        throw new Error(API_UNAVAILABLE_MESSAGE);
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
      const message = error instanceof Error ? error.message : 'Could not load letters from the server. Please try again.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const hasAccess = window.sessionStorage.getItem(ACCESS_STORAGE_KEY) === 'true';
    setIsAuthenticated(hasAccess);
    setCurrentView(hasAccess ? 'list' : 'login');
    setIsCheckingSession(false);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    setIsLoading(true);
    void loadLetters();

    const pollTimer = window.setInterval(() => {
      void loadLetters();
    }, 15000);

    return () => {
      window.clearInterval(pollTimer);
    };
  }, [isAuthenticated, loadLetters]);

  const handleLogin = async (password: string) => {
    setLoginErrorMessage(null);

    if (password.trim() !== CLIENT_PASSWORD) {
      setLoginErrorMessage('That password did not work. Try again.');
      return;
    }

    window.sessionStorage.setItem(ACCESS_STORAGE_KEY, 'true');
    setIsAuthenticated(true);
    setCurrentView('list');
    setIsLoading(true);
    await loadLetters();
  };

  const handleLogout = () => {
    window.sessionStorage.removeItem(ACCESS_STORAGE_KEY);
    setIsAuthenticated(false);
    setCurrentView('login');
    setLetters([]);
    setSelectedLetterId(null);
    setEditingLetterId(null);
    setIsLoading(false);
    setErrorMessage(null);
  };

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
      {isCheckingSession && (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 p-8 flex items-center justify-center text-rose-700">
          Checking session...
        </div>
      )}

      {!isCheckingSession && currentView === 'login' && (
        <LoginPage onLogin={handleLogin} errorMessage={loginErrorMessage} />
      )}

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

      {!isCheckingSession && currentView === 'list' && isLoading && (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 p-8 flex items-center justify-center text-rose-700">
          Loading letters...
        </div>
      )}

      {!isCheckingSession && currentView === 'list' && (
        !isLoading && (
          <LetterList
            letters={letters}
            onNewLetter={handleNewLetter}
            onViewLetter={handleViewLetter}
            onEditLetter={handleEditLetter}
            onDeleteLetter={handleDeleteLetter}
            onLogout={handleLogout}
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