import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

interface EssayData {
  title: string;
  prompt: string;
  content: string;
  wordCount: string;
  lastUpdated: string;
}

const essayData: Record<number, EssayData> = {
  1: {
    title: "Personal Statement",
    prompt: "Tell us about something that is meaningful to you and why. (250-350 words)",
    content: "The rhythmic clicking of my grandmother's knitting needles became the soundtrack of my childhood summers. Each stitch represented more than just wool and yarn—it was a connection to our heritage, a meditation on patience, and a lesson in creating something beautiful from simple materials. When I was twelve, my grandmother taught me to knit. My first attempts were disastrous—dropped stitches, uneven tension, and more frustration than I'd ever experienced. But she sat beside me, her weathered hands guiding mine, teaching me that mistakes weren't failures but opportunities to learn. 'Mijo,' she would say, 'perfection isn't the goal. Understanding is.' Through knitting, I learned that mastery comes through practice, that beauty emerges from patience, and that our hands can create connections across generations. Now, whenever I feel overwhelmed by the complexity of modern life, I return to those simple movements—the yarn over, the knit stitch, the careful attention to tension and pattern. It grounds me, reminds me of what's truly important, and connects me to a tradition that spans centuries.",
    wordCount: "342/350",
    lastUpdated: "2 hours ago"
  },
  2: {
    title: "Roommate Letter",
    prompt: "Virtually all of Stanford's undergraduates live on campus. Write a note to your future roommate. (250 words)",
    content: "Hey future roommate! I'm so excited to meet you and start this incredible journey at Stanford together. A few things about me: I'm definitely a morning person (sorry if you're not!), but I promise to be quiet while you sleep. I love making playlists for every mood and activity - study beats, workout music, late-night chill vibes - so feel free to request custom soundtracks. I'm obsessed with trying new coffee shops and would love a study buddy for café adventures around Palo Alto. Fair warning: I tend to think out loud when working through complex problems, especially anything math-related. It helps me process, but let me know if it gets distracting! I'm hoping we can create a space that feels like home for both of us. I believe the best roommate relationships are built on communication, respect, and probably way too many late-night conversations about everything and nothing. I can't wait to learn about your interests, share stories about our hometowns, and maybe even convince you to join me for sunrise hikes in the foothills. Here's to an amazing year ahead!",
    wordCount: "178/250",
    lastUpdated: "1 week ago"
  },
  3: {
    title: "Short Essays",
    prompt: "Please respond to all short essay questions (50 words each): What is the most significant challenge society faces today?",
    content: "Climate change represents our generation's defining challenge, requiring unprecedented global cooperation and innovation. Beyond environmental impact, it's fundamentally about equity—those least responsible suffer most. Solutions demand both technological breakthroughs and social transformation, making it not just an environmental issue, but a test of our collective humanity and problem-solving capacity.",
    wordCount: "49/50",
    lastUpdated: "3 days ago"
  },
  4: {
    title: "Additional Essays",
    prompt: "Choose one: Reflect on an idea important to your intellectual development OR Tell us about an idea that fascinates you. (250 words)",
    content: "The concept of emergent intelligence has fundamentally shaped how I view complex systems, from ant colonies to neural networks to human societies. This idea—that simple rules at individual levels can produce sophisticated collective behavior—first captivated me during a biology class discussion about swarm intelligence. How do thousands of ants, each following basic chemical signals, create efficient supply chains and adapt to obstacles? This principle extends far beyond biology. In computer science, I've seen how simple algorithms can generate complex patterns and solve intricate problems. In economics, individual decisions create market dynamics no single person controls. Even in social movements, individual actions aggregate into transformative change. What fascinates me most is the unpredictability—you can understand the rules perfectly yet still be surprised by the outcomes. This has taught me humility in approaching complex problems and excitement about collaboration. When I volunteer with my school's peer tutoring program, I've watched how individual student interactions create a learning community greater than the sum of its parts. Understanding emergence has made me both more patient with gradual change and more optimistic about collective human potential. It's why I'm drawn to interdisciplinary studies—the most interesting solutions often emerge at the intersection of different fields, where simple ideas from one domain can create unexpected breakthroughs in another.",
    wordCount: "243/250",
    lastUpdated: "5 days ago"
  },
  5: {
    title: "Optional Essays",
    prompt: "Optional: Additional information about activities, employment, travel, family circumstances, etc. (150 words)",
    content: "I've been my family's primary translator since age ten, navigating everything from parent-teacher conferences to medical appointments. This responsibility taught me patience, precision, and cultural bridging. My parents immigrated from Mexico with limited English, working multiple jobs to support our family. Translating wasn't just about language—it meant explaining American educational systems, helping with tax documents, and mediating cultural differences. This experience sparked my interest in communication and advocacy. I've since volunteered as a translator for our local community center, helping other immigrant families access resources. These experiences have shaped my empathy and problem-solving skills, while giving me deep appreciation for the strength required to start over in a new country. They've also motivated my academic pursuits—I want to create systems and technologies that break down barriers for underserved communities. My family's journey has been my greatest teacher.",
    wordCount: "147/150",
    lastUpdated: "1 week ago"
  }
};

