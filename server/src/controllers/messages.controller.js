import { createMessage, getMessages, markAsRead } from '../services/message.service.js';

export const sendMessage = async (req, res) => {
  const message = await createMessage({
    userId: req.user.userId,
    username: req.user.username,
    content: req.body?.content,
  });
  res.status(201).json({ success: true, message });
};

export const fetchMessages = async (req, res) => {
  const messages = await getMessages({ limit: req.query.limit });
  res.json({ success: true, messages });
};

export const readMessage = async (req, res) => {
  await markAsRead(req.params.id);
  res.json({ success: true });
};
