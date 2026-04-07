import { useState } from 'react';
import { ArrowLeft, Send, Heart } from 'lucide-react';

interface WriteLetterProps {
  onBack: () => void;
  onSave: (letter: { recipient: 'tej' | 'ridhi'; author: string; content: string }) => Promise<void> | void;
  initialData?: {
    recipient: 'tej' | 'ridhi';
    author: string;
    content: string;
  };
  isEditing?: boolean;
}

export function WriteLetter({ onBack, onSave, initialData, isEditing = false }: WriteLetterProps) {
  const [recipient, setRecipient] = useState<'tej' | 'ridhi'>(initialData?.recipient || 'tej');
  const [author, setAuthor] = useState(initialData?.author || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!author.trim() || !content.trim() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({ recipient, author: author.trim(), content: content.trim() });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-rose-700 hover:text-rose-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Letters</span>
        </button>

        {/* Letter Paper */}
        <div className="relative">
          {/* Letter Content */}
          <div className="relative bg-gradient-to-br from-amber-50 to-yellow-50 rounded-3xl shadow-2xl p-8 md:p-12 border-4 border-rose-200 overflow-hidden"
            style={{
              backgroundImage: `
                repeating-linear-gradient(
                  transparent,
                  transparent 31px,
                  rgba(219, 39, 119, 0.1) 31px,
                  rgba(219, 39, 119, 0.1) 32px
                ),
                url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cg opacity='0.15'%3E%3Ccircle cx='20' cy='20' r='15' fill='%23fb7185'/%3E%3Ccircle cx='20' cy='20' r='10' fill='%23fda4af'/%3E%3Ccircle cx='20' cy='20' r='5' fill='%23fef08a'/%3E%3Cellipse cx='10' cy='25' rx='8' ry='15' fill='%23fb7185' transform='rotate(-30 10 25)'/%3E%3Cellipse cx='30' cy='25' rx='8' ry='15' fill='%23fb7185' transform='rotate(30 30 25)'/%3E%3Cellipse cx='15' cy='10' rx='8' ry='15' fill='%23ec4899' transform='rotate(-60 15 10)'/%3E%3Cellipse cx='25' cy='10' rx='8' ry='15' fill='%23ec4899' transform='rotate(60 25 10)'/%3E%3Cellipse cx='12' cy='32' rx='8' ry='15' fill='%23f472b6' transform='rotate(-15 12 32)'/%3E%3Cellipse cx='28' cy='32' rx='8' ry='15' fill='%23f472b6' transform='rotate(15 28 32)'/%3E%3C/g%3E%3C/svg%3E"),
                url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cg opacity='0.15'%3E%3Ccircle cx='20' cy='20' r='15' fill='%23fb7185'/%3E%3Ccircle cx='20' cy='20' r='10' fill='%23fda4af'/%3E%3Ccircle cx='20' cy='20' r='5' fill='%23fef08a'/%3E%3Cellipse cx='10' cy='25' rx='8' ry='15' fill='%23fb7185' transform='rotate(-30 10 25)'/%3E%3Cellipse cx='30' cy='25' rx='8' ry='15' fill='%23fb7185' transform='rotate(30 30 25)'/%3E%3Cellipse cx='15' cy='10' rx='8' ry='15' fill='%23ec4899' transform='rotate(-60 15 10)'/%3E%3Cellipse cx='25' cy='10' rx='8' ry='15' fill='%23ec4899' transform='rotate(60 25 10)'/%3E%3Cellipse cx='12' cy='32' rx='8' ry='15' fill='%23f472b6' transform='rotate(-15 12 32)'/%3E%3Cellipse cx='28' cy='32' rx='8' ry='15' fill='%23f472b6' transform='rotate(15 28 32)'/%3E%3C/g%3E%3C/svg%3E"),
                url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cg opacity='0.15'%3E%3Ccircle cx='20' cy='20' r='15' fill='%23fb7185'/%3E%3Ccircle cx='20' cy='20' r='10' fill='%23fda4af'/%3E%3Ccircle cx='20' cy='20' r='5' fill='%23fef08a'/%3E%3Cellipse cx='10' cy='25' rx='8' ry='15' fill='%23fb7185' transform='rotate(-30 10 25)'/%3E%3Cellipse cx='30' cy='25' rx='8' ry='15' fill='%23fb7185' transform='rotate(30 30 25)'/%3E%3Cellipse cx='15' cy='10' rx='8' ry='15' fill='%23ec4899' transform='rotate(-60 15 10)'/%3E%3Cellipse cx='25' cy='10' rx='8' ry='15' fill='%23ec4899' transform='rotate(60 25 10)'/%3E%3Cellipse cx='12' cy='32' rx='8' ry='15' fill='%23f472b6' transform='rotate(-15 12 32)'/%3E%3Cellipse cx='28' cy='32' rx='8' ry='15' fill='%23f472b6' transform='rotate(15 28 32)'/%3E%3C/g%3E%3C/svg%3E"),
                url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cg opacity='0.15'%3E%3Ccircle cx='20' cy='20' r='15' fill='%23fb7185'/%3E%3Ccircle cx='20' cy='20' r='10' fill='%23fda4af'/%3E%3Ccircle cx='20' cy='20' r='5' fill='%23fef08a'/%3E%3Cellipse cx='10' cy='25' rx='8' ry='15' fill='%23fb7185' transform='rotate(-30 10 25)'/%3E%3Cellipse cx='30' cy='25' rx='8' ry='15' fill='%23fb7185' transform='rotate(30 30 25)'/%3E%3Cellipse cx='15' cy='10' rx='8' ry='15' fill='%23ec4899' transform='rotate(-60 15 10)'/%3E%3Cellipse cx='25' cy='10' rx='8' ry='15' fill='%23ec4899' transform='rotate(60 25 10)'/%3E%3Cellipse cx='12' cy='32' rx='8' ry='15' fill='%23f472b6' transform='rotate(-15 12 32)'/%3E%3Cellipse cx='28' cy='32' rx='8' ry='15' fill='%23f472b6' transform='rotate(15 28 32)'/%3E%3C/g%3E%3C/svg%3E")
              `,
              backgroundSize: 'auto, 156px 156px, 156px 156px, 156px 156px, 156px 156px',
              backgroundPosition: 'center, top 10px left 10px, top 10px right -115px, bottom -110px left 10px, bottom -110px right -115px',
              backgroundRepeat: 'repeat, no-repeat, no-repeat, no-repeat, no-repeat'
            }}
          >
            <div className="flex items-center justify-center gap-3 mb-8">
              <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
              <h2 className="text-3xl text-rose-900">
                {isEditing ? 'Edit Your Letter' : 'Write a Love Letter'}
              </h2>
              <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
            </div>

            <div className="space-y-6">
              {/* Recipient Input */}
              <div>
                <label className="block text-rose-900 mb-2">To:</label>
                <select
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value as 'tej' | 'ridhi')}
                  className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-rose-200 rounded-xl focus:outline-none focus:border-rose-400 text-rose-950"
                >
                  <option value="tej">tej</option>
                  <option value="ridhi">ridhi</option>
                </select>
              </div>

              {/* Author Input */}
              <div>
                <label className="block text-rose-900 mb-2">From:</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-rose-200 rounded-xl focus:outline-none focus:border-rose-400 text-rose-950 placeholder-rose-400"
                />
              </div>

              {/* Content Textarea */}
              <div>
                <label className="block text-rose-900 mb-2">Your Letter:</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your message here..."
                  rows={12}
                  className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-rose-200 rounded-xl focus:outline-none focus:border-rose-400 text-rose-950 placeholder-rose-400 resize-none overflow-y-auto"
                  style={{ lineHeight: '32px' }}
                />
              </div>

              {/* Send Button */}
              <button
                onClick={handleSubmit}
                disabled={!author.trim() || !content.trim() || isSubmitting}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-400 text-white py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 disabled:cursor-not-allowed"
              >
                <Send className="w-6 h-6" />
                <span className="text-xl">
                  {isSubmitting ? 'Sending...' : isEditing ? 'Update Letter' : 'Send Letter'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