const activities = [
  {
    number: 1,
    title: "Student Body President",
    description: "Led student government of 2,000+ students, organized school-wide events, managed $50,000 annual budget, and implemented new policies for student wellness programs.",
    category: "leadership"
  },
  {
    number: 2,
    title: "Math Tutoring Program",
    description: "Created and led peer tutoring program serving 50+ students, increased average math scores by 15%, and trained 12 volunteer tutors in effective teaching methods.",
    category: "leadership"
  },
  {
    number: 3,
    title: "National Honor Society",
    description: "Member since junior year, organized community service projects, maintained 4.0+ GPA requirement, and led scholarship fundraising initiatives.",
    category: "leadership"
  },
  {
    number: 4,
    title: "Debate Team Captain",
    description: "3-year member and captain, qualified for state tournament, regional finalist in policy debate, and mentored underclassmen in argumentation techniques.",
    category: "leadership"
  },
  {
    number: 5,
    title: "School Newspaper Editor",
    description: "Managed editorial team, increased readership by 40%, won regional journalism award, and covered important school policy changes.",
    category: "leadership"
  },
  {
    number: 6,
    title: "Varsity Tennis Team Captain",
    description: "4-year varsity player, team captain for final 2 years, led team to consecutive state championships, and maintained team GPA above 3.8.",
    category: "athletics"
  },
  {
    number: 7,
    title: "Hospital Research Intern",
    description: "Summer research on pediatric care effectiveness, collaborated with medical team, presented findings at regional medical conference, and co-authored research paper.",
    category: "athletics"
  },
  {
    number: 8,
    title: "Volunteer Coordinator",
    description: "Organized community clean-up events, coordinated 100+ volunteers monthly, partnered with local environmental groups, and led sustainability initiatives.",
    category: "athletics"
  },
  {
    number: 9,
    title: "Science Olympiad Team",
    description: "Competed in Chemistry and Biology events, placed 3rd at state level, led team study sessions, and mentored junior team members.",
    category: "athletics"
  },
  {
    number: 10,
    title: "Youth Leadership Council",
    description: "Selected representative for city youth programs and policy discussions, advocated for teen mental health resources, and organized civic engagement events.",
    category: "athletics"
  }
];

