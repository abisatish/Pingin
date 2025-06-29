import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { api } from "@/lib/api";

interface QuizData {
  passionate_subjects: string[];
  academic_competitions: string[];
  has_published_research: boolean;
  extracurricular_activities: string[];
  gender?: string;
  family_income_bracket?: string;
  is_first_generation?: boolean;
  citizenship_status?: string;
  is_underrepresented_group?: string;
  other_subjects?: string;
  other_activities?: string;
}

const SUBJECTS = [
  "Mathematics", "Computer Science", "Biology", "Chemistry", "Physics",
  "Environmental Science", "Engineering", "Economics", "Political Science",
  "History", "Literature / English", "Philosophy", "Psychology", "Sociology",
  "Art / Art History", "Music Theory / Performance", "Foreign Languages (e.g., Spanish, French, Chinese)",
  "Business / Entrepreneurship", "Law / Pre-Law", "Education / Teaching"
];

const COMPETITIONS = [
  "USACO (Informatics Olympiad)", "ISEF (Science & Engineering Fair)", 
  "AMC / AIME (Math Olympiad)", "Science Olympiad", "DECA", "Model UN",
  "FIRST Robotics", "Intel STS / Regeneron"
];

const ACTIVITIES = [
  "Varsity Athletics", "Debate or Speech", "Performing Arts (e.g., Band, Theater)",
  "Volunteering / Community Service", "Entrepreneurship / Startup Projects", "Student Government"
];

const INCOME_BRACKETS = [
  "<$50,000", "$50,000–$100,000", "$100,000–$200,000", "$200,000+", "Prefer not to say"
];

const CITIZENSHIP_STATUSES = [
  "U.S. Citizen", "U.S. Permanent Resident", "International Student"
];

const UNDERREPRESENTED_OPTIONS = [
  "Yes", "No", "Prefer not to say"
];

