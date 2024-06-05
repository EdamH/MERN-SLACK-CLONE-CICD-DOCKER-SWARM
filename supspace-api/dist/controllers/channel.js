"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateChannel = exports.getChannel = exports.getChannels = exports.createChannel = void 0;
const tslib_1 = require("tslib");
const channel_1 = tslib_1.__importDefault(require("../models/channel"));
const successResponse_1 = tslib_1.__importDefault(require("../helpers/successResponse"));
// @desc    create channel
// @route   POST /api/v1/channel/create
// @access  Private
function createChannel(req, res, next) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            const { name, organisationId } = req.body;
            const channel = yield channel_1.default.create({
                name,
                collaborators: [req.user.id],
                organisation: organisationId,
            });
            (0, successResponse_1.default)(res, channel);
        }
        catch (error) {
            next(error);
        }
    });
}
exports.createChannel = createChannel;
function getChannels(req, res, next) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            const id = req.params.id;
            const channels = yield channel_1.default.find({ organisation: id })
                .populate({
                path: 'organisation',
                populate: [{ path: 'owner' }, { path: 'coWorkers' }],
            })
                .populate('collaborators')
                .sort({ _id: -1 });
            (0, successResponse_1.default)(res, channels);
        }
        catch (error) {
            next(error);
        }
    });
}
exports.getChannels = getChannels;
function getChannel(req, res, next) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            const id = req.params.id;
            const channel = yield channel_1.default.findById(id)
                .populate('collaborators')
                .sort({ _id: -1 });
            if (!channel) {
                return res.status(400).json({
                    name: 'not found',
                });
            }
            const updatedChannel = Object.assign(Object.assign({}, channel.toObject()), { isChannel: true });
            (0, successResponse_1.default)(res, updatedChannel);
        }
        catch (error) {
            next(error);
        }
    });
}
exports.getChannel = getChannel;
function updateChannel(req, res, next) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            const id = req.params.id;
            const channel = yield channel_1.default.findById(id);
            if (!channel) {
                return res.status(400).json({
                    name: 'not found',
                });
            }
            const updatedChannel = yield channel_1.default.findByIdAndUpdate(id, { $addToSet: { collaborators: req.body.userId } }, {
                new: true,
            });
            (0, successResponse_1.default)(res, updatedChannel);
        }
        catch (error) {
            next(error);
        }
    });
}
exports.updateChannel = updateChannel;
//# sourceMappingURL=channel.js.map