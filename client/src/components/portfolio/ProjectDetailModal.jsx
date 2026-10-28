import React from 'react';
import { ExternalLink, Star, FolderKanban } from 'lucide-react';
import Modal from '../common/Modal';

export default function ProjectDetailModal({ project, isOpen, onClose }) {
  if (!project) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={project.title} maxWidth="max-w-3xl">
      <div className="space-y-6">
        {/* Cover Image */}
        {project.cover_image_url && (
          <div className="w-full h-64 sm:h-80 rounded-xl bg-navy-950 overflow-hidden border border-navy-700/60 relative">
            <img
              src={project.cover_image_url}
              alt={project.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            {project.is_featured && (
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500 text-navy-950 flex items-center gap-1 shadow-md">
                <Star className="w-3.5 h-3.5 fill-navy-950" />
                Featured Project
              </span>
            )}
          </div>
        )}

        {/* Category & Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-navy-700/60">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-semibold text-ice-300 bg-ice-500/15 border border-ice-400/30 px-3 py-1 rounded-full">
              {project.category || 'General'}
            </span>
            {project.is_published !== undefined && (
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                project.is_published
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>
                {project.is_published ? 'Published' : 'Draft'}
              </span>
            )}
          </div>

          {/* Action Links */}
          <div className="flex items-center gap-3">
            {project.live_url ? (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-ice-500 hover:bg-ice-400 text-navy-950 font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-ice-500/20"
              >
                <span>View Live Project</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <span className="text-xs text-slate-500 italic px-2 py-1 bg-navy-950/60 rounded border border-navy-800">
                Live link unavailable
              </span>
            )}

            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl glass-panel text-slate-200 hover:text-white font-medium text-xs transition flex items-center gap-2"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span>Source Code</span>
              </a>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">About this project</h4>
          <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
            {project.description || 'No detailed description provided.'}
          </p>
        </div>

        {/* Tech Stack */}
        {project.tech_stack && project.tech_stack.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Technologies Used</h4>
            <div className="flex flex-wrap gap-2">
              {project.tech_stack.map((tech, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-lg bg-navy-800/80 border border-navy-700 text-xs font-mono text-ice-300"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Tags & Topics</h4>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag, i) => (
                <span key={i} className="px-2.5 py-0.5 rounded-md bg-navy-950 text-slate-400 text-xs border border-navy-800">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
