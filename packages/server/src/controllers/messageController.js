import Message from "../models/Message.js";

// SEND MESSAGE
export const sendMessage = async (req, res) => {
  try {
    const { tradeId, text } = req.body;

    const message = await Message.create({
      tradeId,
      sender: req.user._id,
      text
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
