const db = require('../config/db');

/**
 * Get all skills for current user
 */
async function getSkills(req, res, next) {
  try {
    const skills = await db('skills')
      .where({ user_id: req.user.id })
      .orderBy(['category', { column: 'proficiency', order: 'desc' }]);
    return res.json(skills);
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new skill
 */
async function createSkill(req, res, next) {
  try {
    const { name, category, proficiency, years_of_experience } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Skill name is required.' });
    }

    const validProficiency = proficiency !== undefined && proficiency !== null
      ? Math.max(1, Math.min(100, parseInt(proficiency, 10) || 50))
      : null;

    const validYears = years_of_experience !== undefined && years_of_experience !== null
      ? Math.max(0, parseFloat(years_of_experience) || 0)
      : null;

    const [insertedId] = await db('skills').insert({
      user_id: req.user.id,
      name: name.trim(),
      category: category?.trim() || 'Frontend',
      proficiency: validProficiency,
      years_of_experience: validYears
    }, 'id');
    const actualId = typeof insertedId === 'object' ? insertedId.id : insertedId;
    const created = await db('skills').where({ id: actualId }).first();

    return res.status(201).json(created);
  } catch (error) {
    next(error);
  }
}

/**
 * Update a skill
 */
async function updateSkill(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await db('skills').where({ id, user_id: req.user.id }).first();
    if (!existing) {
      return res.status(404).json({ error: 'Skill not found or unauthorized.' });
    }

    const { name, category, proficiency, years_of_experience } = req.body;
    const updates = { updated_at: db.fn.now() };

    if (name !== undefined) {
      if (!name.trim()) return res.status(400).json({ error: 'Skill name cannot be empty.' });
      updates.name = name.trim();
    }
    if (category !== undefined) updates.category = category?.trim() || 'Frontend';
    if (proficiency !== undefined) {
      updates.proficiency = proficiency !== null
        ? Math.max(1, Math.min(100, parseInt(proficiency, 10) || 50))
        : null;
    }
    if (years_of_experience !== undefined) {
      updates.years_of_experience = years_of_experience !== null
        ? Math.max(0, parseFloat(years_of_experience) || 0)
        : null;
    }

    await db('skills').where({ id, user_id: req.user.id }).update(updates);
    const updated = await db('skills').where({ id }).first();

    return res.json(updated);
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a skill
 */
async function deleteSkill(req, res, next) {
  try {
    const { id } = req.params;
    const count = await db('skills').where({ id, user_id: req.user.id }).del();
    if (!count) {
      return res.status(404).json({ error: 'Skill not found or unauthorized.' });
    }
    return res.json({ success: true, message: 'Skill deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill
};

