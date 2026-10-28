import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Sparkles,
  ExternalLink,
  MapPin,
  Mail,
  FileText,
  Star,
  FolderKanban,
  Send,
  CheckCircle2,
  AlertCircle,
  Menu,
  X,
  BookOpen,
  MessageSquareQuote,
  Wrench,
  User
} from 'lucide-react';
import AuroraBackground from '../../components/common/AuroraBackground';
import GlassCard from '../../components/common/GlassCard';
import ProjectDetailModal from '../../components/portfolio/ProjectDetailModal';
import { api } from '../../services/api';

export default function PublicPortfolioPage() {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeModalProject, setActiveModalProject] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Contact Form State
  const [contactForm, setContactForm] = useState({
    sender_name: '',
    sender_email: '',
    message: '',
    hp_field: '' // Honeypot field
  });
  const [submittingContact, setSubmittingContact] = useState(false);
  const [contactFeedback, setContactFeedback] = useState({ type: '', text: '' });

  // 1. Fetch public portfolio data & record view
  useEffect(() => {
    let mounted = true;

    async function loadPortfolio() {
      try {
        const res = await api.getPublicPortfolio(username);
        if (mounted) {
          setData(res);
          setLoading(false);
        }

        // Fire and forget view tracking (backend deduplicates per day & exempts owner)
        api.recordPortfolioView(username).catch(() => {});
      } catch (err) {
        if (mounted) {
          setNotFound(true);
          setLoading(false);
        }
      }
    }

    loadPortfolio();
    return () => { mounted = false; };
  }, [username]);

  // Dynamic category filters derived from published projects with 'All' first
  const categories = useMemo(() => {
    if (!data?.projects) return ['All'];
    const set = new Set();
    data.projects.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return ['All', ...Array.from(set)];
  }, [data?.projects]);

  const filteredProjects = useMemo(() => {
    if (!data?.projects) return [];
    if (selectedCategory === 'All') return data.projects;
    return data.projects.filter(p => p.category === selectedCategory);
  }, [data?.projects, selectedCategory]);

  const featuredProjects = useMemo(() => {
    if (!data?.projects) return [];
    return data.projects.filter(p => p.is_featured);
  }, [data?.projects]);

  // Group skills by category
  const groupedSkills = useMemo(() => {
    if (!data?.skills) return {};
    const groups = {};
    data.skills.forEach(skill => {
      const cat = skill.category || 'General';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(skill);
    });
    return groups;
  }, [data?.skills]);

  // Contact form submit handler
  async function handleContactSubmit(e) {
    e.preventDefault();
    setContactFeedback({ type: '', text: '' });

    if (!contactForm.sender_name.trim() || !contactForm.sender_email.trim() || !contactForm.message.trim()) {
      setContactFeedback({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    if (contactForm.message.trim().length < 10) {
      setContactFeedback({ type: 'error', text: 'Message must be at least 10 characters long.' });
      return;
    }

    setSubmittingContact(true);
    try {
      const res = await api.submitContactMessage(username, contactForm);
      setContactFeedback({ type: 'success', text: res.message || 'Your message has been sent successfully!' });
      setContactForm({ sender_name: '', sender_email: '', message: '', hp_field: '' });
    } catch (err) {
      setContactFeedback({ type: 'error', text: err.message || 'Failed to send message. Please try again later.' });
    } finally {
      setSubmittingContact(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-ice-400/20 border-t-ice-400 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm tracking-wide">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="min-h-screen bg-navy-950 text-slate-100 flex items-center justify-center p-6 relative overflow-hidden">
        <AuroraBackground />
        <GlassCard hoverEffect={false} className="max-w-md w-full text-center py-12 space-y-4 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto">
            <User className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white">Portfolio Not Found</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            The freelancer profile for <span className="text-ice-400 font-mono">@{username}</span> does not exist or may have been updated.
          </p>
          <div className="pt-4">
            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-ice-500 hover:bg-ice-400 text-navy-950 font-bold text-sm transition"
            >
              Back to Home
            </Link>
          </div>
        </GlassCard>
      </div>
    );
  }

  const { profile, case_studies, testimonials } = data;

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 relative overflow-x-hidden selection:bg-ice-400/20 selection:text-ice-300">
      <AuroraBackground />

      {/* Floating Header */}
      <header className="sticky top-0 z-40 bg-navy-950/80 backdrop-blur-xl border-b border-navy-800/80">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#hero" className="flex items-center gap-2.5 font-bold text-white tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-ice-500 to-sky-300 flex items-center justify-center text-navy-950 font-bold">
              <Sparkles className="w-4 h-4 fill-navy-950 text-navy-950" />
            </div>
            <span>{profile.full_name}</span>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-300">
            <a href="#about" className="hover:text-ice-300 transition">About</a>
            <a href="#projects" className="hover:text-ice-300 transition">Projects</a>
            <a href="#skills" className="hover:text-ice-300 transition">Skills</a>
            {case_studies.length > 0 && <a href="#case-studies" className="hover:text-ice-300 transition">Case Studies</a>}
            {testimonials.length > 0 && <a href="#testimonials" className="hover:text-ice-300 transition">Testimonials</a>}
            <a
              href="#contact"
              className="px-4 py-2 rounded-xl bg-ice-500 hover:bg-ice-400 text-navy-950 font-semibold text-xs transition shadow-md shadow-ice-500/20"
            >
              Get in Touch
            </a>
          </nav>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white bg-navy-900 border border-navy-800"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-ice-400" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-navy-900/95 border-b border-navy-800 px-6 py-4 space-y-3">
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-slate-300 hover:text-ice-300 py-1"
            >
              About
            </a>
            <a
              href="#projects"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-slate-300 hover:text-ice-300 py-1"
            >
              Projects
            </a>
            <a
              href="#skills"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-slate-300 hover:text-ice-300 py-1"
            >
              Skills
            </a>
            {case_studies.length > 0 && (
              <a
                href="#case-studies"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-slate-300 hover:text-ice-300 py-1"
              >
                Case Studies
              </a>
            )}
            {testimonials.length > 0 && (
              <a
                href="#testimonials"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-slate-300 hover:text-ice-300 py-1"
              >
                Testimonials
              </a>
            )}
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-center px-4 py-2 rounded-xl bg-ice-500 text-navy-950 font-semibold text-xs mt-2"
            >
              Get in Touch
            </a>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-6 py-12 space-y-24 relative z-10">
        {/* HERO SECTION */}
        <section id="hero" className="pt-6 sm:pt-12 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Avatar */}
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl bg-navy-900 border-2 border-ice-400/40 p-1.5 shadow-2xl shadow-ice-500/10 flex-shrink-0 relative overflow-hidden">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-full h-full object-cover rounded-2xl"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-navy-800 to-navy-900 rounded-2xl flex items-center justify-center text-4xl font-extrabold text-ice-300">
                  {profile.full_name ? profile.full_name[0].toUpperCase() : 'U'}
                </div>
              )}
            </div>

            {/* Headline and Intro */}
            <div className="space-y-4 flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ice-500/10 border border-ice-400/30 text-ice-300 text-xs font-mono font-medium">
                <span>@{profile.username}</span>
                {profile.location && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="flex items-center gap-1 text-slate-300">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {profile.location}
                    </span>
                  </>
                )}
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                {profile.full_name}
              </h1>

              {profile.headline && (
                <p className="text-lg sm:text-xl text-ice-300 font-medium">
                  {profile.headline}
                </p>
              )}

              {profile.bio && (
                <p id="about" className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl whitespace-pre-line">
                  {profile.bio}
                </p>
              )}

              {/* Professional Links */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                <a
                  href="#contact"
                  className="px-4 py-2 rounded-xl bg-ice-500/20 border border-ice-400/30 text-ice-300 hover:bg-ice-500/30 text-xs font-medium flex items-center gap-2 transition"
                >
                  <Mail className="w-3.5 h-3.5 text-ice-400" />
                  <span>Send Message</span>
                </a>

                {profile.github_url && (
                  <a
                    href={profile.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl glass-panel text-slate-300 hover:text-white text-xs font-medium flex items-center gap-2 transition"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                    <span>GitHub</span>
                  </a>
                )}

                {profile.linkedin_url && (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl glass-panel text-slate-300 hover:text-white text-xs font-medium flex items-center gap-2 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-ice-400" />
                    <span>LinkedIn</span>
                  </a>
                )}

                {profile.resume_url && (
                  <a
                    href={profile.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-ice-500/15 border border-ice-400/30 text-ice-300 hover:bg-ice-500/25 text-xs font-semibold flex items-center gap-2 transition"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Resume</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* FEATURED PROJECTS (if any) */}
        {featuredProjects.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-navy-800">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <h2 className="text-2xl font-bold text-white tracking-tight">Featured Work</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredProjects.map((project) => (
                <GlassCard
                  key={project.id}
                  onClick={() => setActiveModalProject(project)}
                  className="cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    {project.cover_image_url && (
                      <div className="w-full h-48 rounded-xl bg-navy-950 overflow-hidden mb-4 border border-navy-800">
                        <img
                          src={project.cover_image_url}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      </div>
                    )}
                    <span className="text-[10px] uppercase font-semibold text-ice-400 bg-ice-500/10 px-2 py-0.5 rounded border border-ice-400/20">
                      {project.category}
                    </span>
                    <h3 className="text-xl font-bold text-white mt-2 group-hover:text-ice-300 transition">
                      {project.title}
                    </h3>
                    <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-navy-800 flex items-center justify-between text-xs text-ice-400 font-semibold">
                    <span>View Project Details</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </GlassCard>
              ))}
            </div>
          </section>
        )}

        {/* FULL PROJECT GALLERY WITH DYNAMIC CATEGORY FILTERS */}
        <section id="projects" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-navy-800">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <FolderKanban className="w-6 h-6 text-ice-400" />
                <span>Project Gallery</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Explore published projects, architectures, and case samples.
              </p>
            </div>

            {/* Category Filter Pills ("All" is always first) */}
            {categories.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`
                      px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition
                      ${selectedCategory === cat
                        ? 'bg-ice-500 text-navy-950 shadow-md shadow-ice-500/20'
                        : 'glass-panel text-slate-300 hover:text-white'
                      }
                    `}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {filteredProjects.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              <p>No published projects in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <GlassCard
                  key={project.id}
                  onClick={() => setActiveModalProject(project)}
                  className="cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    {project.cover_image_url ? (
                      <div className="w-full h-40 rounded-xl bg-navy-950 overflow-hidden mb-3 border border-navy-800">
                        <img
                          src={project.cover_image_url}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-40 rounded-xl bg-navy-950 flex items-center justify-center mb-3 border border-navy-800 text-slate-700">
                        <FolderKanban className="w-8 h-8" />
                      </div>
                    )}

                    <span className="text-[10px] uppercase font-semibold text-ice-400 bg-ice-500/10 px-2 py-0.5 rounded border border-ice-400/20">
                      {project.category}
                    </span>
                    <h3 className="text-base font-bold text-white mt-2 group-hover:text-ice-300 transition line-clamp-1">
                      {project.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {project.description || 'No description provided.'}
                    </p>

                    {project.tech_stack && project.tech_stack.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {project.tech_stack.slice(0, 3).map((t, i) => (
                          <span key={i} className="text-[10px] bg-navy-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                            {t}
                          </span>
                        ))}
                        {project.tech_stack.length > 3 && (
                          <span className="text-[10px] text-slate-500 px-1">+{project.tech_stack.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 mt-3 border-t border-navy-800 flex items-center justify-between text-xs text-ice-400 font-medium">
                    <span>Inspect</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </section>

        {/* SKILLS SECTION */}
        <section id="skills" className="space-y-6">
          <div className="pb-2 border-b border-navy-800">
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Wrench className="w-6 h-6 text-ice-400" />
              <span>Skills & Technologies</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Technical proficiencies self-reported across frontend, backend, databases, and tooling.
            </p>
          </div>

          {Object.keys(groupedSkills).length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              <p>No skills published yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(groupedSkills).map(([cat, items]) => (
                <GlassCard key={cat} hoverEffect={false} className="space-y-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-ice-400" />
                    <span>{cat}</span>
                  </h3>

                  <div className="space-y-3">
                    {items.map((skill) => (
                      <div key={skill.id} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-slate-200">{skill.name}</span>
                          <span className="text-ice-300 font-mono text-[11px]">{skill.proficiency || 50}%</span>
                        </div>
                        <div className="w-full bg-navy-950 rounded-full h-1.5 overflow-hidden border border-navy-800">
                          <div
                            className="bg-gradient-to-r from-ice-500 to-sky-300 h-full rounded-full"
                            style={{ width: `${skill.proficiency || 50}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </section>

        {/* CASE STUDIES SECTION (if any published) */}
        {case_studies.length > 0 && (
          <section id="case-studies" className="space-y-6">
            <div className="pb-2 border-b border-navy-800">
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-ice-400" />
                <span>Case Studies</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Deep dives into real business problems, architectural decisions, and measurable outcomes.
              </p>
            </div>

            <div className="space-y-6">
              {case_studies.map((cs) => (
                <GlassCard key={cs.id} hoverEffect={false} className="space-y-4">
                  <div>
                    {cs.project_context && (
                      <span className="text-[10px] uppercase font-semibold text-ice-400 bg-ice-500/10 px-2 py-0.5 rounded border border-ice-400/20">
                        {cs.project_context}
                      </span>
                    )}
                    <h3 className="text-xl font-bold text-white mt-1.5">{cs.title}</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    {cs.problem && (
                      <div className="p-3.5 rounded-xl bg-navy-950/70 border border-navy-800">
                        <h4 className="text-xs font-semibold text-rose-300 uppercase tracking-wider mb-1">
                          The Challenge
                        </h4>
                        <p className="text-xs text-slate-300 leading-relaxed">{cs.problem}</p>
                      </div>
                    )}
                    {cs.solution && (
                      <div className="p-3.5 rounded-xl bg-navy-950/70 border border-navy-800">
                        <h4 className="text-xs font-semibold text-ice-300 uppercase tracking-wider mb-1">
                          The Solution
                        </h4>
                        <p className="text-xs text-slate-300 leading-relaxed">{cs.solution}</p>
                      </div>
                    )}
                    {cs.result && (
                      <div className="p-3.5 rounded-xl bg-navy-950/70 border border-navy-800">
                        <h4 className="text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-1">
                          The Impact
                        </h4>
                        <p className="text-xs text-slate-300 leading-relaxed">{cs.result}</p>
                      </div>
                    )}
                  </div>
                </GlassCard>
              ))}
            </div>
          </section>
        )}

        {/* TESTIMONIALS SECTION (if any published) */}
        {testimonials.length > 0 && (
          <section id="testimonials" className="space-y-6">
            <div className="pb-2 border-b border-navy-800">
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <MessageSquareQuote className="w-6 h-6 text-ice-400" />
                <span>Client Endorsements</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Feedback from founders, engineering leads, and clients.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {testimonials.map((t) => (
                <GlassCard key={t.id} className="flex flex-col justify-between space-y-4">
                  <div>
                    {/* Rating stars & self-entered badge */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: t.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                        ))}
                      </div>

                      <span className="text-[10px] text-slate-400 bg-navy-950 px-2 py-0.5 rounded border border-navy-800 font-mono">
                        Self-entered testimonial
                      </span>
                    </div>

                    <p className="text-sm text-slate-200 italic leading-relaxed">
                      "{t.testimonial}"
                    </p>
                  </div>

                  <div className="pt-3 border-t border-navy-800">
                    <p className="text-sm font-bold text-white">{t.client_name}</p>
                    <p className="text-xs text-slate-400">
                      {[t.client_role, t.client_company].filter(Boolean).join(' at ')}
                    </p>
                  </div>
                </GlassCard>
              ))}
            </div>
          </section>
        )}

        {/* CONTACT FORM SECTION */}
        <section id="contact" className="max-w-2xl mx-auto space-y-6 pt-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Get in Touch</h2>
            <p className="text-sm text-slate-400">
              Interested in collaborating or discussing an upcoming project? Send a direct message.
            </p>
          </div>

          <GlassCard hoverEffect={false}>
            {contactFeedback.text && (
              <div className={`mb-6 p-4 rounded-xl text-sm flex items-start gap-3 ${
                contactFeedback.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
              }`}>
                {contactFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                )}
                <span>{contactFeedback.text}</span>
              </div>
            )}

            <form onSubmit={handleContactSubmit} className="space-y-4">
              {/* Spam Honeypot Field (Hidden from humans) */}
              <div className="hidden" aria-hidden="true">
                <label>Website URL</label>
                <input
                  type="text"
                  tabIndex="-1"
                  autoComplete="off"
                  value={contactForm.hp_field}
                  onChange={(e) => setContactForm({ ...contactForm, hp_field: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={contactForm.sender_name}
                  onChange={(e) => setContactForm({ ...contactForm, sender_name: e.target.value })}
                  placeholder="Jane Doe"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Your Email Address *
                </label>
                <input
                  type="email"
                  required
                  maxLength={255}
                  value={contactForm.sender_email}
                  onChange={(e) => setContactForm({ ...contactForm, sender_email: e.target.value })}
                  placeholder="jane@company.com"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Message (10 - 2,000 characters) *
                </label>
                <textarea
                  required
                  rows={4}
                  minLength={10}
                  maxLength={2000}
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  placeholder="Hi Alex, I'd like to discuss building an application with you..."
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm resize-y"
                />
                <div className="flex justify-end text-[11px] text-slate-500 mt-1">
                  {contactForm.message.length} / 2,000
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingContact}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-ice-400 to-ice-500 hover:from-ice-300 hover:to-ice-400 text-navy-950 font-bold text-sm transition shadow-lg shadow-ice-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submittingContact ? (
                  <>
                    <div className="w-4 h-4 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
                    <span>Sending message...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message to {profile.full_name}</span>
                  </>
                )}
              </button>
            </form>
          </GlassCard>
        </section>
      </main>

      {/* Project Detail Modal */}
      <ProjectDetailModal
        project={activeModalProject}
        isOpen={Boolean(activeModalProject)}
        onClose={() => setActiveModalProject(null)}
      />

      {/* Footer */}
      <footer className="mt-20 border-t border-navy-800/80 py-8 text-center text-xs text-slate-500">
        <p>Published via <Link to="/" className="text-ice-400 hover:underline">Folio Voice</Link> — Freelancer Portfolio Manager</p>
      </footer>
    </div>
  );
}
