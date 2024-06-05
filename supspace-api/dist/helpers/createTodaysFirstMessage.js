"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const message_1 = tslib_1.__importDefault(require("../models/message"));
function formatDate(date) {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', options);
    return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1); // Capitalize the first letter
}
function createTodaysFirstMessage({ channelId, conversationId, organisation, }) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            // Check if there are any messages for today in the channel
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            let existingMessages;
            if (channelId) {
                existingMessages = yield message_1.default.find({
                    channel: channelId,
                    createdAt: { $gte: today },
                });
            }
            else if (conversationId) {
                existingMessages = yield message_1.default.find({
                    conversation: conversationId,
                    createdAt: { $gte: today },
                });
            }
            if (existingMessages.length === 0) {
                yield message_1.default.create(Object.assign(Object.assign({ organisation, content: formatDate(today) }, (channelId
                    ? { channel: channelId }
                    : { conversation: conversationId })), { hasRead: false, type: 'date' }));
            }
        }
        catch (error) { }
    });
}
exports.default = createTodaysFirstMessage;
//# sourceMappingURL=createTodaysFirstMessage.js.map