const errorMessages = {
    inconsistancy: 'One or more of your selected tours cannot accomodate the number of guests you have selected'
};

module.exports = function(req, res, next) {
    const cart = req.session.cart;
    if (!cart) { return next(); } // The same as: next(); return;
    if (cart.some(item => item.guests > item.product.maximumGuests)) {
        if (!cart.errors) { cart.errors = []; }
        cart.errors.push(errorMessages.inconsistancy);
    }
    next();
};