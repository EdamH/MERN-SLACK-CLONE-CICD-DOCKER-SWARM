"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessage = exports.getMessages = void 0;
const tslib_1 = require("tslib");
const message_1 = tslib_1.__importDefault(require("../models/message"));
const successResponse_1 = tslib_1.__importDefault(require("../helpers/successResponse"));
// @desc    get messages
// @route   POST /api/v1/message
// @access  Private
function getMessages(req, res, next) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            const channelId = req.query.channelId;
            const conversationId = req.query.conversation;
            const isSelf = req.query.isSelf;
            const organisation = req.query.organisation;
            if (channelId) {
                const channel = yield message_1.default.find({
                    channel: channelId,
                    organisation,
                }).populate(['sender', 'reactions.reactedToBy', 'threadReplies']);
                (0, successResponse_1.default)(res, channel);
            }
            else if (conversationId) {
                let conversation;
                if (isSelf) {
                    conversation = yield message_1.default.find({
                        organisation,
                        conversation: conversationId,
                        isSelf,
                    }).populate(['sender', 'reactions.reactedToBy', 'threadReplies']);
                }
                else {
                    conversation = yield message_1.default.find({
                        organisation,
                        conversation: conversationId,
                    }).populate(['sender', 'reactions.reactedToBy', 'threadReplies']);
                }
                (0, successResponse_1.default)(res, conversation);
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
exports.getMessages = getMessages;
// @desc    get message
// @route   POST /api/v1/message
// @access  Private
function getMessage(req, res, next) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            const id = req.params.id;
            if (id) {
                const message = yield message_1.default.findById(id).populate([
                    'sender',
                    'threadReplies',
                    'reactions.reactedToBy',
                ]);
                (0, successResponse_1.default)(res, message);
            }
            else {
                res.status(400).json({
                    name: 'message not found',
                });
            }
        }
        catch (error) {
            next(error);
        }
    });
}
exports.getMessage = getMessage;
//# sourceMappingURL=message.js.map