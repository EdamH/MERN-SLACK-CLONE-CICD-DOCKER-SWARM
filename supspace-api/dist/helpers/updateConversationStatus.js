"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const conversation_1 = tslib_1.__importDefault(require("../models/conversation"));
const user_1 = tslib_1.__importDefault(require("../models/user"));
function updateUserStatus(id, isOnline) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            // Update the user's "isOnline" field
            const updatedUser = yield user_1.default.findByIdAndUpdate(id, { isOnline }, { new: true });
            return updatedUser;
        }
        catch (error) {
            console.error('Error updating user status:', error);
            throw error;
        }
    });
}
function updateConversationStatus(id, isOnline) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            yield updateUserStatus(id, isOnline);
            // Find all conversations where the user is part of the collaborators
            const conversations = yield conversation_1.default.find({
                collaborators: { $in: id },
            }).populate('collaborators');
            // Check if all collaborators in each conversation are online
            for (const conversation of conversations) {
                let allCollaboratorsOnline = true;
                for (const collaborator of conversation.collaborators) {
                    const user = yield user_1.default.findById(collaborator._id);
                    if (!(user && user.isOnline)) {
                        allCollaboratorsOnline = false;
                        break; // No need to check further if one is offline
                    }
                }
                if (allCollaboratorsOnline) {
                    // Update the Conversation model's "isOnline" field to true
                    yield conversation_1.default.findByIdAndUpdate(conversation._id, { isOnline: true }, { new: true });
                }
                else {
                    yield conversation_1.default.findByIdAndUpdate(conversation._id, { isOnline: false }, { new: true });
                }
            }
        }
        catch (error) {
            // Handle any errors here
            console.error('Error updating conversation status:', error);
            throw error;
        }
    });
}
exports.default = updateConversationStatus;
//# sourceMappingURL=updateConversationStatus.js.map