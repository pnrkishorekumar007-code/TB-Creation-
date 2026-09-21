const { serverError } = require('../utils/httpError');
const ContactMessage = require('../models/ContactMessage');

const sendMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required' });
    }
    const saved = await ContactMessage.create({ name, email, message });
    res.status(201).json({ message: 'Message received', id: saved._id });
  } catch (err) {
    serverError(res, err);
  }
};

module.exports = { sendMessage };
