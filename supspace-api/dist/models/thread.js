"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const mongoose_1 = tslib_1.__importDefault(require("mongoose"));
const threadSchema = new mongoose_1.default.Schema({
    sender: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
    },
    content: String,
    message: mongoose_1.default.Schema.Types.ObjectId,
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
    isBookmarked: {
        type: Boolean,
        default: false,
    },
    hasRead: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
    versionKey: false,
});
exports.default = mongoose_1.default.model('Thread', threadSchema);
//# sourceMappingURL=thread.js.map