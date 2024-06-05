"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkspaces = exports.createOrganisation = exports.getOrganisation = void 0;
const tslib_1 = require("tslib");
const organisation_1 = tslib_1.__importDefault(require("../models/organisation"));
const successResponse_1 = tslib_1.__importDefault(require("../helpers/successResponse"));
const channel_1 = tslib_1.__importDefault(require("../models/channel"));
const conversation_1 = tslib_1.__importDefault(require("../models/conversation"));
// @desc    get organisation
// @route   GET /api/v1/organisation/:id
// @access  Private
function getOrganisation(req, res, next) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            const id = req.params.id;
            if (id) {
                let organisation = yield organisation_1.default.findById(id).populate([
                    'coWorkers',
                    'owner',
                ]);
                if (!organisation) {
                    res.status(400, {
                        name: 'no organisation found',
                    });
                }
                const channels = yield channel_1.default.find({
                    organisation: id,
                }).populate('collaborators');
                const conversations = yield conversation_1.default.find({
                    organisation: id,
                }).populate('collaborators');
                const conversationsWithCurrentUser = conversations.filter((conversation) => conversation.collaborators.some((collaborator) => collaborator._id.toString() === req.user.id));
                const updatedConversations = conversationsWithCurrentUser.map((convo) => {
                    var _a, _b;
                    // Find the index of the collaborator with the current user's ID
                    const currentUserIndex = convo.collaborators.findIndex((coworker) => coworker._id.toString() === req.user.id);
                    const collaborators = [...convo.collaborators];
                    // Remove the current user collaborator from the array
                    convo.collaborators.splice(currentUserIndex, 1);
                    // Create the name field based on the other collaborator's username
                    const name = ((_a = convo.collaborators[0]) === null || _a === void 0 ? void 0 : _a.username) || convo.name;
                    return Object.assign(Object.assign({}, convo.toObject()), { name, createdBy: (_b = convo.collaborators[0]) === null || _b === void 0 ? void 0 : _b._id, collaborators });
                });
                // Check if the authenticated user is a co-worker of the organisation
                const currentUserIsCoWorker = organisation.coWorkers.some((coworker) => coworker._id.toString() === req.user.id);
                // Replace the profile object with the corresponding co-worker's values
                let profile;
                if (currentUserIsCoWorker) {
                    const currentUser = organisation.coWorkers.find((coworker) => coworker._id.toString() === req.user.id);
                    profile = currentUser;
                }
                // Update the coWorkers array in the organisation object
                const updatedOrganisation = Object.assign(Object.assign({}, organisation.toObject()), { conversations: updatedConversations, channels,
                    profile });
                (0, successResponse_1.default)(res, updatedOrganisation);
            }
        }
        catch (error) {
            next(error);
        }
    });
}
exports.getOrganisation = getOrganisation;
// @desc    get organisation
// @route   POST /api/v1/organisation
// @access  Private
function createOrganisation(req, res, next) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            const { name, id } = req.body;
            if (!name && !id) {
                const organisation = yield organisation_1.default.create({
                    owner: req.user.id,
                    coWorkers: [req.user.id],
                });
                (0, successResponse_1.default)(res, organisation);
            }
            if (name && id) {
                const organisation = yield organisation_1.default.findOneAndUpdate({ _id: id }, { $set: { name } }, { new: true }).populate(['coWorkers', 'owner']);
                organisation.generateJoinLink();
                yield organisation.save();
                (0, successResponse_1.default)(res, organisation);
            }
        }
        catch (error) {
            next(error);
        }
    });
}
exports.createOrganisation = createOrganisation;
// @desc    get organisations associated with an email
// @route   POST /api/v1/organisation/workspaces
// @access  Private
function getWorkspaces(req, res, next) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            const id = req.user.id;
            // Find all organizations where the user is a co-worker
            const workspaces = yield organisation_1.default.find({ coWorkers: id });
            // Fetch channels for each organization
            const workspacesWithChannels = yield Promise.all(workspaces.map((workspace) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const channels = yield channel_1.default.find({ organisation: workspace._id });
                return Object.assign(Object.assign({}, workspace.toObject()), { channels });
            })));
            (0, successResponse_1.default)(res, workspacesWithChannels);
            // successResponse(res, workspaces);
        }
        catch (error) {
            next(error);
        }
    });
}
exports.getWorkspaces = getWorkspaces;
//# sourceMappingURL=organisation.js.map