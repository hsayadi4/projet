const authAdmin = (req, res, next) => {
    if (!req.session.user || !req.session.user.isAdmin) {
        return res.status(403).json({ message: "Accès non autorisé" });
    }
    next();
};

module.exports = authAdmin;