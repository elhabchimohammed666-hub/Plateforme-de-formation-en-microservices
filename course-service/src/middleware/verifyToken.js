import jwt from "jsonwebtoken";

export default function verifyToken(req, res, next) {
  const authorization = req.get("Authorization");
  const match = authorization?.match(/^Bearer\s+(\S+)$/i);

  if (!match) {
    return res.status(401).json({ message: "Token d'authentification manquant ou invalide." });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ message: "La variable JWT_SECRET n'est pas configurée." });
  }

  try {
    const user = jwt.verify(match[1], secret);
    if (typeof user === "string") {
      return res.status(401).json({ message: "Token d'authentification invalide." });
    }
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ message: "Token d'authentification invalide ou expiré." });
  }
}
