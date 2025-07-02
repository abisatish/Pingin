import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { api } from '../lib/api';

interface Consultant {
  id: number;
  name: string;
  email: string;
}

interface MatchingStatus {
  matching_completed: boolean;
  matched_applications: number;
  total_applications: number;
  applications: Array<{
    id: number;
    college_name: string;
    major: string;
    consultant_id: number;
    match_score: number;
  }>;
}

const MatchingScreen: React.FC = () => {
  const [matchingStatus, setMatchingStatus] = useState<MatchingStatus | null>(null);
  const [consultants, setConsultants] = useState<Record<number, Consultant>>({});
  const [isMatching, setIsMatching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkMatchingStatus();
  }, []);

  const fetchConsultantDetails = async (consultantId: number) => {
    try {
      const { data } = await api.get(`/consultants/${consultantId}`);
      return data;
    } catch (error: any) {
      console.error(`Error fetching consultant ${consultantId}:`, error);
      return null;
    }
  };

  const fetchAllConsultants = async (applications: MatchingStatus['applications']) => {
    const consultantIds = applications
      .filter(app => app.consultant_id)
      .map(app => app.consultant_id);
    
    const uniqueIds = [...new Set(consultantIds)];
    const consultantDetails: Record<number, Consultant> = {};
    
    for (const id of uniqueIds) {
      const consultant = await fetchConsultantDetails(id);
      if (consultant) {
        consultantDetails[id] = consultant;
      }
    }
    
    setConsultants(consultantDetails);
  };

  const checkMatchingStatus = async () => {
    try {
      const { data: status } = await api.get('/matching/matching-status');
      setMatchingStatus(status);
      if (status.matching_completed && status.applications.length > 0) {
        await fetchAllConsultants(status.applications);
        setIsMatching(false);
      }
    } catch (error) {
      console.error('Error checking matching status:', error);
      setError('Error checking matching status');
    }
  };

  const startMatching = async () => {
    setIsMatching(true);
    setError(null);
    try {
      const { data } = await api.post('/matching/start-matching');
      pollMatchingStatus();
    } catch (error: any) {
      if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else {
        setError('Failed to start matching');
      }
      setIsMatching(false);
    }
  };

  const pollMatchingStatus = () => {
    const interval = setInterval(async () => {
      try {
        const { data: status } = await api.get('/matching/matching-status');
        setMatchingStatus(status);
        if (status.matching_completed) {
          if (status.applications.length > 0) {
            await fetchAllConsultants(status.applications);
          }
          setIsMatching(false);
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Error polling matching status:', error);
      }
    }, 2000);
    setTimeout(() => {
      clearInterval(interval);
      if (isMatching) {
        setIsMatching(false);
        setError('Matching process timed out. Please try again.');
      }
    }, 300000);
  };

  const goToDashboard = () => {
    router.push('/dashboard');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!matchingStatus) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (matchingStatus.matching_completed) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="text-green-500 text-6xl mb-4">✅</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Matching Complete!
              </h1>
              <p className="text-gray-600 mb-6">
                We've found the perfect consultants for your applications.
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Your Matches ({matchingStatus.matched_applications}/{matchingStatus.total_applications})
              </h2>
              
              {matchingStatus.applications.map((app) => (
                <div key={app.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-gray-900">{app.college_name}</h3>
                      <p className="text-gray-600">{app.major}</p>
                      {app.consultant_id && consultants[app.consultant_id] && (
                        <p className="text-blue-600 font-medium mt-1">
                          Matched with: {consultants[app.consultant_id].name}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Match Score</div>
                      <div className="text-lg font-bold text-green-600">{app.match_score}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={goToDashboard}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                View Your Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          {isMatching ? (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Finding Your Perfect Matches...
              </h1>
              <p className="text-gray-600 mb-6">
                We're analyzing your profile and matching you with the best consultants for each of your applications.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  This usually takes 30-60 seconds. Please don't close this page.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="text-blue-500 text-6xl mb-4">🎯</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Find Your Mentors?
              </h1>
              <p className="text-gray-600 mb-6">
                Click the button below to start the matching process. We'll find the best consultants for your applications.
              </p>
              <button
                onClick={startMatching}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Start Matching
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchingScreen; 