export default function CollegePage() {
  const router = useRouter();
  const { collegeId } = router.query;
  const [selectedPrompt, setSelectedPrompt] = useState<number | null>(null);
  const [currentEssay, setCurrentEssay] = useState(essayData[1]);
  const [essayTransition, setEssayTransition] = useState(false);

  useEffect(() => {
    // Animate progress bars on load
    const progressBars = document.querySelectorAll('[data-progress]');
    progressBars.forEach((bar, index) => {
      const element = bar as HTMLElement;
      const targetWidth = element.dataset.progress || '0';
      element.style.width = '0%';
      setTimeout(() => {
        element.style.width = targetWidth + '%';
      }, 200 * index);
    });
  }, []);

  const handlePromptClick = (promptId: number) => {
    if (selectedPrompt === promptId) return;
    
    setEssayTransition(true);
    setSelectedPrompt(promptId);
    
    setTimeout(() => {
      setCurrentEssay(essayData[promptId]);
      setEssayTransition(false);
    }, 150);
  };

  return (
    <>
      <Head>
        <title>Stanford University - Pingin Dashboard</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>
      
      <div className="font-inter bg-pingin-gradient min-h-screen text-white overflow-x-hidden">
        {/* Background Shapes */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1] opacity-10">
          <div className="absolute w-48 h-48 rounded-full bg-pingin-shape top-[10%] left-[10%] animate-float"></div>
          <div className="absolute w-36 h-36 bg-pingin-shape top-[60%] right-[20%] animate-float-delayed-5s clip-triangle"></div>
          <div className="absolute w-24 h-24 rounded-2xl bg-pingin-shape bottom-[20%] left-[30%] animate-float-delayed-10s"></div>
        </div>

        {/* Navigation */}
        <nav className="bg-pingin-dark/60 backdrop-blur-[20px] border-b border-pingin-accent/20 sticky top-0 z-50">
          <div className="max-w-[1400px] mx-auto px-8 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center text-2xl">🎓</div>
              <div className="text-2xl font-bold bg-pingin-text bg-clip-text text-transparent">Pingin</div>
              <div className="hidden md:flex items-center gap-2 text-white/70 text-sm">
                <span>Dashboard</span>
                <span>›</span>
                <a href="#" className="text-pingin-accent hover:text-white transition-colors">Pings</a>
                <span>›</span>
                <span>Stanford University</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center cursor-pointer hover:bg-white/20 hover:-translate-y-0.5 transition-all relative">
                🔔
                <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-pingin-dark/60"></div>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center cursor-pointer hover:bg-white/20 hover:-translate-y-0.5 transition-all">
                ⚙️
              </div>
              <div className="w-10 h-10 rounded-full bg-pingin-button flex items-center justify-center font-semibold cursor-pointer hover:scale-105 transition-transform">
                VN
              </div>
            </div>
          </div>
        </nav>

        {/* College Header */}
        <div className="bg-white/5 backdrop-blur-sm border-b border-pingin-accent/20 py-8">
          <div className="max-w-[1400px] mx-auto px-8 flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center p-4 shadow-2xl">
                <span className="text-4xl">🌲</span>
              </div>
              <div className="text-center lg:text-left">
                <h1 className="text-4xl font-extrabold mb-2 bg-pingin-text bg-clip-text text-transparent">
                  Stanford University
                </h1>
                <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 text-sm text-white/80">
                  <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full font-semibold border border-red-500/30">
                    REACH School
                  </span>
                  <span>📅 Deadline: Jan 5, 2026</span>
                  <span>📊 Acceptance Rate: 3.9%</span>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button className="px-6 py-3 rounded-full font-semibold bg-transparent text-pingin-accent border-2 border-pingin-accent/40 hover:bg-pingin-accent/10 hover:border-pingin-accent/60 transition-all">
                View Requirements
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-[1400px] mx-auto p-8">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {[
              { title: "Essays", value: "3/5 Complete", progress: 60 },
              { title: "Documents", value: "8/12 Submitted", progress: 67 },
              { title: "Recommendations", value: "1/3 Received", progress: 33 },
              { title: "Application Status", value: "In Progress", progress: 45 }
            ].map((card, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-pingin-accent/20 hover:-translate-y-1 hover:border-pingin-accent/40 hover:shadow-2xl hover:shadow-pingin-primary/20 transition-all cursor-pointer">
                <h3 className="text-sm text-white/70 mb-2 font-medium">{card.title}</h3>
                <div className="text-2xl font-bold text-pingin-accent mb-4">{card.value}</div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-pingin-progress rounded-full shadow-lg shadow-pingin-accent/50 transition-all duration-500"
                    data-progress={card.progress}
                    style={{ width: '0%' }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Current Essay Section */}
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-pingin-accent/20">
              <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4">
                <div>
                  <h2 className="text-2xl font-bold bg-pingin-text bg-clip-text text-transparent mb-2">
                    Current Essay: {currentEssay.title}
                  </h2>
                  <div className="text-white/60 text-sm">Last updated: {currentEssay.lastUpdated}</div>
                </div>
                <button className="bg-pingin-button text-white px-4 py-2 rounded-lg font-medium hover:-translate-y-0.5 hover:shadow-lg hover:shadow-pingin-primary/30 transition-all text-sm">
                  Edit Essay
                </button>
              </div>

              <div className="bg-pingin-primary/10 rounded-2xl p-6 mb-8 border border-pingin-primary/20">
                <div className="text-sm text-pingin-accent font-semibold mb-2">Essay Prompt</div>
                <div className="text-white/90 leading-relaxed">{currentEssay.prompt}</div>
              </div>

              <div className="bg-black/20 rounded-2xl p-6 border border-pingin-accent/10">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white/80 font-medium">Essay Draft</h3>
                  <div className="text-pingin-accent font-semibold text-sm">{currentEssay.wordCount}</div>
                </div>
                <div 
                  className={`leading-relaxed text-white/90 text-sm max-h-48 overflow-y-auto transition-opacity duration-300 ${essayTransition ? 'opacity-50' : 'opacity-100'}`}
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(162, 99, 204, 0.3) rgba(255, 255, 255, 0.05)'
                  }}
                >
                  {currentEssay.content}
                </div>
              </div>
            </div>

            {/* Stanford Essay Prompts */}
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-pingin-accent/20 relative">
              <h2 className="text-2xl font-bold bg-pingin-text bg-clip-text text-transparent mb-6">
                Stanford Essay Prompts
              </h2>

              <div className="relative">
                {/* Light Trail */}
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 transform -translate-x-1/2 z-10 pointer-events-none">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="absolute left-1/2 w-0.5 transform -translate-x-1/2 flex flex-col justify-evenly items-center" style={{ top: `${(i + 1) * 20}%`, height: '15%' }}>
                      {[...Array(3)].map((_, j) => (
                        <div key={j} className="w-0.5 h-1 bg-pingin-accent/95 rounded-sm"></div>
                      ))}
                    </div>
                  ))}
                </div>

                {[
                  { id: 1, title: "Personal Statement", status: "Draft", statusColor: "bg-yellow-500/20 text-yellow-400", completed: true },
                  { id: 2, title: "Roommate Letter", status: "Not Started", statusColor: "bg-gray-500/20 text-gray-400", completed: false },
                  { id: 3, title: "Short Essays", status: "Not Started", statusColor: "bg-gray-500/20 text-gray-400", completed: false },
                  { id: 4, title: "Additional Essays", status: "Not Started", statusColor: "bg-gray-500/20 text-gray-400", completed: false },
                  { id: 5, title: "Optional Essays", status: "Not Started", statusColor: "bg-gray-500/20 text-gray-400", completed: false }
                ].map((prompt) => (
                  <div 
                    key={prompt.id}
                    className={`bg-white/3 border border-white/10 rounded-xl p-4 mb-4 transition-all cursor-pointer relative z-20 hover:bg-white/8 hover:border-pingin-accent/30 hover:translate-x-1 ${
                      prompt.completed ? 'border-pingin-primary/50 bg-pingin-primary/10' : ''
                    } ${
                      selectedPrompt === prompt.id ? 'border-pingin-accent/80 bg-pingin-primary/20 shadow-xl shadow-pingin-primary/30 translate-x-2' : ''
                    }`}
                    onClick={() => handlePromptClick(prompt.id)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                        prompt.completed || selectedPrompt === prompt.id 
                          ? 'bg-pingin-button text-white shadow-lg shadow-pingin-accent/60' 
                          : 'bg-gray-600 text-gray-300'
                      }`}>
                        {prompt.id}
                      </div>
                      <div className="text-white font-medium flex-1 text-sm">{prompt.title}</div>
                      <div className={`px-2 py-1 rounded-xl text-xs font-medium ${prompt.statusColor}`}>
                        {prompt.status}
                      </div>
                    </div>
                    <div className="text-gray-400 text-xs leading-snug ml-9">
                      {prompt.id === 1 && "Tell us about something that is meaningful to you and why. (250-350 words)"}
                      {prompt.id === 2 && "Virtually all of Stanford's undergraduates live on campus. Write a note to your future roommate. (250 words)"}
                      {prompt.id === 3 && "Please respond to all short essay questions (50 words each): What is the most significant challenge society faces today?"}
                      {prompt.id === 4 && "Choose one: Reflect on an idea important to your intellectual development OR Tell us about an idea that fascinates you. (250 words)"}
                      {prompt.id === 5 && "Optional: Additional information about activities, employment, travel, family circumstances, etc. (150 words)"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activities & Achievements */}
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-pingin-accent/20 mt-8">
            <h2 className="text-2xl font-bold bg-pingin-text bg-clip-text text-transparent mb-8 text-center">
              Activities & Achievements
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left Column */}
              <div className="flex flex-col gap-6">
                <div className="text-xl font-semibold text-white/90 text-center pb-2 border-b-2 border-pingin-accent/30">
                  Leadership & Academics
                </div>
                
                {activities.filter(activity => activity.category === 'leadership').map((activity) => (
                  <div key={activity.number} className="bg-white/3 border border-white/10 rounded-2xl p-6 transition-all hover:bg-white/8 hover:-translate-y-1 hover:border-pingin-accent/30 hover:shadow-2xl hover:shadow-pingin-primary/20 relative">
                    <div className="flex flex-col h-48">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-white font-semibold leading-snug">{activity.title}</h4>
                        <div className="w-6 h-6 bg-pingin-button text-white rounded-full flex items-center justify-center text-xs font-medium -mt-2 -mr-4">
                          {activity.number}
                        </div>
                      </div>
                      <p className="text-white/70 text-sm leading-relaxed flex-1">{activity.description}</p>
                      <div className="flex gap-3 justify-end mt-2">
                        <button className="px-4 py-2 rounded-lg text-xs font-medium bg-pingin-primary/20 text-pingin-accent border border-pingin-primary/30 hover:bg-pingin-primary/30 hover:-translate-y-0.5 transition-all">
                          Edit
                        </button>
                        <button className="px-4 py-2 rounded-lg text-xs font-medium bg-white/10 text-white/80 border border-white/20 hover:bg-white/20 hover:-translate-y-0.5 transition-all">
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column */}
              <div className="flex flex-col gap-6">
                <div className="text-xl font-semibold text-white/90 text-center pb-2 border-b-2 border-pingin-accent/30">
                  Athletics & Community
                </div>
                
                {activities.filter(activity => activity.category === 'athletics').map((activity) => (
                  <div key={activity.number} className="bg-white/3 border border-white/10 rounded-2xl p-6 transition-all hover:bg-white/8 hover:-translate-y-1 hover:border-pingin-accent/30 hover:shadow-2xl hover:shadow-pingin-primary/20 relative">
                    <div className="flex flex-col h-48">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-white font-semibold leading-snug">{activity.title}</h4>
                        <div className="w-6 h-6 bg-pingin-button text-white rounded-full flex items-center justify-center text-xs font-medium -mt-2 -mr-4">
                          {activity.number}
                        </div>
                      </div>
                      <p className="text-white/70 text-sm leading-relaxed flex-1">{activity.description}</p>
                      <div className="flex gap-3 justify-end mt-2">
                        <button className="px-4 py-2 rounded-lg text-xs font-medium bg-pingin-primary/20 text-pingin-accent border border-pingin-primary/30 hover:bg-pingin-primary/30 hover:-translate-y-0.5 transition-all">
                          Edit
                        </button>
                        <button className="px-4 py-2 rounded-lg text-xs font-medium bg-white/10 text-white/80 border border-white/20 hover:bg-white/20 hover:-translate-y-0.5 transition-all">
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          ::-webkit-scrollbar {
            width: 6px;
          }
          ::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 3px;
          }
          ::-webkit-scrollbar-thumb {
            background: rgba(162, 99, 204, 0.3);
            border-radius: 3px;
          }
        `}</style>
      </div>
    </>
  );
}