const adminAuth = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'instructor') {
    return res.status(403).json({ message: 'Access denied. Admin or instructor role required.' });
  }
  next();
};

module.exports = adminAuth;