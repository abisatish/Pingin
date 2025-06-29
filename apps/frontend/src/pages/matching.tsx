import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import MatchingScreen from '../components/MatchingScreen';

export default function MatchingPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get token from localStorage
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      router.push('/login');
      return;
    }
    setToken(storedToken);
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <MatchingScreen />;
} 