export default function MatchingQuiz() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [role, setRole] = useState<string | null>(null);
  const [quizData, setQuizData] = useState<QuizData>({
    passionate_subjects: [],
    academic_competitions: [],
    has_published_research: false,
    extracurricular_activities: [],
    gender: "",
    family_income_bracket: "",
    is_first_generation: undefined,
    citizenship_status: "",
    is_underrepresented_group: ""
  });
  const [thankYou, setThankYou] = useState(false);
  const [checkingCompletion, setCheckingCompletion] = useState(true);

  useEffect(() => {
    // Fetch quiz completion and role from API
    const checkQuizCompletion = async () => {
      try {
        // Try consultant endpoint first, fallback to student
        let res;
        try {
          res = await api.get("/consultant-matching-quiz/check-completion");
        } catch {
          res = await api.get("/matching-quiz/check-completion");
        }
        const data = res.data;
        setRole(data.role);
        if (data.quiz_completed) {
          if (data.role === "consultant") await router.push("/dashboard");
          else router.push("/dashboard");
        }
      } catch (error) {
        console.error("Error checking quiz completion:", error);
      } finally {
        setCheckingCompletion(false);
      }
    };
    checkQuizCompletion();
  }, [router]);

  if (checkingCompletion) {
    return null;
  }

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (role === "consultant") {
        await api.post("/consultant-matching-quiz/submit", quizData);
        await router.push("/dashboard");
      } else {
        await api.post("/matching-quiz/submit", quizData);
        await router.push("/college-selection?message=Quiz completed successfully!");
      }
    } catch (error: any) {
      let errorMessage = "Error submitting quiz. Please try again.";
      if (error.response?.data?.detail) {
        errorMessage = `Error: ${error.response.data.detail}`;
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateArrayField = (field: keyof QuizData, value: string, checked: boolean) => {
    const currentArray = quizData[field] as string[] || [];
    if (checked) {
      setQuizData(prev => ({
        ...prev,
        [field]: [...currentArray, value]
      }));
    } else {
      setQuizData(prev => ({
        ...prev,
        [field]: currentArray.filter(item => item !== value)
      }));
    }
  };

  const renderStep1 = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-white text-3xl font-bold font-montserrat leading-tight tracking-tight">
          The subjects I am most passionate about are...
        </h1>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {SUBJECTS.map(subject => (
          <button
            key={subject}
            onClick={() => {
              const isSelected = quizData.passionate_subjects.includes(subject);
              updateArrayField('passionate_subjects', subject, !isSelected);
            }}
            className={`text-left p-6 rounded-2xl border transition-all duration-300 font-montserrat text-lg leading-relaxed ${
              quizData.passionate_subjects.includes(subject)
                ? 'bg-white/40 border-white/50 text-white scale-105 shadow-lg'
                : 'bg-white/15 border-white/10 text-white hover:bg-white/20 hover:border-white/30 hover:scale-102'
            }`}
          >
            {subject}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <label className="block text-white font-montserrat font-medium mb-3">Other subjects:</label>
        <input
          type="text"
          value={quizData.other_subjects || ""}
          onChange={(e) => setQuizData(prev => ({ ...prev, other_subjects: e.target.value }))}
          className="w-full p-4 bg-white/15 border border-white/10 rounded-2xl text-white placeholder-white/60 font-montserrat"
          placeholder="Enter other subjects..."
        />
      </div>

      <div className="text-center mt-8">
        <h1 className="text-white text-3xl font-bold font-montserrat leading-tight tracking-tight">
          Have you competed in academic competitions?
        </h1>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {COMPETITIONS.map(competition => (
          <button
            key={competition}
            onClick={() => {
              const isSelected = quizData.academic_competitions.includes(competition);
              updateArrayField('academic_competitions', competition, !isSelected);
            }}
            className={`text-left p-6 rounded-2xl border transition-all duration-300 font-montserrat text-lg leading-relaxed ${
              quizData.academic_competitions.includes(competition)
                ? 'bg-white/40 border-white/50 text-white scale-105 shadow-lg'
                : 'bg-white/15 border-white/10 text-white hover:bg-white/20 hover:border-white/30 hover:scale-102'
            }`}
          >
            {competition}
          </button>
        ))}
      </div>

      <div className="text-center mt-8">
        <h1 className="text-white text-3xl font-bold font-montserrat leading-tight tracking-tight">
          Have you published any research papers or preprints?
        </h1>
        <div className="flex justify-center space-x-8 mt-6">
          <button
            onClick={() => setQuizData(prev => ({ ...prev, has_published_research: true }))}
            className={`px-8 py-4 rounded-2xl border transition-all duration-300 font-montserrat text-lg ${
              quizData.has_published_research === true
                ? 'bg-white/40 border-white/50 text-white scale-105 shadow-lg'
                : 'bg-white/15 border-white/10 text-white hover:bg-white/20 hover:border-white/30'
            }`}
          >
            Yes
          </button>
          <button
            onClick={() => setQuizData(prev => ({ ...prev, has_published_research: false }))}
            className={`px-8 py-4 rounded-2xl border transition-all duration-300 font-montserrat text-lg ${
              quizData.has_published_research === false
                ? 'bg-white/40 border-white/50 text-white scale-105 shadow-lg'
                : 'bg-white/15 border-white/10 text-white hover:bg-white/20 hover:border-white/30'
            }`}
          >
            No
          </button>
        </div>
      </div>

      <div className="text-center mt-8">
        <h1 className="text-white text-3xl font-bold font-montserrat leading-tight tracking-tight">
          Are you involved in any of the following activities?
        </h1>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {ACTIVITIES.map(activity => (
          <button
            key={activity}
            onClick={() => {
              const isSelected = quizData.extracurricular_activities.includes(activity);
              updateArrayField('extracurricular_activities', activity, !isSelected);
            }}
            className={`text-left p-6 rounded-2xl border transition-all duration-300 font-montserrat text-lg leading-relaxed ${
              quizData.extracurricular_activities.includes(activity)
                ? 'bg-white/40 border-white/50 text-white scale-105 shadow-lg'
                : 'bg-white/15 border-white/10 text-white hover:bg-white/20 hover:border-white/30 hover:scale-102'
            }`}
          >
            {activity}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <label className="block text-white font-montserrat font-medium mb-3">Other activities:</label>
        <input
          type="text"
          value={quizData.other_activities || ""}
          onChange={(e) => setQuizData(prev => ({ ...prev, other_activities: e.target.value }))}
          className="w-full p-4 bg-white/15 border border-white/10 rounded-2xl text-white placeholder-white/60 font-montserrat"
          placeholder="Enter other activities..."
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-white text-3xl font-bold font-montserrat leading-tight tracking-tight">
          Demographics (Optional)
        </h1>
        <p className="text-white/80 font-montserrat text-lg mt-4 max-w-md mx-auto leading-relaxed">
          This information helps us match you with the best consultants.
        </p>
      </div>
      
      <div className="text-center">
        <h1 className="text-white text-3xl font-bold font-montserrat leading-tight tracking-tight">
          What is your gender?
        </h1>
        <input
          type="text"
          value={quizData.gender || ""}
          onChange={(e) => setQuizData(prev => ({ ...prev, gender: e.target.value }))}
          className="w-full max-w-md mx-auto mt-6 p-4 bg-white/15 border border-white/10 rounded-2xl text-white placeholder-white/60 font-montserrat"
          placeholder="e.g., Male, Female, Non-binary, etc."
        />
      </div>

      <div className="text-center">
        <h1 className="text-white text-3xl font-bold font-montserrat leading-tight tracking-tight">
          What is your family's approximate income bracket?
        </h1>
        <div className="flex flex-col space-y-3 mt-6 max-w-md mx-auto">
          {INCOME_BRACKETS.map(bracket => (
            <button
              key={bracket}
              onClick={() => setQuizData(prev => ({ ...prev, family_income_bracket: bracket }))}
              className={`p-4 rounded-2xl border transition-all duration-300 font-montserrat text-lg ${
                quizData.family_income_bracket === bracket
                  ? 'bg-white/40 border-white/50 text-white scale-105 shadow-lg'
                  : 'bg-white/15 border-white/10 text-white hover:bg-white/20 hover:border-white/30'
              }`}
            >
              {bracket}
            </button>
          ))}
        </div>
      </div>

      <div className="text-center">
        <h1 className="text-white text-3xl font-bold font-montserrat leading-tight tracking-tight">
          Are you a first-generation college applicant?
        </h1>
        <div className="flex justify-center space-x-8 mt-6">
          <button
            onClick={() => setQuizData(prev => ({ ...prev, is_first_generation: true }))}
            className={`px-8 py-4 rounded-2xl border transition-all duration-300 font-montserrat text-lg ${
              quizData.is_first_generation === true
                ? 'bg-white/40 border-white/50 text-white scale-105 shadow-lg'
                : 'bg-white/15 border-white/10 text-white hover:bg-white/20 hover:border-white/30'
            }`}
          >
            Yes
          </button>
          <button
            onClick={() => setQuizData(prev => ({ ...prev, is_first_generation: false }))}
            className={`px-8 py-4 rounded-2xl border transition-all duration-300 font-montserrat text-lg ${
              quizData.is_first_generation === false
                ? 'bg-white/40 border-white/50 text-white scale-105 shadow-lg'
                : 'bg-white/15 border-white/10 text-white hover:bg-white/20 hover:border-white/30'
            }`}
          >
            No
          </button>
        </div>
      </div>

      <div className="text-center">
        <h1 className="text-white text-3xl font-bold font-montserrat leading-tight tracking-tight">
          Are you an international student or U.S. resident/citizen?
        </h1>
        <div className="flex flex-col space-y-3 mt-6 max-w-md mx-auto">
          {CITIZENSHIP_STATUSES.map(status => (
            <button
              key={status}
              onClick={() => setQuizData(prev => ({ ...prev, citizenship_status: status }))}
              className={`p-4 rounded-2xl border transition-all duration-300 font-montserrat text-lg ${
                quizData.citizenship_status === status
                  ? 'bg-white/40 border-white/50 text-white scale-105 shadow-lg'
                  : 'bg-white/15 border-white/10 text-white hover:bg-white/20 hover:border-white/30'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="text-center">
        <h1 className="text-white text-3xl font-bold font-montserrat leading-tight tracking-tight">
          Do you identify as part of an underrepresented group in higher ed?
        </h1>
        <p className="text-white/80 font-montserrat text-lg mt-2 mb-6">
          (e.g., by race/ethnicity, disability, rural background, etc.)
        </p>
        <div className="flex flex-col space-y-3 max-w-md mx-auto">
          {UNDERREPRESENTED_OPTIONS.map(option => (
            <button
              key={option}
              onClick={() => setQuizData(prev => ({ ...prev, is_underrepresented_group: option }))}
              className={`p-4 rounded-2xl border transition-all duration-300 font-montserrat text-lg ${
                quizData.is_underrepresented_group === option
                  ? 'bg-white/40 border-white/50 text-white scale-105 shadow-lg'
                  : 'bg-white/15 border-white/10 text-white hover:bg-white/20 hover:border-white/30'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  if (thankYou && role === "consultant") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-100">
        <div className="bg-white p-8 rounded shadow text-center">
          <h1 className="text-2xl font-bold mb-4">Thank you for completing your consultant profile!</h1>
          <p className="text-lg">Your expertise will help us match you with the right students.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-600 to-pink-600 flex items-center justify-center p-5">
      {/* Background blur elements */}
      <div className="absolute top-20 left-10 w-24 h-24 bg-gradient-to-r from-pink-400 to-violet-400 rounded-full opacity-30 blur-3xl"></div>
      <div className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-r from-pink-400 to-violet-400 rounded-full opacity-30 blur-3xl"></div>
      <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-gradient-to-r from-pink-400 to-violet-400 rounded-full opacity-30 blur-3xl"></div>
      
      <div className="w-full max-w-4xl relative z-10">
        {/* Progress indicator */}
        <div className="text-center mb-8">
          <div className="text-white font-montserrat text-2xl font-semibold mb-4">
            {currentStep} of 2
          </div>
          <div className="flex justify-center space-x-2 mb-8">
            <div className={`w-16 h-2 rounded-full transition-all duration-500 ${
              currentStep >= 1 ? 'bg-gradient-to-r from-pink-400 to-violet-400' : 'bg-white/30'
            }`}></div>
            <div className={`w-8 h-2 rounded-full transition-all duration-500 ${
              currentStep >= 2 ? 'bg-gradient-to-r from-pink-400 to-violet-400' : 'bg-white/30'
            }`}></div>
          </div>
        </div>

        {/* Main quiz container */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
          {currentStep === 1 ? renderStep1() : renderStep2()}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
          {currentStep > 1 && (
            <button
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="px-8 py-4 bg-white/15 border border-white/10 rounded-2xl text-white font-montserrat font-semibold hover:bg-white/20 hover:border-white/30 transition-all duration-300"
            >
              Previous
            </button>
          )}
          
          <div className="ml-auto">
            {currentStep < 2 ? (
              <button
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="px-8 py-4 bg-gradient-to-r from-pink-400 to-violet-400 text-white rounded-2xl font-montserrat font-semibold hover:scale-105 transition-all duration-300 shadow-lg"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-2xl font-montserrat font-semibold hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Submitting..." : "Submit Quiz"}
              </button>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
        .font-montserrat {
          font-family: 'Montserrat', sans-serif;
        }
      `}</style>
    </div>
  );
} 