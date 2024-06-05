"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const teammates_1 = require("../controllers/teammates");
const protect_1 = require("../middleware/protect");
const router = express_1.default.Router();
router.get('/:id', protect_1.protect, teammates_1.getTeammate);
router.post('/', protect_1.protect, teammates_1.createTeammates);
exports.default = router;
//# sourceMappingURL=teammates.js.map