module.exports = function(req, res, next) {
    const cart = req.session.cart;
    if (!cart) {
        return next(); // The same as: next(); return;
    }
    if (cart.some(item => item.product.requiresWaiver)) {
        if (!cart.warnings) { cart.warnings = []; }
        cart.warnings.push('One or more of your selected tours requires a waiver');
    }
    next();
};