const db = require('../config/db');

/**
 * Format project from DB (safely parse tags and tech_stack arrays)
 */
function formatProject(project) {
  if (!project) return null;
  let tags = [];
  let tech_stack = [];
  try {
    tags = typeof project.tags === 'string' ? JSON.parse(project.tags) : (project.tags || []);
  } catch (e) {
    tags = [];
  }
  try {
    tech_stack = typeof project.tech_stack === 'string' ? JSON.parse(project.tech_stack) : (project.tech_stack || []);
  } catch (e) {
    tech_stack = [];
  }

  return {
    ...project,
    is_featured: Boolean(project.is_featured),
    is_published: Boolean(project.is_published),
    tags,
    tech_stack
  };
}

/**
 * Get all projects for current user
 */
async function getProjects(req, res, next) {
  try {
    const { category } = req.query;
    let query = db('projects').where({ user_id: req.user.id });

    if (category && category !== 'All') {
      query = query.where({ category });
    }

    const projects = await query.orderBy('created_at', 'desc');
    return res.json(projects.map(formatProject));
  } catch (error) {
    next(error);
  }
}

/**
 * Get single project by id
 */
async function getProjectById(req, res, next) {
  try {
    const { id } = req.params;
    const project = await db('projects').where({ id, user_id: req.user.id }).first();
    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }
    return res.json(formatProject(project));
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new project
 */
async function createProject(req, res, next) {
  try {
    const {
      title,
      description,
      cover_image_url,
      category,
      tags,
      tech_stack,
      github_url,
      live_url,
      is_featured,
      is_published
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Project title is required.' });
    }

    const newProjectData = {
      user_id: req.user.id,
      title: title.trim(),
      description: description?.trim() || null,
      cover_image_url: cover_image_url?.trim() || null,
      category: category?.trim() || 'General',
      tags: JSON.stringify(Array.isArray(tags) ? tags : []),
      tech_stack: JSON.stringify(Array.isArray(tech_stack) ? tech_stack : []),
      github_url: github_url?.trim() || null,
      live_url: live_url?.trim() || null,
      is_featured: Boolean(is_featured),
      is_published: Boolean(is_published)
    };

    const [insertedId] = await db('projects').insert(newProjectData);
    const actualId = typeof insertedId === 'object' ? insertedId.id : insertedId;

    const created = await db('projects').where({ id: actualId }).first();
    return res.status(201).json(formatProject(created));
  } catch (error) {
    next(error);
  }
}

/**
 * Update project
 */
async function updateProject(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await db('projects').where({ id, user_id: req.user.id }).first();
    if (!existing) {
      return res.status(404).json({ error: 'Project not found or unauthorized.' });
    }

    const {
      title,
      description,
      cover_image_url,
      category,
      tags,
      tech_stack,
      github_url,
      live_url,
      is_featured,
      is_published
    } = req.body;

    const updates = {
      updated_at: db.fn.now()
    };

    if (title !== undefined) {
      if (!title.trim()) return res.status(400).json({ error: 'Title cannot be empty.' });
      updates.title = title.trim();
    }
    if (description !== undefined) updates.description = description?.trim() || null;
    if (cover_image_url !== undefined) updates.cover_image_url = cover_image_url?.trim() || null;
    if (category !== undefined) updates.category = category?.trim() || 'General';
    if (tags !== undefined) updates.tags = JSON.stringify(Array.isArray(tags) ? tags : []);
    if (tech_stack !== undefined) updates.tech_stack = JSON.stringify(Array.isArray(tech_stack) ? tech_stack : []);
    if (github_url !== undefined) updates.github_url = github_url?.trim() || null;
    if (live_url !== undefined) updates.live_url = live_url?.trim() || null;
    if (is_featured !== undefined) updates.is_featured = Boolean(is_featured);
    if (is_published !== undefined) updates.is_published = Boolean(is_published);

    await db('projects').where({ id, user_id: req.user.id }).update(updates);

    const updated = await db('projects').where({ id }).first();
    return res.json(formatProject(updated));
  } catch (error) {
    next(error);
  }
}

/**
 * Delete project
 */
async function deleteProject(req, res, next) {
  try {
    const { id } = req.params;
    const count = await db('projects').where({ id, user_id: req.user.id }).del();
    if (!count) {
      return res.status(404).json({ error: 'Project not found or unauthorized.' });
    }
    return res.json({ success: true, message: 'Project deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

/**
 * Toggle publish status
 */
async function togglePublish(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await db('projects').where({ id, user_id: req.user.id }).first();
    if (!existing) {
      return res.status(404).json({ error: 'Project not found or unauthorized.' });
    }

    const nextState = !existing.is_published;
    await db('projects').where({ id }).update({
      is_published: nextState,
      updated_at: db.fn.now()
    });

    const updated = await db('projects').where({ id }).first();
    return res.json(formatProject(updated));
  } catch (error) {
    next(error);
  }
}

/**
 * Toggle featured status
 */
async function toggleFeatured(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await db('projects').where({ id, user_id: req.user.id }).first();
    if (!existing) {
      return res.status(404).json({ error: 'Project not found or unauthorized.' });
    }

    const nextState = !existing.is_featured;
    await db('projects').where({ id }).update({
      is_featured: nextState,
      updated_at: db.fn.now()
    });

    const updated = await db('projects').where({ id }).first();
    return res.json(formatProject(updated));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  togglePublish,
  toggleFeatured
};

