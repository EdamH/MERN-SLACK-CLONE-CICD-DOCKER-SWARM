"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTeammate = exports.createTeammates = void 0;
const tslib_1 = require("tslib");
const organisation_1 = tslib_1.__importDefault(require("../models/organisation"));
const conversation_1 = tslib_1.__importDefault(require("../models/conversation"));
const successResponse_1 = tslib_1.__importDefault(require("../helpers/successResponse"));
const channel_1 = tslib_1.__importDefault(require("../models/channel"));
const user_1 = tslib_1.__importDefault(require("../models/user"));
const sendEmail_1 = tslib_1.__importDefault(require("../helpers/sendEmail"));
const join_teammates_email_1 = require("../html/join-teammates-email");
// @desc    add teammates to either organisation or a channel
// @route   POST /api/v1/teammates
// @access  Private
function createTeammates(req, res, next) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            const { emails, channelId, organisationId, userIds } = req.body;
            const channelExist = yield channel_1.default.findById(channelId);
            let organisation;
            const invitedBy = yield user_1.default.findById(req.user.id);
            // add existed teammates to channel
            if ((userIds === null || userIds === void 0 ? void 0 : userIds.length) > 0 && channelExist) {
                let channel;
                for (const id of userIds) {
                    try {
                        channel = yield channel_1.default.findOneAndUpdate({ _id: channelId }, { $addToSet: { collaborators: id } }, { new: true }).populate('collaborators');
                        const user = yield user_1.default.findById(id);
                        (0, sendEmail_1.default)(user.email, `${invitedBy.email} has invited you to work with them in Slack`, (0, join_teammates_email_1.joinTeammatesEmail)(invitedBy.username, invitedBy.email, organisation.name, req.user.id, organisation.joinLink, organisation.url));
                    }
                    catch (error) {
                        next(error);
                    }
                }
                (0, successResponse_1.default)(res, channel);
            }
            else if (channelId && channelExist) {
                // add new teammates to channel
                let channel;
                for (const email of emails) {
                    try {
                        const newUser = yield user_1.default.create({ email });
                        channel = yield channel_1.default.findOneAndUpdate({ _id: channelId }, { $push: { collaborators: newUser._id } }, { new: true }).populate('collaborators');
                        yield organisation_1.default.findOneAndUpdate({ _id: organisationId }, { $push: { coWorkers: newUser._id } });
                        // send email to the ids
                        (0, sendEmail_1.default)(email, `${invitedBy.email} has invited you to work with them in Slack`, (0, join_teammates_email_1.joinTeammatesEmail)(invitedBy.username, invitedBy.email, organisation.name, req.user.id, organisation.joinLink, organisation.url));
                    }
                    catch (error) {
                        next(error);
                    }
                }
                (0, successResponse_1.default)(res, channel);
            }
            else if (organisationId) {
                // add new teammates to organisation
                const organisationExist = yield organisation_1.default.findById(organisationId);
                if (organisationExist) {
                    for (const email of emails) {
                        try {
                            const existingUser = yield user_1.default.findOne({ email });
                            if (existingUser) {
                                // Check if existingUser is not part of coWorkers field before pushing
                                const isUserAlreadyInCoWorkers = organisationExist.coWorkers.includes(existingUser._id);
                                if (!isUserAlreadyInCoWorkers) {
                                    organisation = yield organisation_1.default.findOneAndUpdate({ _id: organisationId }, {
                                        $addToSet: { coWorkers: existingUser._id },
                                    }, { new: true }).populate(['coWorkers', 'owner']);
                                }
                            }
                            else {
                                const newUser = yield user_1.default.create({ email });
                                organisation = yield organisation_1.default.findOneAndUpdate({ _id: organisationId }, {
                                    $push: {
                                        coWorkers: newUser._id,
                                    },
                                }, { new: true }).populate(['coWorkers', 'owner']);
                            }
                            // vibe and inshallah
                            (0, sendEmail_1.default)(email, `${invitedBy.email} has invited you to work with them in Slack`, (0, join_teammates_email_1.joinTeammatesEmail)(invitedBy.username, invitedBy.email, organisation.name, req.user.id, organisation.joinLink, organisation.url));
                        }
                        catch (error) {
                            next(error);
                        }
                    }
                    if (!channelId) {
                        (0, successResponse_1.default)(res, organisation);
                    }
                    // Create separate conversations for each unique pair of coWorkers
                    for (let i = 0; i < organisation.coWorkers.length; i++) {
                        for (let j = i + 1; j < organisation.coWorkers.length; j++) {
                            // Check if a conversation with these collaborators already exists
                            const existingConversation = yield conversation_1.default.findOne({
                                collaborators: {
                                    $all: [
                                        organisation.coWorkers[i]._id,
                                        organisation.coWorkers[j]._id,
                                    ],
                                },
                                organisation: organisationId,
                            });
                            // If no conversation exists, create a new one
                            if (!existingConversation) {
                                yield conversation_1.default.create({
                                    name: `${organisation.coWorkers[i].username}, ${organisation.coWorkers[j].username}`,
                                    description: `This conversation is between ${organisation.coWorkers[i].username} and ${organisation.coWorkers[j].username}`,
                                    organisation: organisationId,
                                    isSelf: organisation.coWorkers[i]._id ===
                                        organisation.coWorkers[j]._id,
                                    collaborators: [
                                        organisation.coWorkers[i]._id,
                                        organisation.coWorkers[j]._id,
                                    ],
                                });
                            }
                        }
                    }
                    // Create self-conversations for each coworker
                    for (let i = 0; i < organisation.coWorkers.length; i++) {
                        const selfConversationExists = yield conversation_1.default.findOne({
                            collaborators: {
                                $all: [organisation.coWorkers[i]._id],
                            },
                            organisation: organisationId,
                            isSelf: true,
                        });
                        // If no self-conversation exists, create one
                        if (!selfConversationExists) {
                            yield conversation_1.default.create({
                                name: `${organisation.coWorkers[i].username}`,
                                description: `This is a conversation with oneself (${organisation.coWorkers[i].username}).`,
                                organisation: organisationId,
                                isSelf: true,
                                collaborators: [organisation.coWorkers[i]._id],
                            });
                        }
                    }
                }
            }
        }
        catch (error) {
            next(error);
        }
    });
}
exports.createTeammates = createTeammates;
// @desc    get a teammate of an organisation
// @route   GET /api/v1/teammates
// @access  Private
function getTeammate(req, res, next) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            const coworkerId = req.params.id;
            const coworker = yield user_1.default.findById(coworkerId);
            // console.log(coworker);
            if (!coworker) {
                return res.status(400).json({
                    name: 'Coworker not found',
                });
            }
            return (0, successResponse_1.default)(res, coworker);
        }
        catch (error) {
            next(error);
        }
    });
}
exports.getTeammate = getTeammate;
//# sourceMappingURL=teammates.js.map