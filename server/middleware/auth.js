import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET;

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, secret);
    req.userId = decoded?.id;
    next();
  } catch (error) {
    res.status(500).json({ message: "Something went wrong with the auth middleware." });
  }
};

export default auth;
