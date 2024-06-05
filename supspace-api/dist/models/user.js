"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const mongoose_1 = tslib_1.__importDefault(require("mongoose"));
const jsonwebtoken_1 = tslib_1.__importDefault(require("jsonwebtoken"));
const crypto_1 = tslib_1.__importDefault(require("crypto"));
const randomatic_1 = tslib_1.__importDefault(require("randomatic"));
const userSchema = new mongoose_1.default.Schema({
    username: {
        type: String,
        default() {
            return this.email.split('@')[0];
        },
    },
    email: {
        type: String,
        required: [true, 'Please enter your email'],
        unique: true,
        match: [/^\w+(\.\w+)?@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/, 'Please enter a valid email'],
    },
    googleId: String,
    isOnline: Boolean,
    role: String,
    phone: String,
    profilePicture: String,
    loginVerificationCode: String,
    loginVerificationCodeExpires: Date,
}, {
    timestamps: true,
    versionKey: false,
});
// Sign JWT and return
userSchema.methods.getSignedJwtToken = function () {
    return jsonwebtoken_1.default.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};
// Generate login verification code
userSchema.methods.getVerificationCode = function () {
    const verificationCode = (0, randomatic_1.default)('Aa0', 6);
    this.loginVerificationCode = crypto_1.default
        .createHash('sha256')
        .update(verificationCode)
        .digest('hex');
    this.loginVerificationCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    return verificationCode;
};
exports.default = mongoose_1.default.model('User', userSchema);
//# sourceMappingURL=user.js.map