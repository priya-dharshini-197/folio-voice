import React, { useState, useEffect } from 'react';
import {
  User,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Link as LinkIcon,
  MapPin,
  Mail,
  FileText
} from 'lucide-react';
import GlassCard from '../../components/common/GlassCard';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export default function ProfilePage() {
  const { profile, refreshProfile } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    headline: '',
    bio: '',
    avatar_url: '',
    location: '',
    contact_email: '',
    github_url: '',
    linkedin_url: '',
    website_url: '',
    resume_url: ''
  });
  const [initialData, setInitialData] = useState({});
  const [completeness, setCompleteness] = useState({ percentage: 0, checklist: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await api.getProfile();
        const p = res.profile;
        const data = {
          full_name: p.full_name || '',
          headline: p.headline || '',
          bio: p.bio || '',
          avatar_url: p.avatar_url || '',
          location: p.location || '',
          contact_email: p.contact_email || '',
          github_url: p.github_url || '',
          linkedin_url: p.linkedin_url || '',
          website_url: p.website_url || '',
          resume_url: p.resume_url || ''
        };
        setFormData(data);
        setInitialData(data);
        setCompleteness(res.completeness);
      } catch (err) {
        setMessage({ type: 'error', text: 'Failed to load profile.' });
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  function handleReset() {
    setFormData(initialData);
    setMessage({ type: 'info', text: 'Form reset to saved values.' });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setSaving(true);

    try {
      const res = await api.updateProfile(formData);
      setInitialData(formData);
      setCompleteness(res.completeness);
      await refreshProfile();
      setMessage({ type: 'success', text: 'Profile changes saved successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save changes.' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-ice-400/20 border-t-ice-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="pb-2 border-b border-navy-800">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <User className="w-7 h-7 text-ice-400" />
          <span>Profile Management</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Update your public portfolio identity, biography, and professional links.
        </p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl text-sm flex items-center gap-3 ${
          message.type === 'success'
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
            : message.type === 'error'
            ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
            : 'bg-ice-500/10 border border-ice-400/30 text-ice-300'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Profile Form */}
        <div className="lg:col-span-2">
          <GlassCard hoverEffect={false}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Identity Section */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-ice-400 rounded-full" />
                  Primary Identity
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      placeholder="Alex Morgan"
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Headline
                    </label>
                    <input
                      type="text"
                      name="headline"
                      value={formData.headline}
                      onChange={handleChange}
                      placeholder="Senior Full-Stack Engineer & Designer"
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Avatar Image URL
                  </label>
                  <input
                    type="url"
                    name="avatar_url"
                    value={formData.avatar_url}
                    onChange={handleChange}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Biography
                  </label>
                  <textarea
                    rows={4}
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell potential clients about your background, experience, and the kind of problems you love solving..."
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm resize-y"
                  />
                </div>
              </div>

              {/* Contact & Location */}
              <div className="pt-4 border-t border-navy-800 space-y-4">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-ice-400 rounded-full" />
                  Contact & Location
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Berlin, Germany (Remote)"
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      Contact Email
                    </label>
                    <input
                      type="email"
                      name="contact_email"
                      value={formData.contact_email}
                      onChange={handleChange}
                      placeholder="contact@alexmorgan.dev"
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Links */}
              <div className="pt-4 border-t border-navy-800 space-y-4">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-ice-400 rounded-full" />
                  Professional Links
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
                      GitHub Profile URL
                    </label>
                    <input
                      type="url"
                      name="github_url"
                      value={formData.github_url}
                      onChange={handleChange}
                      placeholder="https://github.com/alexmorgan"
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
                      LinkedIn URL
                    </label>
                    <input
                      type="url"
                      name="linkedin_url"
                      value={formData.linkedin_url}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/in/alexmorgan"
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
                      Personal Website
                    </label>
                    <input
                      type="url"
                      name="website_url"
                      value={formData.website_url}
                      onChange={handleChange}
                      placeholder="https://alexmorgan.dev"
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      Resume Link (PDF/Docs)
                    </label>
                    <input
                      type="url"
                      name="resume_url"
                      value={formData.resume_url}
                      onChange={handleChange}
                      placeholder="https://drive.google.com/..."
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-navy-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2.5 rounded-xl glass-panel text-slate-300 hover:text-white text-sm font-medium transition flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset</span>
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-ice-400 to-ice-500 hover:from-ice-300 hover:to-ice-400 text-navy-950 font-bold text-sm transition shadow-lg shadow-ice-500/25 flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>

        {/* Completeness Card Sidebar */}
        <div className="space-y-6">
          <GlassCard hoverEffect={false} className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-navy-800">
              <Sparkles className="w-5 h-5 text-ice-400" />
              <h3 className="text-base font-bold text-white">Completeness Score</h3>
            </div>

            <div className="text-center py-2">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-ice-400/20 bg-ice-500/10 mb-2">
                <span className="text-2xl font-extrabold text-white">{completeness.percentage}%</span>
              </div>
              <p className="text-xs text-slate-400">
                {completeness.isComplete ? '🎉 Your profile is 100% complete!' : 'Complete all items for best client conversion'}
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-navy-800">
              {completeness.checklist?.map((item) => (
                <div key={item.key} className="flex items-center justify-between text-xs py-1">
                  <div className="flex items-center gap-2">
                    {item.done ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[10px] text-slate-500">
                        •
                      </div>
                    )}
                    <span className={item.done ? 'text-slate-300' : 'text-slate-400'}>{item.label}</span>
                  </div>
                  <span className="text-slate-500 font-mono text-[11px]">+{item.points}%</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

