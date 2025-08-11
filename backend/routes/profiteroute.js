import express from "express";
import User from "../models/user.js";

const profilerouter = express.Router();

profilerouter.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id); // or use email/token
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});
profilerouter.put('/:id', async (req, res) => {
  const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updatedUser);
});

export default profilerouter;