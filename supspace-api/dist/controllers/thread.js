"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getThreads = void 0;
const tslib_1 = require("tslib");
const thread_1 = tslib_1.__importDefault(require("../models/thread"));
const successResponse_1 = tslib_1.__importDefault(require("../helpers/successResponse"));
// @desc    get threads
// @route   POST /api/v1/threads
// @access  Private
function getThreads(req, res, next) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            const messageId = req.query.message;
            if (messageId) {
                const threads = yield thread_1.default.find({
                    message: messageId,
                })
                    .populate('sender')
                    .populate('reactions.reactedToBy');
                (0, successResponse_1.default)(res, threads);
            }
            else {
                res.status(400).json({});
            }
        }
        catch (error) {
            next(error);
        }
    });
}
exports.getThreads = getThreads;
//# sourceMappingURL=thread.js.map