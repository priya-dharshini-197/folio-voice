const db = require('../config/db');

/**
 * Calculate profile completeness based on explicit criteria
 */
async function calculateCompleteness(profile, userId) {
  const checklist = [
    { key: 'full_name', label: 'Full name provided', points: 15, done: !!profile.full_name?.trim() },
    { key: 'headline', label: 'Professional headline added', points: 15, done: !!profile.headline?.trim() },
    { key: 'bio', label: 'Biography written', points: 20, done: !!profile.bio?.trim() },
    { key: 'avatar', label: 'Avatar or profile photo uploaded/linked', points: 15, done: !!profile.avatar_url?.trim() },
    {
      key: 'contact',
      label: 'Location or contact email provided',
      points: 10,
      done: !!(profile.location?.trim() || profile.contact_email?.trim())
    },
    {
      key: 'links',
      label: 'Professional link (GitHub, LinkedIn, Website, Resume)',
      points: 15,
      done: !!(profile.github_url?.trim() || profile.linkedin_url?.trim() || profile.website_url?.trim() || profile.resume_url?.trim())
    }
  ];

  // Also check if user has created at least one project
  const projectCount = await db('projects').where({ user_id: userId }).count('id as count').first();
  const hasProjects = Number(projectCount?.count || 0) > 0;
  checklist.push({
    key: 'projects',
    label: 'At least one project added',
    points: 10,
    done: hasProjects
  });

  const totalPoints = checklist.reduce((sum, item) => sum + item.points, 0); // 100
  const earnedPoints = checklist.filter(item => item.done).reduce((sum, item) => sum + item.points, 0);
  const percentage = Math.round((earnedPoints / totalPoints) * 100);

  return {
    percentage,
    checklist,
    isComplete: percentage === 100
  };
}

/**
 * Get profile for authenticated user
 */
async function getProfile(req, res, next) {
  try {
    const profile = await db('profiles').where({ user_id: req.user.id }).first();
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found.' });
    }

    const completeness = await calculateCompleteness(profile, req.user.id);

    return res.json({
      profile,
      completeness
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update profile for authenticated user
 */
async function updateProfile(req, res, next) {
  try {
    const {
      full_name,
      headline,
      bio,
      avatar_url,
      location,
      contact_email,
      github_url,
      linkedin_url,
      website_url,
      resume_url
    } = req.body;

    if (full_name !== undefined && !full_name.trim()) {
      return res.status(400).json({ error: 'Full name cannot be empty.' });
    }

    const updates = {
      updated_at: db.fn.now()
    };

    if (full_name !== undefined) updates.full_name = full_name.trim();
    if (headline !== undefined) updates.headline = headline?.trim() || null;
    if (bio !== undefined) updates.bio = bio?.trim() || null;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url?.trim() || null;
    if (location !== undefined) updates.location = location?.trim() || null;
    if (contact_email !== undefined) updates.contact_email = contact_email?.trim() || null;
    if (github_url !== undefined) updates.github_url = github_url?.trim() || null;
    if (linkedin_url !== undefined) updates.linkedin_url = linkedin_url?.trim() || null;
    if (website_url !== undefined) updates.website_url = website_url?.trim() || null;
    if (resume_url !== undefined) updates.resume_url = resume_url?.trim() || null;

    await db('profiles').where({ user_id: req.user.id }).update(updates);

    const updatedProfile = await db('profiles').where({ user_id: req.user.id }).first();
    const completeness = await calculateCompleteness(updatedProfile, req.user.id);

    return res.json({
      message: 'Profile updated successfully!',
      profile: updatedProfile,
      completeness
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProfile,
  updateProfile
};
