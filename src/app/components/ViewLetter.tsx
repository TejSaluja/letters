import { ArrowLeft, Heart, Calendar, User } from 'lucide-react';

interface Letter {
  id: string;
  recipient: 'tej' | 'ridhi';
  author: string;
  content: string;
  date: string;
}

interface ViewLetterProps {
  letter: Letter;
  onBack: () => void;
}

export function ViewLetter({ letter, onBack }: ViewLetterProps) {
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
            {/* Letter Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
                <h2 className="text-3xl text-rose-900">To: {letter.recipient}</h2>
                <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
              </div>

              <div className="flex items-center justify-center gap-6 text-rose-700">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{letter.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(letter.date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent"></div>
              <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent"></div>
            </div>

            {/* Letter Body */}
            <div className="prose prose-rose max-w-none">
              <div className="text-rose-950 whitespace-pre-wrap leading-8 break-words">
                {letter.content}
              </div>
            </div>

            {/* Letter Footer */}
            <div className="mt-8 pt-6 border-t-2 border-rose-200 text-center">
              <p className="text-rose-600 italic">With all my love,</p>
              <p className="text-rose-900 mt-2">{letter.author}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
