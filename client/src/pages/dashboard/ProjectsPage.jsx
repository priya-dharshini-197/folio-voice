import React, { useState, useEffect, useMemo } from 'react';
import {
  FolderKanban,
  Plus,
  ExternalLink,
  Star,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import GlassCard from '../../components/common/GlassCard';
import Modal from '../../components/common/Modal';
import { api } from '../../services/api';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form State
  const [form, setForm] = useState({
    title: '',
    description: '',
    cover_image_url: '',
    category: 'Full-Stack',
    tags: '',
    tech_stack: '',
    github_url: '',
    live_url: '',
    is_featured: false,
    is_published: false
  });

  async function loadProjects() {
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load projects.' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  // Compute categories dynamically from projects, "All" always first
  const categories = useMemo(() => {
    const set = new Set();
    projects.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return ['All', ...Array.from(set)];
  }, [projects]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'All') return projects;
    return projects.filter(p => p.category === selectedCategory);
  }, [projects, selectedCategory]);

  function handleOpenCreate() {
    setEditingProject(null);
    setForm({
      title: '',
      description: '',
      cover_image_url: '',
      category: 'Full-Stack',
      tags: '',
      tech_stack: '',
      github_url: '',
      live_url: '',
      is_featured: false,
      is_published: true
    });
    setModalOpen(true);
  }

  function handleOpenEdit(project) {
    setEditingProject(project);
    setForm({
      title: project.title,
      description: project.description || '',
      cover_image_url: project.cover_image_url || '',
      category: project.category || 'General',
      tags: Array.isArray(project.tags) ? project.tags.join(', ') : '',
      tech_stack: Array.isArray(project.tech_stack) ? project.tech_stack.join(', ') : '',
      github_url: project.github_url || '',
      live_url: project.live_url || '',
      is_featured: project.is_featured,
      is_published: project.is_published
    });
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!form.title.trim()) {
      setMessage({ type: 'error', text: 'Project title is required.' });
      return;
    }

    const payload = {
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      tech_stack: form.tech_stack.split(',').map(t => t.trim()).filter(Boolean)
    };

    try {
      if (editingProject) {
        await api.updateProject(editingProject.id, payload);
        setMessage({ type: 'success', text: `Project "${form.title}" updated!` });
      } else {
        await api.createProject(payload);
        setMessage({ type: 'success', text: `Project "${form.title}" created!` });
      }
      setModalOpen(false);
      await loadProjects();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save project.' });
    }
  }

  async function handleDelete(id) {
    try {
      await api.deleteProject(id);
      setDeleteConfirmId(null);
      setMessage({ type: 'success', text: 'Project removed successfully.' });
      await loadProjects();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete project.' });
    }
  }

  async function handleTogglePublish(id) {
    try {
      await api.togglePublishProject(id);
      await loadProjects();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update publication status.' });
    }
  }

  async function handleToggleFeatured(id) {
    try {
      await api.toggleFeaturedProject(id);
      await loadProjects();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update featured status.' });
    }
  }

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-navy-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <FolderKanban className="w-7 h-7 text-ice-400" />
            <span>Project Management</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Create, manage and publish your portfolio projects.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-ice-400 to-ice-500 hover:from-ice-300 hover:to-ice-400 text-navy-950 font-bold text-sm transition shadow-lg shadow-ice-500/25 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Status Alert */}
      {message.text && (
        <div className={`p-4 rounded-xl text-sm flex items-center gap-3 ${
          message.type === 'success'
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
            : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Dynamic Category Filters */}
      {categories.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs uppercase font-semibold text-slate-400 mr-2 flex-shrink-0">
            Categories:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`
                px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200
                ${selectedCategory === cat
                  ? 'bg-ice-500 text-navy-950 shadow-md shadow-ice-500/20'
                  : 'glass-panel text-slate-300 hover:text-white hover:border-ice-400/30'
                }
              `}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Projects Grid */}
      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <div className="w-8 h-8 border-4 border-ice-400/20 border-t-ice-400 rounded-full animate-spin" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <GlassCard hoverEffect={false} className="text-center py-16">
          <FolderKanban className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No projects found</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mt-1 mb-6">
            {selectedCategory !== 'All'
              ? `No projects found under category "${selectedCategory}".`
              : 'Start adding your work to showcase in your portfolio.'}
          </p>
          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 rounded-xl bg-ice-500 hover:bg-ice-400 text-navy-950 font-bold text-sm transition"
          >
            Add Your First Project
          </button>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <GlassCard key={project.id} className="flex flex-col justify-between group">
              <div>
                {/* Image Cover */}
                <div className="w-full h-44 rounded-xl bg-navy-950 border border-navy-800 overflow-hidden relative mb-4 flex items-center justify-center">
                  {project.cover_image_url ? (
                    <img
                      src={project.cover_image_url}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="text-center text-slate-600 p-4">
                      <FolderKanban className="w-10 h-10 mx-auto mb-1 text-slate-700" />
                      <span className="text-[11px] font-mono">No cover image</span>
                    </div>
                  )}

                  {/* Badges on image */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-navy-950/90 text-ice-300 border border-ice-400/30 backdrop-blur-sm">
                      {project.category}
                    </span>
                    {project.is_featured && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/90 text-navy-950 backdrop-blur-sm flex items-center gap-1">
                        <Star className="w-3 h-3 fill-navy-950" />
                        Featured
                      </span>
                    )}
                  </div>

                  <div className="absolute top-2.5 right-2.5">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium backdrop-blur-sm ${
                      project.is_published
                        ? 'bg-emerald-500/90 text-navy-950 font-bold'
                        : 'bg-navy-900/90 text-slate-400 border border-navy-700'
                    }`}>
                      {project.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="text-lg font-bold text-white group-hover:text-ice-300 transition line-clamp-1">
                  {project.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {project.description || 'No description provided.'}
                </p>

                {/* Tech Stack Pills */}
                {project.tech_stack && project.tech_stack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {project.tech_stack.map((t, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-navy-800 text-slate-300 px-2 py-0.5 rounded border border-navy-700 font-mono"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Actions & Links */}
              <div className="pt-4 mt-4 border-t border-navy-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {project.live_url ? (
                    <a
                      href={project.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-ice-300 hover:bg-navy-800 transition"
                      title="Open Live Preview"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : null}
                  {project.github_url ? (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition"
                      title="View GitHub Repository"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                      </svg>
                    </a>
                  ) : null}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleFeatured(project.id)}
                    className={`p-1.5 rounded-lg text-xs transition ${
                      project.is_featured ? 'text-amber-400 bg-amber-500/10' : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title={project.is_featured ? 'Remove featured' : 'Mark as featured'}
                  >
                    <Star className={`w-4 h-4 ${project.is_featured ? 'fill-amber-400' : ''}`} />
                  </button>

                  <button
                    onClick={() => handleTogglePublish(project.id)}
                    className={`p-1.5 rounded-lg text-xs transition ${
                      project.is_published ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title={project.is_published ? 'Unpublish' : 'Publish'}
                  >
                    {project.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => handleOpenEdit(project)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition"
                    title="Edit project"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setDeleteConfirmId(project.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    title="Delete project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <Modal
          isOpen={true}
          onClose={() => setDeleteConfirmId(null)}
          title="Confirm Delete"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-300">
              Are you sure you want to delete this project? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-3 border-t border-navy-800">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl glass-panel text-slate-300 hover:text-white text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm transition"
              >
                Delete Project
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProject ? 'Edit Project' : 'Add New Project'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. AI Portfolio Generator"
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Full-Stack, Mobile, Design, AI"
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Cover Image URL
              </label>
              <input
                type="url"
                value={form.cover_image_url}
                onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What problem does this project solve? What were your key contributions?"
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Tech Stack (comma separated)
              </label>
              <input
                type="text"
                value={form.tech_stack}
                onChange={(e) => setForm({ ...form, tech_stack: e.target.value })}
                placeholder="React, Node.js, SQLite, Tailwind"
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="Fullstack, Realtime, Open Source"
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Live URL
              </label>
              <input
                type="url"
                value={form.live_url}
                onChange={(e) => setForm({ ...form, live_url: e.target.value })}
                placeholder="https://mycoolapp.com"
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                GitHub Repository URL
              </label>
              <input
                type="url"
                value={form.github_url}
                onChange={(e) => setForm({ ...form, github_url: e.target.value })}
                placeholder="https://github.com/user/repo"
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                className="w-4 h-4 rounded text-ice-500 bg-navy-950 border-navy-700"
              />
              <span>Publish to Public Portfolio</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                className="w-4 h-4 rounded text-ice-500 bg-navy-950 border-navy-700"
              />
              <span>Mark as Featured</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-navy-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2.5 rounded-xl glass-panel text-slate-300 hover:text-white text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-ice-400 to-ice-500 hover:from-ice-300 hover:to-ice-400 text-navy-950 font-bold text-sm transition shadow-lg shadow-ice-500/25"
            >
              {editingProject ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
