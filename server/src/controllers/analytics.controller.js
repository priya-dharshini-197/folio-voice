const db = require('../config/db');

/**
 * Get Analytics for authenticated freelancer
 * Strictly real data - never simulated or faked.
 */
async function getAnalytics(req, res, next) {
  try {
    const userId = req.user.id;
    const { range = '7d' } = req.query; // '7d', '30d', 'all'

    // 1. Determine date filter
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    let startDate = null;
    let daysCount = 7;

    if (range === '30d') {
      daysCount = 30;
      const d = new Date();
      d.setDate(d.getDate() - 29);
      startDate = d.toISOString().slice(0, 10);
    } else if (range === '7d') {
      daysCount = 7;
      const d = new Date();
      d.setDate(d.getDate() - 6);
      startDate = d.toISOString().slice(0, 10);
    } // 'all' leaves startDate as null

    // 2. Query recorded views
    let viewsQuery = db('portfolio_views').where({ user_id: userId });
    if (startDate) {
      viewsQuery = viewsQuery.where('view_date', '>=', startDate);
    }

    const rawViews = await viewsQuery
      .select('view_date')
      .count('id as count')
      .groupBy('view_date')
      .orderBy('view_date', 'asc');

    const viewsMap = new Map();
    rawViews.forEach(row => {
      viewsMap.set(row.view_date, Number(row.count || 0));
    });

    // 3. Build continuous date timeline for chart
    const viewsOverTime = [];
    if (range === 'all') {
      rawViews.forEach(row => {
        viewsOverTime.push({
          date: row.view_date,
          views: Number(row.count || 0)
        });
      });
    } else {
      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        viewsOverTime.push({
          date: dateStr,
          views: viewsMap.get(dateStr) || 0
        });
      }
    }

    // 4. Lifetime totals
    const totalViewsResult = await db('portfolio_views')
      .where({ user_id: userId })
      .count('id as count')
      .first();
    const totalViews = Number(totalViewsResult?.count || 0);

    const viewsTodayResult = await db('portfolio_views')
      .where({ user_id: userId, view_date: todayStr })
      .count('id as count')
      .first();
    const viewsToday = Number(viewsTodayResult?.count || 0);

    // 5. Inventory counts
    const [
      totalProjects,
      publishedProjects,
      totalSkills,
      publishedCaseStudies,
      publishedTestimonials,
      totalMessages,
      unreadMessages
    ] = await Promise.all([
      db('projects').where({ user_id: userId }).count('id as count').first(),
      db('projects').where({ user_id: userId, is_published: true }).count('id as count').first(),
      db('skills').where({ user_id: userId }).count('id as count').first(),
      db('case_studies').where({ user_id: userId, is_published: true }).count('id as count').first(),
      db('testimonials').where({ user_id: userId, is_published: true }).count('id as count').first(),
      db('messages').where({ user_id: userId }).count('id as count').first(),
      db('messages').where({ user_id: userId, is_read: false }).count('id as count').first()
    ]);

    return res.json({
      total_views: totalViews,
      views_today: viewsToday,
      views_over_time: viewsOverTime,
      has_views: totalViews > 0,
      inventory: {
        projects: Number(totalProjects?.count || 0),
        published_projects: Number(publishedProjects?.count || 0),
        skills: Number(totalSkills?.count || 0),
        case_studies: Number(publishedCaseStudies?.count || 0),
        testimonials: Number(publishedTestimonials?.count || 0),
        messages: Number(totalMessages?.count || 0),
        unread_messages: Number(unreadMessages?.count || 0)
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get recent activity for authenticated freelancer
 * Strictly scoped to req.user.id
 */
async function getRecentActivity(req, res, next) {
  try {
    const userId = req.user.id;
    const [recentProjects, recentMessages] = await Promise.all([
      db('projects')
        .where({ user_id: userId })
        .orderBy('created_at', 'desc')
        .limit(3)
        .select('id', 'title', 'category', 'is_published', 'created_at'),
      db('messages')
        .where({ user_id: userId })
        .orderBy('created_at', 'desc')
        .limit(3)
        .select('id', 'sender_name', 'sender_email', 'is_read', 'created_at')
    ]);

    return res.json({
      recent_projects: recentProjects,
      recent_messages: recentMessages,
      summary: `You have ${recentProjects.length} recent project${recentProjects.length === 1 ? '' : 's'} and ${recentMessages.length} client inquir${recentMessages.length === 1 ? 'y' : 'ies'}.`
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAnalytics,
  getRecentActivity
};

