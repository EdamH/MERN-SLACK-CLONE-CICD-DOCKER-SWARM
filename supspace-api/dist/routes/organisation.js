"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const protect_1 = require("../middleware/protect");
const organisation_1 = require("../controllers/organisation");
const router = express_1.default.Router();
router.get('/workspaces', protect_1.protect, organisation_1.getWorkspaces);
router.get('/:id', protect_1.protect, organisation_1.getOrganisation);
router.post('/', protect_1.protect, organisation_1.createOrganisation);
exports.default = router;
//# sourceMappingURL=organisation.js.map