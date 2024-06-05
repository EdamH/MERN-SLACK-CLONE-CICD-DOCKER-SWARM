"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const mongoose_1 = tslib_1.__importDefault(require("mongoose"));
const messageSchema = new mongoose_1.default.Schema({
    sender: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
    },
    content: String,
    channel: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Channel',
    },
    organisation: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Organisation',
    },
    conversation: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Conversation',
    },
    collaborators: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
    reactions: [
        {
            emoji: String,
            reactedToBy: [
                {
                    type: mongoose_1.default.Schema.Types.ObjectId,
                    ref: 'User',
                },
            ],
        },
    ],
    threadReplies: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
    threadRepliesCount: Number,
    threadLastReplyDate: Date,
    isBookmarked: {
        type: Boolean,
        default: false,
    },
    isSelf: {
        type: Boolean,
        default: false,
    },
    hasRead: {
        type: Boolean,
        default: false,
    },
    type: String,
}, {
    timestamps: true,
    versionKey: false,
});
exports.default = mongoose_1.default.model('Message', messageSchema);
//# sourceMappingURL=message.js.map