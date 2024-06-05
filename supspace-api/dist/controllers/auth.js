"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleCallback = exports.verify = exports.signin = exports.register = void 0;
const tslib_1 = require("tslib");
const user_1 = tslib_1.__importDefault(require("../models/user"));
const sendEmail_1 = tslib_1.__importDefault(require("../helpers/sendEmail"));
const crypto_1 = tslib_1.__importDefault(require("crypto"));
const confirmation_code_email_1 = require("../html/confirmation-code-email");
const passport_1 = tslib_1.__importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
// Configure Google OAuth strategy
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.API_URL}/auth/google/callback`,
    scope: ['profile', 'email'],
}, (accessToken, refreshToken, profile, done) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find or create a user based on the Google profile information
        let user = yield user_1.default.findOne({ googleId: profile.id });
        if (!user) {
            user = new user_1.default({
                googleId: profile.id,
                username: profile.displayName,
                email: profile.emails[0].value,
            });
            yield user.save();
        }
        return done(null, user);
    }
    catch (error) {
        return done(error, false);
    }
})));
passport_1.default.serializeUser((user, done) => {
    done(null, user);
});
passport_1.default.deserializeUser((user, done) => {
    done(null, user);
});
// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
const register = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { username, email } = req.body;
    if (!email) {
        return res.status(400).json({
            success: false,
            data: {
                name: 'Please provide your email address',
            },
        });
    }
    const emailExist = yield user_1.default.findOne({ email });
    if (emailExist) {
        return res.status(400).json({
            success: false,
            data: {
                name: 'User already exists',
            },
        });
    }
    const user = yield user_1.default.create({
        username,
        email,
    });
    try {
        const verificationToken = user.getVerificationCode();
        yield user.save();
        (0, sendEmail_1.default)(email, 'Slack confirmation code', (0, confirmation_code_email_1.verificationHtml)(verificationToken));
        res.status(201).json({
            success: true,
            data: {
                name: 'Verification token sent to email',
            },
        });
    }
    catch (err) {
        user.loginVerificationCode = undefined;
        user.loginVerificationCodeExpires = undefined;
        yield user.save({ validateBeforeSave: false });
        next(err);
    }
});
exports.register = register;
// @desc    Signin user
// @route   POST /api/v1/auth/signin
// @access  Public
const signin = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({
            success: false,
            data: {
                name: 'Please provide your email address',
            },
        });
    }
    const user = yield user_1.default.findOne({ email });
    if (!user) {
        return res.status(400).json({
            success: false,
            data: {
                name: "User doesn't exist",
            },
        });
    }
    try {
        const verificationToken = user.getVerificationCode();
        yield user.save();
        (0, sendEmail_1.default)(email, 'Slack confirmation code', (0, confirmation_code_email_1.verificationHtml)(verificationToken));
        res.status(201).json({
            success: true,
            data: {
                name: 'Verification token sent to email',
            },
        });
    }
    catch (err) {
        user.loginVerificationCode = undefined;
        user.loginVerificationCodeExpires = undefined;
        yield user.save({ validateBeforeSave: false });
        next(err);
    }
});
exports.signin = signin;
// @desc    Verify user
// @route   POST /api/v1/auth/verify
// @access  Public
const verify = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.body.loginVerificationCode) {
            return res.status(400).json({
                success: false,
                data: {
                    name: 'Please provide verification token',
                },
            });
        }
        // Get hashed token
        const loginVerificationCode = crypto_1.default
            .createHash('sha256')
            .update(req.body.loginVerificationCode)
            .digest('hex');
        const user = yield user_1.default.findOne({
            loginVerificationCode,
            loginVerificationCodeExpires: { $gt: Date.now() },
        });
        if (!user) {
            return res.status(400).json({
                success: false,
                data: {
                    name: 'Invalid verification token',
                },
            });
        }
        res.status(200).json({
            success: true,
            data: {
                username: user.username,
                email: user.email,
                token: user.getSignedJwtToken(),
            },
        });
        user.loginVerificationCode = undefined;
        user.loginVerificationCodeExpires = undefined;
        yield user.save({ validateBeforeSave: false });
    }
    catch (err) {
        next(err);
    }
});
exports.verify = verify;
// @desc    Google OAuth Callback
// @route   GET /auth/google/callback
// @access  Public
const googleCallback = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    passport_1.default.authenticate('google', (err, user) => {
        if (err) {
            // Handle error
            return next(err);
        }
        if (!user) {
            // Handle user not found
            return res.status(401).json({ message: 'Authentication failed' });
        }
        const token = user.getSignedJwtToken();
        res.redirect(`${process.env.CLIENT_URL}?token=${token}&email=${user.email}&username=${user.username}`);
    })(req, res, next);
});
exports.googleCallback = googleCallback;
//# sourceMappingURL=auth.js.map