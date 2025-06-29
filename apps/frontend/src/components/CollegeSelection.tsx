import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { api } from '../lib/api';

interface CollegeApplication {
  college_name: string;
  major: string;
  major_category: 'STEM' | 'Humanities' | 'Social Sciences' | 'Business' | 'Arts' | 'Health' | 'Education' | 'Other';
}

interface CollegeSelectionProps {
  successMessage?: string;
}

const CollegeSelection: React.FC<CollegeSelectionProps> = ({ successMessage }) => {
  const [applications, setApplications] = useState<CollegeApplication[]>([]);
  const [colleges, setColleges] = useState<string[]>([]);
  const [majors, setMajors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Don't fetch data on mount to avoid authentication issues
    // Data will be fetched when user interacts with dropdowns
  }, []);

  const fetchPopularColleges = async () => {
    if (colleges.length > 0) return;
    try {
      const { data } = await api.get('/college-selection/popular-colleges');
      setColleges(data.colleges);
    } catch (error) {
      console.error('Error fetching colleges:', error);
      setColleges([
        "Harvard University", "Stanford University", "MIT", "Yale University", 
        "Princeton University", "Columbia University", "University of Pennsylvania"
      ]);
    }
  };

  const fetchPopularMajors = async () => {
    if (majors.length > 0) return;
    try {
      const { data } = await api.get('/college-selection/popular-majors');
      setMajors(data.majors);
    } catch (error) {
      console.error('Error fetching majors:', error);
      setMajors([
        "Computer Science", "Engineering", "Mathematics", "Physics", "Chemistry", 
        "Biology", "Economics", "Political Science", "History", "English"
      ]);
    }
  };

  const addApplication = () => {
    setApplications([...applications, {
      college_name: '',
      major: '',
      major_category: 'STEM'
    }]);
  };

  const removeApplication = (index: number) => {
    setApplications(applications.filter((_, i) => i !== index));
  };

  const updateApplication = (index: number, field: keyof CollegeApplication, value: string) => {
    const updated = [...applications];
    updated[index] = { ...updated[index], [field]: value };
    setApplications(updated);
  };

  const getMajorCategory = (major: string): CollegeApplication['major_category'] => {
    const stemMajors = ['Computer Science', 'Engineering', 'Mathematics', 'Physics', 'Chemistry', 'Biology'];
    const humanitiesMajors = ['English', 'History', 'Philosophy', 'Literature'];
    const businessMajors = ['Business Administration', 'Finance', 'Economics'];
    const artsMajors = ['Art', 'Music', 'Theater', 'Film'];
    const healthMajors = ['Pre-Medicine', 'Nursing', 'Public Health'];
    const educationMajors = ['Education', 'Teaching'];
    const socialSciencesMajors = ['Political Science', 'Sociology', 'Psychology'];

    if (stemMajors.some(m => major.includes(m))) return 'STEM';
    if (humanitiesMajors.some(m => major.includes(m))) return 'Humanities';
    if (businessMajors.some(m => major.includes(m))) return 'Business';
    if (artsMajors.some(m => major.includes(m))) return 'Arts';
    if (healthMajors.some(m => major.includes(m))) return 'Health';
    if (educationMajors.some(m => major.includes(m))) return 'Education';
    if (socialSciencesMajors.some(m => major.includes(m))) return 'Social Sciences';
    return 'Other';
  };

  const handleSubmit = async () => {
    if (applications.length === 0) {
      alert('Please add at least one college application');
      return;
    }
    const validApplications = applications.map(app => ({
      ...app,
      major_category: getMajorCategory(app.major)
    })).filter(app => app.college_name && app.major);
    if (validApplications.length !== applications.length) {
      alert('Please fill in all college and major fields');
      return;
    }
    setSubmitting(true);
    console.log("valid applications: ", validApplications)

    try {
      console.log('Submitting applications:', validApplications);
    
      const { data } = await api.post('/college-selection/submit-applications', validApplications);
    
      alert(`Successfully submitted ${data.applications_created} applications!`);
      router.push('/matching');
    } catch (error) {
      console.error('Error submitting applications:', error);
      const err = error as any;
      if (err.response) {
        // Axios error with a response from the server
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
        alert(`Error: ${JSON.stringify(err.response.data)}`);
      } else {
        alert('Error submitting applications. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Select Your Colleges
          </h1>
          
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              {successMessage}
            </div>
          )}
          
          <p className="text-gray-600 mb-8 text-center">
            Tell us which colleges and majors you're applying to. We'll match you with the best consultants for each application.
          </p>

          <div className="space-y-6">
            {applications.map((app, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Application #{index + 1}
                  </h3>
                  <button
                    onClick={() => removeApplication(index)}
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      College/University
                    </label>
                    <select
                      value={app.college_name}
                      onChange={(e) => updateApplication(index, 'college_name', e.target.value)}
                      onFocus={() => fetchPopularColleges()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a college...</option>
                      {colleges.map((college) => (
                        <option key={college} value={college}>
                          {college}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Major
                    </label>
                    <select
                      value={app.major}
                      onChange={(e) => updateApplication(index, 'major', e.target.value)}
                      onFocus={() => fetchPopularMajors()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a major...</option>
                      {majors.map((major) => (
                        <option key={major} value={major}>
                          {major}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={addApplication}
              className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors"
            >
              + Add Another College Application
            </button>

            <div className="flex justify-center pt-6">
              <button
                onClick={handleSubmit}
                disabled={submitting || applications.length === 0}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit Applications & Start Matching'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollegeSelection; 