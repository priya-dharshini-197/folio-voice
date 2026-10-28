import React, { useState, useEffect } from 'react';
import {
  MessageSquareQuote,
  Plus,
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

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [form, setForm] = useState({
    client_name: '',
    client_role: '',
    client_company: '',
    testimonial: '',
    rating: 5,
    date: '',
    is_published: true
  });

  async function loadTestimonials() {
    try {
      const data = await api.getTestimonials();
      setTestimonials(data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load testimonials.' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTestimonials();
  }, []);

  function handleOpenCreate() {
    setEditingItem(null);
    setForm({
      client_name: '',
      client_role: '',
      client_company: '',
      testimonial: '',
      rating: 5,
      date: new Date().getFullYear().toString(),
      is_published: true
    });
    setModalOpen(true);
  }

  function handleOpenEdit(item) {
    setEditingItem(item);
    setForm({
      client_name: item.client_name,
      client_role: item.client_role || '',
      client_company: item.client_company || '',
      testimonial: item.testimonial,
      rating: item.rating || 5,
      date: item.date || '',
      is_published: item.is_published
    });
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!form.client_name.trim()) {
      setMessage({ type: 'error', text: 'Client name is required.' });
      return;
    }
    if (!form.testimonial.trim()) {
      setMessage({ type: 'error', text: 'Testimonial text is required.' });
      return;
    }

    try {
      if (editingItem) {
        await api.updateTestimonial(editingItem.id, form);
        setMessage({ type: 'success', text: 'Testimonial updated!' });
      } else {
        await api.createTestimonial(form);
        setMessage({ type: 'success', text: 'Testimonial created!' });
      }
      setModalOpen(false);
      await loadTestimonials();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save.' });
    }
  }

  async function handleDelete(id) {
    try {
      await api.deleteTestimonial(id);
      setDeleteConfirmId(null);
      setMessage({ type: 'success', text: 'Testimonial deleted.' });
      await loadTestimonials();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete.' });
    }
  }

  async function handleTogglePublish(id) {
    try {
      await api.togglePublishTestimonial(id);
      await loadTestimonials();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update publication status.' });
    }
  }

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-navy-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <MessageSquareQuote className="w-7 h-7 text-ice-400" />
            <span>Client Testimonials</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage feedback from clients. Testimonials are transparently labeled as self-entered.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-ice-400 to-ice-500 hover:from-ice-300 hover:to-ice-400 text-navy-950 font-bold text-sm transition shadow-lg shadow-ice-500/25 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Testimonial</span>
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
      ) : testimonials.length === 0 ? (
        <GlassCard hoverEffect={false} className="text-center py-16">
          <MessageSquareQuote className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No testimonials added</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mt-1 mb-6">
            Add endorsements from happy clients, engineering managers, and collaborators.
          </p>
          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 rounded-xl bg-ice-500 hover:bg-ice-400 text-navy-950 font-bold text-sm transition"
          >
            Add Your First Testimonial
          </button>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t) => (
            <GlassCard key={t.id} className="flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: t.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>

                  <span className="text-[10px] text-slate-400 bg-navy-950 px-2 py-0.5 rounded border border-navy-800 font-mono">
                    Self-entered
                  </span>
                </div>

                <p className="text-sm text-slate-200 italic leading-relaxed">
                  "{t.testimonial}"
                </p>
              </div>

              <div className="pt-3 border-t border-navy-800 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">{t.client_name}</p>
                  <p className="text-xs text-slate-400">
                    {[t.client_role, t.client_company].filter(Boolean).join(' at ')}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleTogglePublish(t.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white transition"
                    title={t.is_published ? 'Unpublish' : 'Publish'}
                  >
                    {t.is_published ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleOpenEdit(t)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white transition"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(t.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 transition"
                    title="Delete"
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
          title="Delete Testimonial"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-300">
              Are you sure you want to delete this testimonial?
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
        title={editingItem ? 'Edit Testimonial' : 'Add Testimonial'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Client Name *
              </label>
              <input
                type="text"
                required
                value={form.client_name}
                onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                placeholder="Sarah Connor"
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Client Role
              </label>
              <input
                type="text"
                value={form.client_role}
                onChange={(e) => setForm({ ...form, client_role: e.target.value })}
                placeholder="VP of Engineering"
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Company / Organization
              </label>
              <input
                type="text"
                value={form.client_company}
                onChange={(e) => setForm({ ...form, client_company: e.target.value })}
                placeholder="Acme Inc."
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Rating (1 - 5 stars)
              </label>
              <select
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: parseInt(e.target.value, 10) })}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              >
                <option value="5">★★★★★ (5 Stars)</option>
                <option value="4">★★★★☆ (4 Stars)</option>
                <option value="3">★★★☆☆ (3 Stars)</option>
                <option value="2">★★☆☆☆ (2 Stars)</option>
                <option value="1">★☆☆☆☆ (1 Star)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Written Testimonial *
            </label>
            <textarea
              rows={4}
              required
              value={form.testimonial}
              onChange={(e) => setForm({ ...form, testimonial: e.target.value })}
              placeholder="What did the client say about your work, communication, and delivery?"
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
              {editingItem ? 'Save Changes' : 'Create Testimonial'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
