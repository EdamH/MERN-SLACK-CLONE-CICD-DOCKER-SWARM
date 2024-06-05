"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const protect_1 = require("../middleware/protect");
const thread_1 = require("../controllers/thread");
const router = express_1.default.Router();
router.get('/', protect_1.protect, thread_1.getThreads);
exports.default = router;
//# sourceMappingURL=thread.js.map