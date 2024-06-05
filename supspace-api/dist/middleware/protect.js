"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const tslib_1 = require("tslib");
const jsonwebtoken_1 = tslib_1.__importDefault(require("jsonwebtoken"));
const protect = (req, res, next) => {
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')) {
        // Set token from Bearer token in header
        token = req.headers.authorization.split(' ')[1];
    }
    // Make sure token exists
    if (!token) {
        return res.status(401).json({
            success: false,
            data: {
                name: 'Not authorized to access this route',
            },
        });
    }
    try {
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (err) {
        return res.status(401).json({
            success: false,
            data: {
                name: 'Not authorized to access this route',
            },
        });
    }
};
exports.protect = protect;
//# sourceMappingURL=protect.js.map