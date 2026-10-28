import React, { useState, useEffect, useMemo } from 'react';
import {
  Wrench,
  Plus,
  Edit2,
  Trash2,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import GlassCard from '../../components/common/GlassCard';
import Modal from '../../components/common/Modal';
import { api } from '../../services/api';

export default function SkillsPage() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [form, setForm] = useState({
    name: '',
    category: 'Frontend',
    proficiency: 80,
    years_of_experience: 3
  });

  async function loadSkills() {
    try {
      const data = await api.getSkills();
      setSkills(data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load skills.' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSkills();
  }, []);

  // Group skills by category
  const groupedSkills = useMemo(() => {
    const groups = {};
    skills.forEach(skill => {
      const cat = skill.category || 'General';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(skill);
    });
    return groups;
  }, [skills]);

  function handleOpenCreate() {
    setEditingSkill(null);
    setForm({
      name: '',
      category: 'Frontend',
      proficiency: 80,
      years_of_experience: 2
    });
    setModalOpen(true);
  }

  function handleOpenEdit(skill) {
    setEditingSkill(skill);
    setForm({
      name: skill.name,
      category: skill.category || 'Frontend',
      proficiency: skill.proficiency || 50,
      years_of_experience: skill.years_of_experience || 0
    });
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!form.name.trim()) {
      setMessage({ type: 'error', text: 'Skill name is required.' });
      return;
    }

    try {
      if (editingSkill) {
        await api.updateSkill(editingSkill.id, form);
        setMessage({ type: 'success', text: `Skill "${form.name}" updated!` });
      } else {
        await api.createSkill(form);
        setMessage({ type: 'success', text: `Skill "${form.name}" added!` });
      }
      setModalOpen(false);
      await loadSkills();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save skill.' });
    }
  }

  async function handleDelete(id) {
    try {
      await api.deleteSkill(id);
      setDeleteConfirmId(null);
      setMessage({ type: 'success', text: 'Skill removed successfully.' });
      await loadSkills();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete skill.' });
    }
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-navy-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Wrench className="w-7 h-7 text-ice-400" />
            <span>Skills & Expertise</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Showcase your technical stack and self-reported proficiencies.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-ice-400 to-ice-500 hover:from-ice-300 hover:to-ice-400 text-navy-950 font-bold text-sm transition shadow-lg shadow-ice-500/25 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Skill</span>
        </button>
      </div>

      {/* Notice Banner */}
      <div className="p-3.5 rounded-xl bg-ice-500/10 border border-ice-400/20 text-xs text-slate-300 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-ice-400 flex-shrink-0 mt-0.5" />
        <span>
          <strong>Note:</strong> Skill proficiencies represent self-reported levels of experience and familiarity, not objective automated benchmark scores.
        </span>
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

      {/* Skills Grouped by Category */}
      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <div className="w-8 h-8 border-4 border-ice-400/20 border-t-ice-400 rounded-full animate-spin" />
        </div>
      ) : Object.keys(groupedSkills).length === 0 ? (
        <GlassCard hoverEffect={false} className="text-center py-16">
          <Wrench className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No skills added yet</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mt-1 mb-6">
            Highlight your technical tools, frameworks, and design capabilities.
          </p>
          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 rounded-xl bg-ice-500 hover:bg-ice-400 text-navy-950 font-bold text-sm transition"
          >
            Add Your First Skill
          </button>
        </GlassCard>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedSkills).map(([category, items]) => (
            <div key={category} className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-ice-400" />
                {category}
                <span className="text-xs font-normal text-slate-400 ml-1">({items.length})</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((skill) => (
                  <GlassCard key={skill.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-white text-sm">{skill.name}</h4>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(skill)}
                          className="p-1 rounded text-slate-400 hover:text-white transition"
                          title="Edit skill"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(skill.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-400 transition"
                          title="Delete skill"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Proficiency Progress Bar */}
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>Self-reported proficiency</span>
                        <span className="text-ice-300 font-mono font-medium">{skill.proficiency || 0}%</span>
                      </div>
                      <div className="w-full bg-navy-950 rounded-full h-2 overflow-hidden border border-navy-800">
                        <div
                          className="bg-gradient-to-r from-ice-500 to-sky-300 h-full rounded-full transition-all duration-500"
                          style={{ width: `${skill.proficiency || 0}%` }}
                        />
                      </div>
                    </div>

                    {skill.years_of_experience !== null && skill.years_of_experience !== undefined && (
                      <div className="text-[11px] text-slate-400 pt-1">
                        Experience:{' '}
                        <span className="text-slate-200 font-medium">
                          {skill.years_of_experience} {skill.years_of_experience === 1 ? 'year' : 'years'}
                        </span>
                      </div>
                    )}
                  </GlassCard>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <Modal
          isOpen={true}
          onClose={() => setDeleteConfirmId(null)}
          title="Delete Skill"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-300">
              Are you sure you want to remove this skill from your profile?
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
                Delete Skill
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add / Edit Skill Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSkill ? 'Edit Skill' : 'Add Skill'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Skill Name *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. React, TypeScript, Figma"
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="Frontend, Backend, Database, Cloud, Design"
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Self-Reported Proficiency
              </label>
              <span className="text-xs font-mono text-ice-400 font-bold">{form.proficiency}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={form.proficiency}
              onChange={(e) => setForm({ ...form, proficiency: parseInt(e.target.value, 10) })}
              className="w-full accent-ice-400 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Years of Experience
            </label>
            <input
              type="number"
              min="0"
              max="50"
              step="1"
              value={form.years_of_experience}
              onChange={(e) => setForm({ ...form, years_of_experience: e.target.value })}
              placeholder="e.g. 3"
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-navy-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl glass-panel text-slate-300 hover:text-white text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-ice-400 to-ice-500 hover:from-ice-300 hover:to-ice-400 text-navy-950 font-bold text-sm transition shadow-lg shadow-ice-500/25"
            >
              {editingSkill ? 'Save Changes' : 'Add Skill'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

