"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const auth_1 = require("../controllers/auth");
const passport_1 = tslib_1.__importDefault(require("passport"));
const router = express_1.default.Router();
router.post('/register', auth_1.register);
router.post('/signin', auth_1.signin);
router.post('/verify', auth_1.verify);
router.get('/google', passport_1.default.authenticate('google', ['profile', 'email']));
router.get('/google/callback', auth_1.googleCallback);
exports.default = router;
//# sourceMappingURL=auth.js.map