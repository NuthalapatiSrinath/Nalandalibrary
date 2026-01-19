const jwt = require("jsonwebtoken");
const { decrypt } = require("../utils/encryption");

// 1. BLOCKING Middleware (For REST API)
// Returns 401 if not logged in
exports.protect = (req, res, next) => {
  let token = req.headers.authorization;
  if (!token || !token.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized" });
  }
  try {
    token = token.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const decryptedString = decrypt(decoded.data);
    req.user = JSON.parse(decryptedString); // Attach to req.user
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token failed" });
  }
};

// 2. NON-BLOCKING Middleware (For GraphQL)
// Sets req.isAuth = false if failed, but lets request continue
exports.graphqlAuth = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    req.isAuth = false;
    return next();
  }
  const token = authHeader.split(" ")[1];
  if (!token || token === "") {
    req.isAuth = false;
    return next();
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const decryptedString = decrypt(decoded.data);
    const userData = JSON.parse(decryptedString);

    req.isAuth = true;
    req.userId = userData.userId;
    req.userRole = userData.role;
    next();
  } catch (err) {
    req.isAuth = false;
    next();
  }
};

// 3. Role Checker
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};
