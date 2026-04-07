import { useState, useEffect } from 'react';
import { LetterList } from './components/LetterList';
import { WriteLetter } from './components/WriteLetter';
import { ViewLetter } from './components/ViewLetter';
import { sendLetterNotification } from './notifications';

type Recipient = 'tej' | 'ridhi';

interface Letter {
  id: string;
  recipient: Recipient;
  author: string;
  content: string;
  date: string;
}

type View = 'list' | 'write' | 'view';

export default function App() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [currentView, setCurrentView] = useState<View>('list');
  const [selectedLetterId, setSelectedLetterId] = useState<string | null>(null);
  const [editingLetterId, setEditingLetterId] = useState<string | null>(null);

  // Load letters from localStorage on mount
  useEffect(() => {
    const storedLetters = localStorage.getItem('loveLetters');
    if (storedLetters) {
      try {
        const parsedLetters = JSON.parse(storedLetters) as Array<Partial<Letter>>;
        const normalized = parsedLetters
          .filter((letter): letter is Partial<Letter> & { id: string } => typeof letter.id === 'string')
          .map((letter): Letter => {
            const recipient: Recipient = letter.recipient === 'ridhi' ? 'ridhi' : 'tej';

            return {
              id: letter.id,
              recipient,
              author: typeof letter.author === 'string' ? letter.author : '',
              content: typeof letter.content === 'string' ? letter.content : '',
              date: typeof letter.date === 'string' ? letter.date : new Date().toISOString(),
            };
          });
        setLetters(normalized);
      } catch (error) {
        console.error('Error loading letters:', error);
      }
    }
  }, []);

  // Save letters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('loveLetters', JSON.stringify(letters));
  }, [letters]);

  const handleNewLetter = () => {
    setEditingLetterId(null);
    setCurrentView('write');
  };

  const handleSaveLetter = async (letterData: { recipient: Recipient; author: string; content: string }) => {
    if (editingLetterId) {
      // Update existing letter
      setLetters((prev) =>
        prev.map((letter) =>
          letter.id === editingLetterId
            ? { ...letter, ...letterData }
            : letter
        )
      );
      setEditingLetterId(null);
    } else {
      // Create new letter
      const newLetter: Letter = {
        id: Date.now().toString(),
        ...letterData,
        date: new Date().toISOString(),
      };
      setLetters((prev) => [...prev, newLetter]);

      try {
        await sendLetterNotification({
          recipient: newLetter.recipient,
          author: newLetter.author,
        });
      } catch (error) {
        console.error('Failed to send notification:', error);
        alert('Letter saved, but notification could not be sent right now.');
      }
    }
    setCurrentView('list');
  };

  const handleEditLetter = (id: string) => {
    setEditingLetterId(id);
    setCurrentView('write');
  };

  const handleDeleteLetter = (id: string) => {
    setLetters((prev) => prev.filter((letter) => letter.id !== id));
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
      {currentView === 'list' && (
        <LetterList
          letters={letters}
          onNewLetter={handleNewLetter}
          onViewLetter={handleViewLetter}
          onEditLetter={handleEditLetter}
          onDeleteLetter={handleDeleteLetter}
        />
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