import { useState } from 'react';
import { Heart, Lock, Sparkles } from 'lucide-react';

interface LoginPageProps {
  onLogin: (password: string) => Promise<void> | void;
  errorMessage?: string | null;
}

export function LoginPage({ onLogin, errorMessage = null }: LoginPageProps) {
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!password || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onLogin(password);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-lg rounded-3xl border-2 border-rose-200 bg-white/70 backdrop-blur-md shadow-2xl p-8 md:p-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-100 px-4 py-2 mb-5">
            <Sparkles className="h-4 w-4 text-rose-500" />
            <span className="text-rose-700">Private letters</span>
          </div>
          <div className="flex items-center justify-center gap-3 mb-3">
            <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
            <h1 className="text-3xl md:text-4xl text-rose-900">what&apos;s the secret password?</h1>
            <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
          </div>
          <p className="text-rose-700">Enter the shared password to open your letter list.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-rose-900" htmlFor="password-input">
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-rose-400" />
            <input
              id="password-input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              placeholder="Enter secret password"
              className="w-full rounded-2xl border-2 border-rose-200 bg-white/80 py-3 pl-12 pr-4 text-rose-950 placeholder-rose-400 focus:border-rose-400 focus:outline-none"
            />
          </div>

          {errorMessage && (
            <p className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-rose-700">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={!password || isSubmitting}
            className="w-full rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 py-3 text-white shadow-lg transition-all duration-300 hover:from-rose-600 hover:to-pink-600 hover:shadow-xl disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-400"
          >
            {isSubmitting ? 'Checking...' : 'Unlock Letters'}
          </button>
        </form>
      </div>
    </div>
  );
}
