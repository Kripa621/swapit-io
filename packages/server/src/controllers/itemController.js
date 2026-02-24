import Item from "../models/Item.js";

export const createItem = async (req, res) => {
  try {
    // Note: receiptImage is removed from req.body because it's a file now!
    const { title, description, category, condition, manualPrice } = req.body;

    // UPDATE: Extract file paths from the req.files object
    const images = req.files?.images?.map(file => file.path) || [];
    const receiptImage = req.files?.receiptImage?.[0]?.path || null;

    if (!receiptImage) {
      return res.status(400).json({ message: "Receipt image is required for admin verification." });
    }

    const item = await Item.create({
      ownerId: req.user._id,
      title,
      description,
      category,
      condition,
      manualPrice, 
      receiptImage, // Saving the Cloudinary URL here
      images
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL ITEMS (Marketplace Feed)
export const getItems = async (req, res) => {
  try {
    const { category, search } = req.query;
    
    // UPDATE THIS LINE: Add approvalStatus: "approved"
    let query = { status: "available", approvalStatus: "approved" }; 

    if (req.user) {
        query.ownerId = { $ne: req.user._id };
    }

    if (category) {
      query.category = category;
    }

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const items = await Item.find(query).populate("ownerId", "username");
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET SINGLE ITEM
export const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate("ownerId", "username");
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET MY ITEMS (Dashboard)
export const getMyItems = async (req, res) => {
  try {
    const items = await Item.find({ ownerId: req.user._id });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};