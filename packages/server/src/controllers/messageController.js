import Message from "../models/Message.js";

// SEND MESSAGE
export const sendMessage = async (req, res) => {
  try {
    const { tradeId, text } = req.body;

    // ADD REGEX FILTERS
    const phoneRegex = /\b\d{10}\b/g; // Matches exact 10 digit numbers
    const upiRegex = /[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}/g; // Matches standard UPI ID formats
    const keywordRegex = /\b(gpay|phonepe|paytm|upi)\b/gi; // Case-insensitive keyword catch

    // SANITIZE THE TEXT
    let sanitizedText = text
      .replace(phoneRegex, "[PHONE BLOCKED]")
      .replace(upiRegex, "[UPI BLOCKED]")
      .replace(keywordRegex, "[PAYMENT KEYWORD BLOCKED]");

    const message = await Message.create({
      tradeId,
      sender: req.user._id,
      text: sanitizedText // SAVE THE SANITIZED VERSION
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET MESSAGES FOR A TRADE
export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      tradeId: req.params.tradeId
    })
      .populate("sender", "username email")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
