const db = require('../config/db');

/**
 * Get all testimonials for authenticated user
 */
async function getTestimonials(req, res, next) {
  try {
    const testimonials = await db('testimonials')
      .where({ user_id: req.user.id })
      .orderBy('created_at', 'desc');

    return res.json(testimonials.map(t => ({ ...t, is_published: Boolean(t.is_published) })));
  } catch (error) {
    next(error);
  }
}

/**
 * Create testimonial
 */
async function createTestimonial(req, res, next) {
  try {
    const {
      client_name,
      client_role,
      client_company,
      testimonial,
      rating,
      date,
      source_type,
      related_project_id,
      is_published
    } = req.body;

    if (!client_name || !client_name.trim()) {
      return res.status(400).json({ error: 'Client name is required.' });
    }
    if (!testimonial || !testimonial.trim()) {
      return res.status(400).json({ error: 'Testimonial text is required.' });
    }

    const validRating = rating !== undefined && rating !== null
      ? Math.max(1, Math.min(5, parseInt(rating, 10) || 5))
      : null;

    const [insertedId] = await db('testimonials').insert({
      user_id: req.user.id,
      client_name: client_name.trim(),
      client_role: client_role?.trim() || null,
      client_company: client_company?.trim() || null,
      testimonial: testimonial.trim(),
      rating: validRating,
      date: date?.trim() || null,
      source_type: source_type?.trim() || 'self_entered',
      related_project_id: related_project_id || null,
      is_published: Boolean(is_published)
    });

    const actualId = typeof insertedId === 'object' ? insertedId.id : insertedId;
    const created = await db('testimonials').where({ id: actualId }).first();

    return res.status(201).json({ ...created, is_published: Boolean(created.is_published) });
  } catch (error) {
    next(error);
  }
}

/**
 * Update testimonial
 */
async function updateTestimonial(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await db('testimonials').where({ id, user_id: req.user.id }).first();
    if (!existing) {
      return res.status(404).json({ error: 'Testimonial not found or unauthorized.' });
    }

    const {
      client_name,
      client_role,
      client_company,
      testimonial,
      rating,
      date,
      source_type,
      related_project_id,
      is_published
    } = req.body;

    const updates = { updated_at: db.fn.now() };

    if (client_name !== undefined) {
      if (!client_name.trim()) return res.status(400).json({ error: 'Client name cannot be empty.' });
      updates.client_name = client_name.trim();
    }
    if (client_role !== undefined) updates.client_role = client_role?.trim() || null;
    if (client_company !== undefined) updates.client_company = client_company?.trim() || null;
    if (testimonial !== undefined) {
      if (!testimonial.trim()) return res.status(400).json({ error: 'Testimonial text cannot be empty.' });
      updates.testimonial = testimonial.trim();
    }
    if (rating !== undefined) {
      updates.rating = rating !== null
        ? Math.max(1, Math.min(5, parseInt(rating, 10) || 5))
        : null;
    }
    if (date !== undefined) updates.date = date?.trim() || null;
    if (source_type !== undefined) updates.source_type = source_type?.trim() || 'self_entered';
    if (related_project_id !== undefined) updates.related_project_id = related_project_id || null;
    if (is_published !== undefined) updates.is_published = Boolean(is_published);

    await db('testimonials').where({ id, user_id: req.user.id }).update(updates);
    const updated = await db('testimonials').where({ id }).first();

    return res.json({ ...updated, is_published: Boolean(updated.is_published) });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete testimonial
 */
async function deleteTestimonial(req, res, next) {
  try {
    const { id } = req.params;
    const count = await db('testimonials').where({ id, user_id: req.user.id }).del();
    if (!count) {
      return res.status(404).json({ error: 'Testimonial not found or unauthorized.' });
    }
    return res.json({ success: true, message: 'Testimonial deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

/**
 * Toggle publish testimonial
 */
async function togglePublishTestimonial(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await db('testimonials').where({ id, user_id: req.user.id }).first();
    if (!existing) {
      return res.status(404).json({ error: 'Testimonial not found or unauthorized.' });
    }

    const nextState = !existing.is_published;
    await db('testimonials').where({ id }).update({
      is_published: nextState,
      updated_at: db.fn.now()
    });

    const updated = await db('testimonials').where({ id }).first();
    return res.json({ ...updated, is_published: Boolean(updated.is_published) });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  togglePublishTestimonial
};
