'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const words = ['agentic', 'revolutionary', 'limitless', 'intelligent', 'intuitive', 'yours']

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % words.length)
    }, 2500)

    return () => clearInterval(interval)
  }, [words.length])

  const Chat = ({ isPingin = false }: { isPingin?: boolean }) => {
    const [messages, setMessages] = useState([
      {
        isUser: false,
        text: isPingin 
          ? "🎯 Welcome to Pingin AI! I'm your specialized college guidance assistant. I can provide personalized strategies, connect you with mentors, and analyze your admission chances. What's your college goal?"
          : "Hi! I'm a generic AI assistant. Ask me anything about college!"
      }
    ])
    const [inputValue, setInputValue] = useState('')
    const [isTyping, setIsTyping] = useState(false)

    const handleSend = () => {
      if (!inputValue.trim()) return

      const newMessage = { isUser: true, text: inputValue }
      setMessages(prev => [...prev, newMessage])
      setInputValue('')
      setIsTyping(true)

      setTimeout(() => {
        setIsTyping(false)
        const response = isPingin 
          ? `ANALYSIS COMPLETE\n=================\n\nBased on your query, I've prepared a personalized strategy. Let me connect you with the right mentors and resources.`
          : "I can help with general college advice. What specific topic would you like to know about?"
        
        setMessages(prev => [...prev, { isUser: false, text: response }])
      }, isPingin ? 2500 : 1500)
    }

    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-3 font-vt323 text-sm leading-relaxed">
          {messages.map((message, i) => (
            <div key={i} className="mb-4 animate-message-slide font-vt323 whitespace-pre-wrap">
              <span className={`font-bold mr-2 ${
                message.isUser 
                  ? 'text-pingin-terminal-orange' 
                  : isPingin ? 'text-pingin-terminal-cyan' : 'text-pingin-terminal-green'
              }`}>
                {message.isUser ? 'USER>' : isPingin ? 'PINGIN>' : 'AI>'}
              </span>
              <span className={`${
                message.isUser 
                  ? 'text-pingin-terminal-orange' 
                  : isPingin ? 'text-pingin-terminal-cyan' : 'text-pingin-terminal-green'
              } ${message.isUser ? '' : 'drop-shadow-sm'}`}>
                {message.text}
              </span>
            </div>
          ))}
          {isTyping && (
            <div className="flex items-center gap-2 mb-4 font-vt323 text-sm italic">
              <span className={isPingin ? 'text-pingin-terminal-cyan' : 'text-pingin-terminal-green'}>
                {isPingin ? 'Pingin AI is analyzing' : 'AI is typing'}
              </span>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`w-1 h-1 rounded-full ${
                      isPingin ? 'bg-pingin-terminal-cyan' : 'bg-pingin-terminal-green'
                    } animate-typing-bounce`}
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="pt-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isPingin ? "Ask about your college journey..." : "Ask about college..."}
              className={`flex-1 px-4 py-2 border-2 rounded bg-black/80 outline-none text-sm font-vt323 transition-all ${
                isPingin 
                  ? 'border-pingin-terminal-cyan/30 text-pingin-terminal-cyan placeholder-pingin-terminal-cyan/50 focus:border-pingin-terminal-cyan/60 focus:shadow-[0_0_10px_rgba(0,255,255,0.2)]'
                  : 'border-pingin-terminal-green/30 text-pingin-terminal-green placeholder-pingin-terminal-green/50 focus:border-pingin-terminal-green/60 focus:shadow-[0_0_10px_rgba(0,255,136,0.2)]'
              }`}
            />
            <button
              onClick={handleSend}
              className={`px-4 py-2 border-2 rounded font-semibold text-sm font-vt323 transition-all ${
                isPingin
                  ? 'bg-pingin-terminal-cyan/10 border-pingin-terminal-cyan text-pingin-terminal-cyan hover:bg-pingin-terminal-cyan/20 hover:shadow-[0_0_10px_rgba(0,255,255,0.3)]'
                  : 'bg-pingin-terminal-green/10 border-pingin-terminal-green text-pingin-terminal-green hover:bg-pingin-terminal-green/20 hover:shadow-[0_0_10px_rgba(0,255,136,0.3)]'
              }`}
            >
              SEND
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-pingin-dark text-white overflow-x-hidden scroll-smooth">
        {/* Background Animations */}
        <div className="fixed inset-0 bg-pingin-gradient animate-gradient-shift -z-50">
          <div className="absolute inset-0 bg-bg-overlay animate-float" />
        </div>

        {/* Floating Shapes */}
        <div className="fixed inset-0 pointer-events-none -z-40">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`absolute rounded-full opacity-10 animate-float-move ${
                i === 0 ? 'w-25 h-25 bg-pingin-shape top-[10%] left-[10%]' :
                i === 1 ? 'w-20 h-20 bg-gradient-to-br from-pingin-secondary to-pingin-accent top-[20%] right-[15%] animate-float-move-delayed' :
                i === 2 ? 'w-15 h-15 bg-gradient-to-br from-pingin-dark-blue to-pingin-primary top-[60%] left-[20%]' :
                i === 3 ? 'w-30 h-30 bg-gradient-to-br from-pingin-dark-alt to-pingin-dark-blue rounded-2xl top-[40%] right-[25%]' :
                i === 4 ? 'w-22 h-22 bg-pingin-shape top-[80%] left-[60%]' :
                'w-18 h-18 bg-gradient-to-br from-pingin-secondary to-pingin-accent top-[15%] left-[50%] rounded-lg'
              }`}
              style={{
                animationDelay: `${-i * 5}s`,
                animationDuration: `${25 + i * 5}s`
              }}
            />
          ))}
        </div>

        {/* Grid Background */}
        <div 
          className="fixed inset-0 opacity-5 pointer-events-none -z-30 animate-grid-move"
          style={{
            backgroundImage: 'linear-gradient(rgba(162, 99, 204, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(162, 99, 204, 0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}
        />

        {/* Navigation */}
        <nav className={`fixed top-0 left-0 w-full z-50 py-4 transition-all duration-500 ${
          isScrolled ? 'bg-pingin-dark/80 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]' : 'bg-transparent backdrop-blur-sm'
        }`}>
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex justify-between items-center">
              <a href="#" className="text-3xl font-extrabold bg-pingin-text bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(162,99,204,0.3)]">
                🎓 Pingin
              </a>
              
              <ul className="hidden md:flex list-none gap-10 items-center">
                {['About Us', 'Testimonials', 'Mentors', 'Tools', 'Pricing', 'Contact'].map((item) => (
                  <li key={item}>
                    <a 
                      href={`#${item.toLowerCase().replace(' ', '')}`}
                      className="text-white/90 font-medium text-base transition-all duration-300 relative py-2 hover:text-pingin-accent hover:-translate-y-0.5 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-pingin-accent after:to-pingin-secondary after:transition-all after:duration-300 hover:after:w-full"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>

              <Link 
                href="/login"
                className="bg-pingin-button text-white px-7 py-3 rounded-full font-semibold text-sm transition-all duration-300 border-2 border-transparent shadow-pingin hover:-translate-y-0.5 hover:shadow-pingin-hover hover:border-pingin-accent/30"
              >
                Login
              </Link>

              <button 
                className="md:hidden flex flex-col gap-1 cursor-pointer"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {[...Array(3)].map((_, i) => (
                  <span key={i} className="w-6 h-0.5 bg-pingin-accent rounded-sm transition-all duration-300" />
                ))}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div className={`md:hidden fixed top-full left-0 w-full bg-pingin-dark/95 backdrop-blur-2xl z-50 transition-transform duration-300 ${
            isMenuOpen ? 'translate-y-0' : '-translate-y-full'
          }`}>
            <div className="flex flex-col p-8 gap-6">
              {['About Us', 'Testimonials', 'Mentors', 'Tools', 'Pricing', 'Contact'].map((item) => (
                <a 
                  key={item}
                  href={`#${item.toLowerCase().replace(' ', '')}`}
                  className="text-xl text-center py-4 border-b border-pingin-secondary/20 text-white/90 hover:text-pingin-accent transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
              <Link 
                href="/login"
                className="bg-pingin-button text-white px-7 py-3 rounded-full font-semibold text-center mt-4"
              >
                Login
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center text-center relative py-16">
          {/* Floating Elements */}
          <div className="absolute inset-0 w-full h-[120%] pointer-events-none z-10">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`absolute opacity-10 animate-hero-float ${
                  i === 0 ? 'w-100 h-100 bg-[radial-gradient(circle,rgba(162,99,204,0.3),transparent)] top-[10%] left-[5%]' :
                  i === 1 ? 'w-75 h-75 bg-[radial-gradient(circle,rgba(114,9,183,0.3),transparent)] bottom-[-10%] right-[10%]' :
                  'w-62 h-62 bg-[radial-gradient(circle,rgba(212,173,252,0.3),transparent)] top-[50%] left-[-5%]'
                }`}
                style={{ animationDelay: `${-i * 5}s` }}
              />
            ))}
          </div>

          <div className="max-w-7xl mx-auto px-8 relative z-20">
            <div className="flex flex-col items-center max-w-4xl mx-auto">
              {/* Welcome Header */}
              <div className="text-xl md:text-3xl font-semibold mb-4 text-white/80 text-center tracking-wide">
                Welcome to Pingin
        </div>

              {/* Dynamic Header */}
              <h1 className="text-4xl md:text-7xl lg:text-8xl font-black mb-6 animate-title-flow flex flex-col md:flex-row items-center justify-center text-center gap-2 md:gap-4 min-h-[1.2em]">
                <span className="bg-hero-static bg-clip-text text-transparent">Pingin is</span>
                <span className={`transition-all duration-600 min-w-[4.5em] text-left inline-block relative ${
                  words[currentWordIndex] === 'yours' 
                    ? 'bg-dynamic-emphasis bg-clip-text text-transparent font-black filter drop-shadow-[0_0_20px_rgba(162,99,204,0.5)]' 
                    : 'bg-dynamic-word bg-clip-text text-transparent'
                }`}>
                  {words[currentWordIndex]}
                  {words[currentWordIndex] === 'yours' && (
                    <>
                      <div className="absolute bottom-[-8px] left-0 w-[60%] h-1 bg-gradient-to-r from-pingin-secondary via-pingin-accent to-pingin-secondary rounded animate-underline-glow" />
                      <div className="absolute bottom-[-16px] left-[6%] w-[48%] h-0.5 bg-gradient-to-r from-pingin-secondary via-pingin-accent to-pingin-secondary rounded animate-underline-glow" style={{ animationDelay: '0.2s' }} />
                      <div className="absolute bottom-[-24px] left-[12%] w-[36%] h-0.5 bg-gradient-to-r from-pingin-secondary via-pingin-accent to-pingin-secondary rounded animate-underline-glow" style={{ animationDelay: '0.4s' }} />
                    </>
                  )}
                </span>
              </h1>

              <p className="text-lg md:text-2xl mb-14 opacity-90 max-w-4xl mx-auto leading-relaxed text-white/85">
                Join thousands of students who've unlocked their potential with Pingin's AI-powered college guidance. Get personalized strategies, expert mentorship, and data-driven insights that turn ambitious goals into acceptance letters.
              </p>

              <div className="flex flex-col md:flex-row justify-center items-center gap-6 w-full">
                <a 
                  href="#comparison"
                  className="bg-pingin-button text-white px-12 py-6 rounded-full font-bold text-lg transition-all duration-400 shadow-pingin relative overflow-hidden text-center min-w-[250px] hover:-translate-y-1 hover:scale-105 hover:shadow-pingin-hover before:absolute before:top-0 before:-left-full before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:transition-all before:duration-600 hover:before:left-full"
                >
                  Start Your Journey Free
        </a>
        <a
                  href="#demo"
                  className="bg-transparent border-2 border-pingin-accent/60 text-white px-12 py-6 rounded-full font-bold text-lg transition-all duration-400 shadow-[0_10px_30px_rgba(0,0,0,0.2)] text-center min-w-[250px] hover:-translate-y-1 hover:scale-105 hover:bg-pingin-accent/10 hover:border-pingin-accent/80"
                >
                  Watch Demo
                </a>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-scroll-bounce">
            <div className="w-6 h-10 border-2 border-pingin-accent/50 rounded-full relative mx-auto">
              <div className="w-1 h-2 bg-pingin-accent rounded-sm absolute top-2 left-1/2 transform -translate-x-1/2 animate-scroll-dot" />
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-24 relative z-10">
          <div className="max-w-7xl mx-auto px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center max-w-5xl mx-auto relative z-20">
              {[
                { number: '94%', label: 'Success Rate' },
                { number: '15K+', label: 'Students Helped' },
                { number: '500+', label: 'Partner Schools' },
                { number: '$2M+', label: 'Scholarships Won' }
              ].map((stat, i) => (
                <div key={i} className="p-8 bg-white/3 rounded-3xl backdrop-blur-sm border border-pingin-secondary/10 transition-all duration-300 hover:-translate-y-2 hover:bg-white/5 hover:border-pingin-secondary/30 hover:shadow-[0_20px_40px_rgba(114,9,183,0.2)]">
                  <span className="text-5xl font-black bg-gradient-to-r from-pingin-accent to-pingin-secondary bg-clip-text text-transparent block mb-2 animate-stat-pulse">
                    {stat.number}
                  </span>
                  <span className="text-lg text-white/80 font-medium">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="py-32 relative overflow-visible" id="comparison">
          <div className="absolute -top-48 left-0 w-full h-[150%] bg-comparison-bg pointer-events-none -z-10" />
          
          <div className="max-w-7xl mx-auto px-8">
            <h2 className="text-center text-4xl md:text-6xl font-extrabold mb-16 bg-section-title bg-clip-text text-transparent filter drop-shadow-[0_0_20px_rgba(162,99,204,0.2)] animate-title-float">
              Why Pingin AI is Revolutionary
            </h2>

            <div className="grid lg:grid-cols-2 gap-12 lg:gap-32 items-stretch max-w-6xl mx-auto relative">
              {/* VS Connector */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-25 h-0.5 bg-gradient-to-r from-pingin-secondary/20 via-pingin-secondary/50 to-pingin-secondary/20 z-0 lg:block hidden">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-pingin-dark-alt px-4 py-2 rounded-3xl border-2 border-pingin-secondary/30 text-pingin-accent font-bold text-sm">
                  VS
                </div>
              </div>

              {/* Generic AI */}
              <div className="bg-pingin-dark-blue/30 rounded-3xl p-10 shadow-ai-card overflow-hidden h-[800px] flex flex-col transition-all duration-500 relative backdrop-blur-2xl border border-pingin-secondary/20 hover:-translate-y-4 hover:scale-105 hover:shadow-ai-card-hover before:absolute before:-top-0.5 before:-left-0.5 before:-right-0.5 before:-bottom-0.5 before:bg-gradient-to-45 before:from-transparent before:via-pingin-secondary/50 before:to-transparent before:rounded-3xl before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100 before:-z-10">
                <div className="bg-pingin-dark-alt/80 rounded-2xl p-6 shadow-terminal relative text-center mb-6 min-h-[80px] flex flex-col justify-center backdrop-blur-sm">
                  <div className="absolute top-4 right-4 w-2 h-2 bg-pingin-secondary rounded-full shadow-[0_0_10px_rgba(166,99,204,0.5)] animate-pulse-custom" />
                  <h3 className="text-3xl font-bold mb-2 text-pingin-accent">Generic AI Assistant</h3>
                  <p className="opacity-75 text-base text-white/70">Basic responses, no personalization</p>
                </div>

                <div className="flex-1 flex flex-col">
                  <div className="w-full h-full bg-black/80 rounded-2xl p-6 shadow-terminal relative flex flex-col backdrop-blur-sm">
                    <div className="w-full flex-1 bg-black rounded-xl p-4 relative overflow-hidden flex flex-col min-h-0 before:absolute before:inset-0 before:bg-[linear-gradient(rgba(255,255,255,0.02)_50%,transparent_50%)] before:bg-[length:100%_4px] before:pointer-events-none before:opacity-40">
                      <div className="flex-1 overflow-y-auto mb-4 p-3 font-vt323 text-pingin-terminal-green text-sm leading-relaxed shadow-[0_0_10px_rgba(0,255,136,0.3)] z-10 min-h-0">
                        <Chat isPingin={false} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pingin AI */}
              <div className="bg-pingin-dark-blue/30 rounded-3xl p-10 shadow-ai-card overflow-hidden h-[800px] flex flex-col transition-all duration-500 relative backdrop-blur-2xl border border-pingin-secondary/20 hover:-translate-y-4 hover:scale-105 hover:shadow-ai-card-hover before:absolute before:-top-0.5 before:-left-0.5 before:-right-0.5 before:-bottom-0.5 before:bg-gradient-to-45 before:from-transparent before:via-pingin-secondary/50 before:to-transparent before:rounded-3xl before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100 before:-z-10">
                <div className="bg-pingin-primary/30 rounded-2xl p-6 shadow-terminal relative text-center mb-6 min-h-[80px] flex flex-col justify-center backdrop-blur-sm">
                  <div className="absolute top-4 right-4 w-2 h-2 bg-pingin-terminal-cyan rounded-full shadow-[0_0_10px_rgba(0,255,255,0.5)] animate-pulse-custom" />
                  <h3 className="text-3xl font-bold mb-2 text-pingin-accent">Pingin AI</h3>
                  <p className="opacity-75 text-base text-white/70">Specialized, personalized college guidance</p>
                </div>

                <div className="flex-1 flex flex-col">
                  <div className="w-full h-full bg-black/80 rounded-2xl p-6 shadow-terminal relative flex flex-col backdrop-blur-sm">
                    <div className="w-full flex-1 bg-black rounded-xl p-4 relative overflow-hidden flex flex-col min-h-0 before:absolute before:inset-0 before:bg-[linear-gradient(rgba(255,255,255,0.02)_50%,transparent_50%)] before:bg-[length:100%_4px] before:pointer-events-none before:opacity-40">
                      <div className="flex-1 overflow-y-auto mb-4 p-3 font-vt323 text-pingin-terminal-cyan text-sm leading-relaxed shadow-[0_0_10px_rgba(0,255,255,0.3)] z-10 min-h-0">
                        <Chat isPingin={true} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-32 relative" id="about">
          <div className="absolute -top-36 left-0 w-full h-[120%] bg-features-bg pointer-events-none -z-10" />
          
          <div className="max-w-7xl mx-auto px-8">
            <h2 className="text-center text-4xl md:text-6xl font-extrabold mb-20 bg-section-title bg-clip-text text-transparent filter drop-shadow-[0_0_20px_rgba(162,99,204,0.2)] animate-title-float">
              Powerful Features That Deliver Results
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 mt-20 relative">
              {[
                {
                  icon: '🎯',
                  title: 'AI-Powered Strategy',
                  description: 'Get personalized college roadmaps based on your unique profile, goals, and dream schools. Our AI analyzes thousands of successful applications to create your winning strategy.'
                },
                {
                  icon: '👨‍🏫',
                  title: 'Expert Mentors',
                  description: 'Connect with admissions officers, college counselors, and successful students from top universities. Get insider insights and personalized guidance from those who\'ve been there.'
                },
                {
                  icon: '📊',
                  title: 'Smart Analytics',
                  description: 'Track your progress with real-time data, analyze your admission chances, and optimize your application strategy. Know exactly where you stand and what to improve.'
                },
                {
                  icon: '📝',
                  title: 'Essay Perfection',
                  description: 'Transform your essays with AI-powered writing assistance and feedback from admissions experts. Craft compelling narratives that make you stand out from thousands of applicants.'
                },
                {
                  icon: '🎓',
                  title: 'Scholarship Hunter',
                  description: 'Discover thousands of scholarship opportunities matched to your profile. Our AI finds hidden gems and helps you apply strategically to maximize your funding potential.'
                },
                {
                  icon: '🚀',
                  title: 'Career Pathway',
                  description: 'Align your college choices with your career goals. Get insights into job markets, salary projections, and industry connections to make informed decisions about your future.'
                }
              ].map((feature, i) => (
                <div key={i} className="bg-white/2 backdrop-blur-2xl rounded-3xl p-12 border border-pingin-secondary/15 transition-all duration-500 shadow-card text-center relative overflow-hidden hover:-translate-y-5 hover:scale-105 hover:border-pingin-secondary/40 hover:shadow-card-hover hover:bg-white/4 before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:bg-gradient-to-r before:from-transparent before:via-pingin-secondary/80 before:to-transparent before:-translate-x-full before:transition-transform before:duration-600 hover:before:translate-x-full">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-50 h-50 bg-[radial-gradient(circle,rgba(162,99,204,0.2),transparent)] opacity-0 transition-opacity duration-300 pointer-events-none group-hover:opacity-100" />
                  
                  <div className="text-6xl mb-8 filter drop-shadow-[0_0_25px_rgba(162,99,204,0.5)] animate-icon-float inline-block">
                    {feature.icon}
                  </div>
                  <h3 className="text-3xl mb-6 text-pingin-accent font-bold">
                    {feature.title}
                  </h3>
                  <p className="text-lg leading-relaxed text-white/85">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-32 relative overflow-hidden" id="testimonials">
          <div className="absolute top-0 left-0 w-full h-full bg-testimonials-bg pointer-events-none -z-10" />
          
          <div className="max-w-7xl mx-auto px-8">
            <h2 className="text-center text-4xl md:text-6xl font-extrabold mb-16 bg-section-title bg-clip-text text-transparent filter drop-shadow-[0_0_20px_rgba(162,99,204,0.2)] animate-title-float">
              Success Stories
            </h2>

            <div className="grid md:grid-cols-3 gap-10 mt-16 relative">
              {[
                {
                  text: "Pingin helped me get into MIT with a full scholarship! The personalized strategy and mentor connections were game-changers. I couldn't have done it without their guidance.",
                  author: 'Sarah Chen',
                  school: 'MIT \'27 • Computer Science',
                  avatar: 'S'
                },
                {
                  text: "The AI insights were incredible - it showed me exactly what I needed to improve and connected me with the right people. Got into Stanford, Harvard, and Yale!",
                  author: 'Marcus Johnson',
                  school: 'Stanford \'26 • Engineering',
                  avatar: 'M'
                },
                {
                  text: "From a 2.8 GPA to UC Berkeley! Pingin's strategy helped me showcase my strengths and overcome my weaknesses. The essay coaching was phenomenal.",
                  author: 'Aria Patel',
                  school: 'UC Berkeley \'25 • Pre-Med',
                  avatar: 'A'
                }
              ].map((testimonial, i) => (
                <div key={i} className="bg-white/3 backdrop-blur-2xl rounded-3xl p-10 border border-pingin-secondary/15 transition-all duration-400 shadow-[0_15px_40px_rgba(10,0,21,0.2)] relative overflow-hidden hover:-translate-y-2 hover:scale-105 hover:border-pingin-secondary/30 hover:shadow-[0_25px_60px_rgba(10,0,21,0.4)] hover:bg-white/5 after:absolute after:top-4 after:right-6 after:text-6xl after:text-pingin-secondary/10 after:content-['\22'] after:font-serif">
                  <p className="text-lg leading-relaxed mb-8 text-white/90 italic">
                    {testimonial.text}
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-pingin-button flex items-center justify-center font-bold text-white shadow-[0_5px_15px_rgba(114,9,183,0.3)]">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="text-pingin-accent mb-1 font-semibold">
                        {testimonial.author}
                      </h4>
                      <p className="text-white/60 text-sm">
                        {testimonial.school}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-40 text-center relative">
          <div className="absolute -top-24 left-0 w-full h-full bg-cta-bg pointer-events-none" />
          
          <div className="max-w-4xl mx-auto px-8 relative z-20">
            <h2 className="text-4xl md:text-6xl font-extrabold mb-8 bg-gradient-to-r from-white to-pingin-accent bg-clip-text text-transparent animate-cta-pulse">
              Ready to Transform Your Future?
            </h2>
            <p className="text-xl mb-12 text-white/80 leading-relaxed">
              Join thousands of students who've already unlocked their potential. Start your personalized college journey today - completely free.
            </p>
            <div className="flex flex-col md:flex-row justify-center items-center gap-6 w-full">
              <a 
                href="#signup"
                className="bg-pingin-button text-white px-12 py-6 rounded-full font-bold text-lg transition-all duration-400 shadow-pingin relative overflow-hidden text-center min-w-[250px] hover:-translate-y-1 hover:scale-105 hover:shadow-pingin-hover before:absolute before:top-0 before:-left-full before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:transition-all before:duration-600 hover:before:left-full"
              >
                Join the Revolution
        </a>
        <a
                href="#contact"
                className="bg-transparent border-2 border-pingin-accent/60 text-white px-12 py-6 rounded-full font-bold text-lg transition-all duration-400 shadow-[0_10px_30px_rgba(0,0,0,0.2)] text-center min-w-[250px] hover:-translate-y-1 hover:scale-105 hover:bg-pingin-accent/10 hover:border-pingin-accent/80"
              >
                Schedule Consultation
              </a>
            </div>
          </div>
        </section>
    </div>
    </>
  )
}