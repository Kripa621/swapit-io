import Item from "../models/Item.js";
import { getEstimatedValue } from "../services/valuationService.js";

// CREATE ITEM
export const createItem = async (req, res) => {
  try {
    const { title, description, category, condition } = req.body;

    // Cloudinary image URLs
    const images = req.files?.map(file => file.path) || [];

    const estimatedValue = getEstimatedValue(category, condition);

    const item = await Item.create({
      ownerId: req.user._id,
      title,
      description,
      category,
      condition,
      estimatedValue,
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
    let query = { status: "available" }; // Only show available items

    // Don't show my own items in the marketplace if logged in
    if (req.user) {
        query.ownerId = { $ne: req.user._id };
    }

    if (category) {
      query.category = category;
    }

    if (search) {
      query.title = { $regex: search, $options: "i" }; // Case insensitive search
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