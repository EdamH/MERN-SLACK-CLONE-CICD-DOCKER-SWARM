"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const conversations_1 = require("../controllers/conversations");
const protect_1 = require("../middleware/protect");
const router = express_1.default.Router();
router.get('/', protect_1.protect, conversations_1.getConversations);
router.get('/:id', protect_1.protect, conversations_1.getConversation);
exports.default = router;
//# sourceMappingURL=conversations.js.map