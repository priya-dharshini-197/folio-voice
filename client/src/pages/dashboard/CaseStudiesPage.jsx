import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
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

export default function CaseStudiesPage() {
  const [caseStudies, setCaseStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [form, setForm] = useState({
    title: '',
    project_context: '',
    problem: '',
    approach: '',
    solution: '',
    result: '',
    is_published: true
  });

  async function loadCaseStudies() {
    try {
      const data = await api.getCaseStudies();
      setCaseStudies(data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load case studies.' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCaseStudies();
  }, []);

  function handleOpenCreate() {
    setEditingItem(null);
    setForm({
      title: '',
      project_context: '',
      problem: '',
      approach: '',
      solution: '',
      result: '',
      is_published: true
    });
    setModalOpen(true);
  }

  function handleOpenEdit(item) {
    setEditingItem(item);
    setForm({
      title: item.title,
      project_context: item.project_context || '',
      problem: item.problem || '',
      approach: item.approach || '',
      solution: item.solution || '',
      result: item.result || '',
      is_published: item.is_published
    });
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!form.title.trim()) {
      setMessage({ type: 'error', text: 'Title is required.' });
      return;
    }

    try {
      if (editingItem) {
        await api.updateCaseStudy(editingItem.id, form);
        setMessage({ type: 'success', text: `Case study "${form.title}" updated!` });
      } else {
        await api.createCaseStudy(form);
        setMessage({ type: 'success', text: `Case study "${form.title}" created!` });
      }
      setModalOpen(false);
      await loadCaseStudies();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save case study.' });
    }
  }

  async function handleDelete(id) {
    try {
      await api.deleteCaseStudy(id);
      setDeleteConfirmId(null);
      setMessage({ type: 'success', text: 'Case study deleted.' });
      await loadCaseStudies();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete.' });
    }
  }

  async function handleTogglePublish(id) {
    try {
      await api.togglePublishCaseStudy(id);
      await loadCaseStudies();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to toggle publication status.' });
    }
  }

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-navy-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-ice-400" />
            <span>Case Studies</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Highlight in-depth architectural solutions, client problem solving, and quantified results.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-ice-400 to-ice-500 hover:from-ice-300 hover:to-ice-400 text-navy-950 font-bold text-sm transition shadow-lg shadow-ice-500/25 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Case Study</span>
        </button>
      </div>

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

      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <div className="w-8 h-8 border-4 border-ice-400/20 border-t-ice-400 rounded-full animate-spin" />
        </div>
      ) : caseStudies.length === 0 ? (
        <GlassCard hoverEffect={false} className="text-center py-16">
          <BookOpen className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No case studies yet</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mt-1 mb-6">
            Case studies show potential clients how you approach complex problems and deliver measurable results.
          </p>
          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 rounded-xl bg-ice-500 hover:bg-ice-400 text-navy-950 font-bold text-sm transition"
          >
            Create Your First Case Study
          </button>
        </GlassCard>
      ) : (
        <div className="space-y-6">
          {caseStudies.map((cs) => (
            <GlassCard key={cs.id} className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-navy-800">
                <div>
                  {cs.project_context && (
                    <span className="text-[10px] uppercase font-semibold text-ice-400 bg-ice-500/10 px-2 py-0.5 rounded border border-ice-400/20">
                      {cs.project_context}
                    </span>
                  )}
                  <h3 className="text-lg font-bold text-white mt-1">{cs.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                    cs.is_published
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {cs.is_published ? 'Published' : 'Draft'}
                  </span>

                  <button
                    onClick={() => handleTogglePublish(cs.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition"
                    title={cs.is_published ? 'Unpublish' : 'Publish'}
                  >
                    {cs.is_published ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => handleOpenEdit(cs)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setDeleteConfirmId(cs.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {cs.problem && (
                  <div className="p-3 rounded-xl bg-navy-900/60 border border-navy-800">
                    <p className="font-semibold text-rose-300 uppercase mb-1">Problem</p>
                    <p className="text-slate-300 line-clamp-3 leading-relaxed">{cs.problem}</p>
                  </div>
                )}
                {cs.solution && (
                  <div className="p-3 rounded-xl bg-navy-900/60 border border-navy-800">
                    <p className="font-semibold text-ice-300 uppercase mb-1">Solution</p>
                    <p className="text-slate-300 line-clamp-3 leading-relaxed">{cs.solution}</p>
                  </div>
                )}
                {cs.result && (
                  <div className="p-3 rounded-xl bg-navy-900/60 border border-navy-800">
                    <p className="font-semibold text-emerald-300 uppercase mb-1">Result</p>
                    <p className="text-slate-300 line-clamp-3 leading-relaxed">{cs.result}</p>
                  </div>
                )}
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
          title="Delete Case Study"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-300">
              Are you sure you want to delete this case study?
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
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'Edit Case Study' : 'Add Case Study'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Title *
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Scaling Real-Time Chat Infrastructure"
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Project Context / Domain
            </label>
            <input
              type="text"
              value={form.project_context}
              onChange={(e) => setForm({ ...form, project_context: e.target.value })}
              placeholder="e.g. Fintech Mobile App, E-Commerce Replatforming"
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              The Problem
            </label>
            <textarea
              rows={2}
              value={form.problem}
              onChange={(e) => setForm({ ...form, problem: e.target.value })}
              placeholder="What initial bottleneck or business challenge did the client face?"
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              The Approach & Solution
            </label>
            <textarea
              rows={3}
              value={form.solution}
              onChange={(e) => setForm({ ...form, solution: e.target.value })}
              placeholder="How did you architect and execute the solution?"
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              The Measurable Outcome / Result
            </label>
            <textarea
              rows={2}
              value={form.result}
              onChange={(e) => setForm({ ...form, result: e.target.value })}
              placeholder="e.g. Reduced API latency by 65%, supported 100k peak concurrent users"
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300 pt-2">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
              className="w-4 h-4 rounded text-ice-500 bg-navy-950 border-navy-700"
            />
            <span>Publish to Public Portfolio</span>
          </label>

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
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-ice-400 to-ice-500 hover:from-ice-300 hover:to-ice-400 text-navy-950 font-bold text-sm"
            >
              {editingItem ? 'Save Changes' : 'Create Case Study'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
