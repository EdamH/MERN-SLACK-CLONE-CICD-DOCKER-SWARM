"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const mongoose_1 = tslib_1.__importDefault(require("mongoose"));
const channelSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your channel name'],
    },
    collaborators: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
    title: {
        type: String,
        default() {
            return `This is the very first begining of the ${this.name} channel`;
        },
    },
    description: {
        type: String,
    },
    organisation: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Organisation',
    },
    hasNotOpen: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
    isChannel: {
        type: Boolean,
        default: true,
    },
    // conversations: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Message",
    //   },
    // ],
}, {
    timestamps: true,
    versionKey: false,
});
exports.default = mongoose_1.default.model('Channel', channelSchema);
//# sourceMappingURL=channel.js.map