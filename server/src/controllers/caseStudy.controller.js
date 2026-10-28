const db = require('../config/db');

/**
 * Get all case studies for authenticated user
 */
async function getCaseStudies(req, res, next) {
  try {
    const caseStudies = await db('case_studies')
      .where({ user_id: req.user.id })
      .orderBy('created_at', 'desc');

    return res.json(caseStudies.map(cs => ({ ...cs, is_published: Boolean(cs.is_published) })));
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new case study
 */
async function createCaseStudy(req, res, next) {
  try {
    const {
      title,
      project_context,
      problem,
      approach,
      solution,
      result,
      related_project_id,
      image_url,
      is_published
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Case study title is required.' });
    }

    const [insertedId] = await db('case_studies').insert({
      user_id: req.user.id,
      title: title.trim(),
      project_context: project_context?.trim() || null,
      problem: problem?.trim() || null,
      approach: approach?.trim() || null,
      solution: solution?.trim() || null,
      result: result?.trim() || null,
      related_project_id: related_project_id || null,
      image_url: image_url?.trim() || null,
      is_published: Boolean(is_published)
    });

    const actualId = typeof insertedId === 'object' ? insertedId.id : insertedId;
    const created = await db('case_studies').where({ id: actualId }).first();

    return res.status(201).json({ ...created, is_published: Boolean(created.is_published) });
  } catch (error) {
    next(error);
  }
}

/**
 * Update case study
 */
async function updateCaseStudy(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await db('case_studies').where({ id, user_id: req.user.id }).first();
    if (!existing) {
      return res.status(404).json({ error: 'Case study not found or unauthorized.' });
    }

    const {
      title,
      project_context,
      problem,
      approach,
      solution,
      result,
      related_project_id,
      image_url,
      is_published
    } = req.body;

    const updates = { updated_at: db.fn.now() };

    if (title !== undefined) {
      if (!title.trim()) return res.status(400).json({ error: 'Title cannot be empty.' });
      updates.title = title.trim();
    }
    if (project_context !== undefined) updates.project_context = project_context?.trim() || null;
    if (problem !== undefined) updates.problem = problem?.trim() || null;
    if (approach !== undefined) updates.approach = approach?.trim() || null;
    if (solution !== undefined) updates.solution = solution?.trim() || null;
    if (result !== undefined) updates.result = result?.trim() || null;
    if (related_project_id !== undefined) updates.related_project_id = related_project_id || null;
    if (image_url !== undefined) updates.image_url = image_url?.trim() || null;
    if (is_published !== undefined) updates.is_published = Boolean(is_published);

    await db('case_studies').where({ id, user_id: req.user.id }).update(updates);
    const updated = await db('case_studies').where({ id }).first();

    return res.json({ ...updated, is_published: Boolean(updated.is_published) });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete case study
 */
async function deleteCaseStudy(req, res, next) {
  try {
    const { id } = req.params;
    const count = await db('case_studies').where({ id, user_id: req.user.id }).del();
    if (!count) {
      return res.status(404).json({ error: 'Case study not found or unauthorized.' });
    }
    return res.json({ success: true, message: 'Case study deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

/**
 * Toggle publish status
 */
async function togglePublishCaseStudy(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await db('case_studies').where({ id, user_id: req.user.id }).first();
    if (!existing) {
      return res.status(404).json({ error: 'Case study not found or unauthorized.' });
    }

    const nextState = !existing.is_published;
    await db('case_studies').where({ id }).update({
      is_published: nextState,
      updated_at: db.fn.now()
    });

    const updated = await db('case_studies').where({ id }).first();
    return res.json({ ...updated, is_published: Boolean(updated.is_published) });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCaseStudies,
  createCaseStudy,
  updateCaseStudy,
  deleteCaseStudy,
  togglePublishCaseStudy
};
