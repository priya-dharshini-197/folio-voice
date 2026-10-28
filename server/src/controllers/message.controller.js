const db = require('../config/db');

/**
 * Get all messages for authenticated freelancer
 * Strictly scoped: where({ user_id: req.user.id })
 */
async function getMessages(req, res, next) {
  try {
    const messages = await db('messages')
      .where({ user_id: req.user.id })
      .orderBy('created_at', 'desc');

    return res.json(messages.map(m => ({ ...m, is_read: Boolean(m.is_read) })));
  } catch (error) {
    next(error);
  }
}

/**
 * Mark message as read
 */
async function markMessageAsRead(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await db('messages').where({ id, user_id: req.user.id }).first();
    if (!existing) {
      return res.status(404).json({ error: 'Message not found or unauthorized.' });
    }

    await db('messages').where({ id, user_id: req.user.id }).update({ is_read: true });
    const updated = await db('messages').where({ id }).first();

    return res.json({ ...updated, is_read: Boolean(updated.is_read) });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete message
 */
async function deleteMessage(req, res, next) {
  try {
    const { id } = req.params;
    const count = await db('messages').where({ id, user_id: req.user.id }).del();
    if (!count) {
      return res.status(404).json({ error: 'Message not found or unauthorized.' });
    }

    return res.json({ success: true, message: 'Message deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMessages,
  markMessageAsRead,
  deleteMessage
};

