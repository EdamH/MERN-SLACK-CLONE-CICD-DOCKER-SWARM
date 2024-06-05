"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const channel_1 = require("../controllers/channel");
const protect_1 = require("../middleware/protect");
const router = express_1.default.Router();
router.post('/', protect_1.protect, channel_1.createChannel);
router.get('/:id', protect_1.protect, channel_1.getChannel);
router.post('/:id', protect_1.protect, channel_1.updateChannel);
exports.default = router;
//# sourceMappingURL=channel.js.map