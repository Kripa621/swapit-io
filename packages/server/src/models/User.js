import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    creditBalance: {
      type: Number,
      default: 0
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },
    // NEW FIELDS
    bio: {
      type: String,
      default: "Forest explorer trading treasures.",
      maxLength: 150
    },
    avatar: {
      type: String,
      default: "" // We will handle default avatars on frontend if empty
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;