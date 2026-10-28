import React, { useState, useEffect } from 'react';
import {
  Mail,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Inbox,
  Clock,
  User,
  Check
} from 'lucide-react';
import GlassCard from '../../components/common/GlassCard';
import Modal from '../../components/common/Modal';
import { api } from '../../services/api';

export default function MessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  async function loadMessages() {
    try {
      const data = await api.getMessages();
      setMessages(data);
    } catch (err) {
      setFeedback({ type: 'error', text: 'Failed to load messages.' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMessages();
  }, []);

  async function handleMarkRead(id) {
    try {
      await api.markMessageRead(id);
      setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m));
    } catch (err) {
      setFeedback({ type: 'error', text: 'Failed to mark message as read.' });
    }
  }

  async function handleDelete(id) {
    try {
      await api.deleteMessage(id);
      setDeleteConfirmId(null);
      setFeedback({ type: 'success', text: 'Message deleted.' });
      setMessages(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      setFeedback({ type: 'error', text: 'Failed to delete message.' });
    }
  }

  const unreadCount = messages.filter(m => !m.is_read).length;

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-navy-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Mail className="w-7 h-7 text-ice-400" />
            <span>Client Inquiries</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Messages and project requests submitted through your public portfolio contact form.
          </p>
        </div>

        {unreadCount > 0 && (
          <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-ice-500/15 border border-ice-400/30 text-ice-300 text-xs font-semibold">
            {unreadCount} Unread
          </span>
        )}
      </div>

      {feedback.text && (
        <div className={`p-4 rounded-xl text-sm flex items-center gap-3 ${
          feedback.type === 'success'
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
            : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
        }`}>
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <div className="w-8 h-8 border-4 border-ice-400/20 border-t-ice-400 rounded-full animate-spin" />
        </div>
      ) : messages.length === 0 ? (
        <GlassCard hoverEffect={false} className="text-center py-16">
          <Inbox className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">Your inbox is empty</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mt-1">
            When prospective clients submit inquiries on your public portfolio, they will appear here securely.
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {messages.map((m) => (
            <GlassCard
              key={m.id}
              hoverEffect={false}
              className={`space-y-3 transition ${
                !m.is_read ? 'border-l-4 border-l-ice-400 bg-navy-900/90' : 'bg-navy-900/60'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-navy-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-ice-500/10 border border-ice-400/20 flex items-center justify-center text-ice-400 text-xs font-bold">
                    {m.sender_name[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{m.sender_name}</h4>
                    <a
                      href={`mailto:${m.sender_email}`}
                      className="text-xs text-ice-400 hover:underline"
                    >
                      {m.sender_email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {new Date(m.created_at).toLocaleString()}
                  </span>

                  {!m.is_read && (
                    <button
                      onClick={() => handleMarkRead(m.id)}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-navy-800 hover:bg-navy-700 transition flex items-center gap-1"
                      title="Mark as Read"
                    >
                      <Check className="w-3 h-3" />
                      <span>Mark Read</span>
                    </button>
                  )}

                  <button
                    onClick={() => setDeleteConfirmId(m.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    title="Delete Message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line pt-1">
                {m.message}
              </p>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <Modal
          isOpen={true}
          onClose={() => setDeleteConfirmId(null)}
          title="Delete Message"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-300">
              Are you sure you want to permanently delete this client inquiry?
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
    </div>
  );
}
