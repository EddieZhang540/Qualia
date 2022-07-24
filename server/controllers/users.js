import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import UserStat from "../models/userStat.js";

const secret = process.env.JWT_SECRET;

export const signUp = async (req, res) => {
  const userData = req.body;
  try {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) return res.status(400).json({ message: "Account already exists" });
    const encryptedPassword = await bcrypt.hash(userData.password, 12);
    const newUser = await User.create({ userName: userData.userName, email: userData.email, password: encryptedPassword });
    const token = jwt.sign({ email: newUser.email, id: newUser._id }, secret, { expiresIn: "5d" });
    res.status(200).json({ userInfo: newUser, token });
    await UserStat.create({ user_id: newUser._id });
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  }
};

export const logIn = async (req, res) => {
  const userData = req.body;
  try {
    const existingUser = await User.findOne({ email: userData.email });
    if (!existingUser) return res.status(404).json({ message: "Account does not exist" });
    const validPassword = await bcrypt.compare(userData.password, existingUser.password);
    if (!validPassword) return res.status(401).json({ message: "Invalid password" });
    const token = jwt.sign({ email: existingUser.email, id: existingUser._id }, secret, { expiresIn: "5d" });
    res.status(200).json({ userInfo: existingUser, token });
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  }
};
