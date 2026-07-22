const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const oldCode = `const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: "Too many authentication attempts, please try again later",
  validate: { trustProxy: false, xForwardedForHeader: false },
  keyGenerator: (req) => {
    // If running behind a proxy like in AI Studio, prefer x-forwarded-for
    const xForwardedFor = req.headers['x-forwarded-for'];
    if (xForwardedFor) {
      if (Array.isArray(xForwardedFor)) return xForwardedFor[0];
      return xForwardedFor.split(',')[0];
    }
    return req.ip || "unknown_ip";
  }
});`;

const newCode = `const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: "Too many authentication attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});`;

content = content.replace(oldCode, newCode);
fs.writeFileSync('server.ts', content);
