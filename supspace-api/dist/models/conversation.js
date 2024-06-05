"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const mongoose_1 = tslib_1.__importDefault(require("mongoose"));
const conversationSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        default() {
            if (this.createdBy) {
                return this.createdBy.username;
            }
            return '';
        },
    },
    collaborators: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
    description: {
        type: String,
        default() {
            return `This conversation is just between ${this.name} and you`;
        },
    },
    isSelf: {
        type: Boolean,
        default: false,
    },
    isConversation: {
        type: Boolean,
        default: true,
    },
    organisation: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Organisation',
    },
    createdBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
    },
    isOnline: {
        type: Boolean,
        default: false,
    },
    hasNotOpen: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
}, {
    timestamps: true,
    versionKey: false,
});
// Define a compound index on the collaborators field
conversationSchema.index({ collaborators: 1 });
exports.default = mongoose_1.default.model('Conversation', conversationSchema);
//# sourceMappingURL=conversation.js.map