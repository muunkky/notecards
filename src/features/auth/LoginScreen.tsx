import React from 'react';
import { useAuthContext } from '../../providers/AuthProvider';

export const LoginScreen: React.FC = () => {
  const { signIn } = useAuthContext();

  const handleSignIn = async () => {
    try {
      await signIn();
    } catch (error) {
      console.error('Failed to sign in:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to Notecards
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to start studying
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <button
            onClick={handleSignIn}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign In Anonymously
          </button>
        </div>
      </div>
    </div>
  );
};
