"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const dotenv_1 = tslib_1.__importDefault(require("dotenv"));
const db_1 = tslib_1.__importDefault(require("./config/db"));
dotenv_1.default.config();
const auth_1 = tslib_1.__importDefault(require("./routes/auth"));
const cookie_parser_1 = tslib_1.__importDefault(require("cookie-parser"));
const morgan_1 = tslib_1.__importDefault(require("morgan"));
const helmet_1 = tslib_1.__importDefault(require("helmet"));
const xss_clean_1 = tslib_1.__importDefault(require("xss-clean"));
const express_rate_limit_1 = tslib_1.__importDefault(require("express-rate-limit"));
const hpp_1 = tslib_1.__importDefault(require("hpp"));
const cors_1 = tslib_1.__importDefault(require("cors"));
const channel_1 = tslib_1.__importDefault(require("./routes/channel"));
const message_1 = tslib_1.__importDefault(require("./routes/message"));
const thread_1 = tslib_1.__importDefault(require("./routes/thread"));
const teammates_1 = tslib_1.__importDefault(require("./routes/teammates"));
const organisation_1 = tslib_1.__importDefault(require("./routes/organisation"));
const errorResponse_1 = tslib_1.__importDefault(require("./middleware/errorResponse"));
const message_2 = tslib_1.__importDefault(require("./models/message"));
const channel_2 = tslib_1.__importDefault(require("./models/channel"));
const conversation_1 = tslib_1.__importDefault(require("./models/conversation"));
const conversations_1 = tslib_1.__importDefault(require("./routes/conversations"));
const socket_io_1 = require("socket.io");
const http_1 = tslib_1.__importDefault(require("http"));
const updateConversationStatus_1 = tslib_1.__importDefault(require("./helpers/updateConversationStatus"));
const thread_2 = tslib_1.__importDefault(require("./models/thread"));
const createTodaysFirstMessage_1 = tslib_1.__importDefault(require("./helpers/createTodaysFirstMessage"));
const passport_1 = tslib_1.__importDefault(require("passport"));
const cookie_session_1 = tslib_1.__importDefault(require("cookie-session"));
const mongoose_1 = tslib_1.__importDefault(require("mongoose"));
const Prometheus = require('prom-client');
// create metrics for Prometheus
// const metricsInterval = Prometheus.collectDefaultMetrics()
const appTestsTotal = new Prometheus.Counter({
    name: 'MERN_APP_web_app_calls',
    help: 'Number of times the server API was tested by the client'
});
const dbCallsFailTotal = new Prometheus.Counter({
    name: 'MERN_APP_db_connection_failures',
    help: 'Total number of server->db connection failures'
});
const dbCallsSuccessTotal = new Prometheus.Counter({
    name: 'MERN_APP_db_connection_successes',
    help: 'Total number of server->db connection successes'
});
const metricsReadTotal = new Prometheus.Counter({
    name: 'MERN_APP_metrics_read_total',
    help: 'Total number of metric readings'
});
// const httpRequestDurationMicroseconds = new Prometheus.Histogram({
//     name: 'MERN_APP_http_request_duration_ms',
//     help: 'Duration of HTTP requests in ms',
//     labelNames: ['method', 'route', 'code'],
//     buckets: [0.10, 5, 15, 50, 100, 200, 300, 400, 500] // buckets for response time from 0.1ms to 500ms
// })
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        // origin: process.env.CLIENT_URL,
        origin: "*",
        methods: ['GET', 'POST'],
    },
});
// Connect to MongoDB
(0, db_1.default)();
// Handle the database connection and retry as needed
const db = mongoose_1.default.connection;
db.on("error", err => {
    console.log("There was a problem connecting to the database: ", err);
    console.log("Please trying again");
    dbCallsFailTotal.inc(); // db connection fail counter metric
    setTimeout(() => (0, db_1.default)(), 5000);
});
db.once("open", () => {
    dbCallsSuccessTotal.inc(); // db connection counter metric
    console.log("Successfully connected to the database");
});
// Express configuration
app.use((0, cookie_session_1.default)({
    name: 'session',
    keys: ['cyberwolve'],
    maxAge: 24 * 60 * 60 * 100,
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// cookie-parser configuration
app.use((0, cookie_parser_1.default)());
// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
// Set security headers
app.use((0, helmet_1.default)());
// Prevent XSS attacks
app.use((0, xss_clean_1.default)());
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 10 * 60 * 1000,
    max: 1000,
});
app.use(limiter);
// Prevent http param pollution
app.use((0, hpp_1.default)());
// Enable CORS
app.use((0, cors_1.default)());
// Store users' sockets by their user IDs
const users = {};
// Set up WebSocket connections
io.on('connection', (socket) => {
    socket.on('user-join', ({ id, isOnline }) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        socket.join(id);
        yield (0, updateConversationStatus_1.default)(id, isOnline);
        io.emit('user-join', { id, isOnline });
    }));
    socket.on('user-leave', ({ id, isOnline }) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        socket.leave(id);
        yield (0, updateConversationStatus_1.default)(id, isOnline);
        io.emit('user-leave', { id, isOnline });
    }));
    socket.on('channel-open', ({ id, userId }) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        if (id) {
            socket.join(id);
            const updatedChannel = yield channel_2.default.findByIdAndUpdate(id, { $pull: { hasNotOpen: userId } }, { new: true });
            io.to(id).emit('channel-updated', updatedChannel);
        }
    }));
    socket.on('convo-open', ({ id, userId }) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        if (id) {
            socket.join(id);
            const updatedConversation = yield conversation_1.default.findByIdAndUpdate(id, { $pull: { hasNotOpen: userId } }, { new: true });
            io.to(id).emit('convo-updated', updatedConversation);
        }
    }));
    socket.on('thread-message', ({ userId, messageId, message }) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        try {
            socket.join(messageId);
            let newMessage = yield thread_2.default.create({
                sender: message.sender,
                content: message.content,
                message: messageId,
                hasRead: false,
            });
            newMessage = yield newMessage.populate('sender');
            io.to(messageId).emit('thread-message', { newMessage });
            const updatedMessage = yield message_2.default.findByIdAndUpdate(messageId, {
                threadLastReplyDate: newMessage.createdAt,
                $addToSet: { threadReplies: userId },
                $inc: { threadRepliesCount: 1 },
            }, { new: true }).populate(['threadReplies', 'sender', 'reactions.reactedToBy']);
            io.to(messageId).emit('message-updated', {
                id: messageId,
                message: updatedMessage,
            });
            // socket.emit("message-updated", { messageId, message: updatedMessage });
        }
        catch (error) {
            console.log(error);
        }
    }));
    socket.on('message', ({ channelId, channelName, conversationId, collaborators, isSelf, message, organisation, hasNotOpen, }) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        try {
            if (channelId) {
                socket.join(channelId);
                // Check if there are any messages for today in the channel
                yield (0, createTodaysFirstMessage_1.default)({ channelId, organisation });
                let newMessage = yield message_2.default.create({
                    organisation,
                    sender: message.sender,
                    content: message.content,
                    channel: channelId,
                    hasRead: false,
                });
                newMessage = yield newMessage.populate('sender');
                io.to(channelId).emit('message', { newMessage, organisation });
                const updatedChannel = yield channel_2.default.findByIdAndUpdate(channelId, { hasNotOpen }, { new: true });
                io.to(channelId).emit('channel-updated', updatedChannel);
                socket.broadcast.emit('notification', {
                    channelName,
                    channelId,
                    collaborators,
                    newMessage,
                    organisation,
                });
            }
            else if (conversationId) {
                socket.join(conversationId);
                // Check if there are any messages for today in the channel
                yield (0, createTodaysFirstMessage_1.default)({ conversationId, organisation });
                let newMessage = yield message_2.default.create({
                    organisation,
                    sender: message.sender,
                    content: message.content,
                    conversation: conversationId,
                    collaborators,
                    isSelf,
                    hasRead: false,
                });
                newMessage = yield newMessage.populate('sender');
                io.to(conversationId).emit('message', {
                    collaborators,
                    organisation,
                    newMessage,
                });
                const updatedConversation = yield conversation_1.default.findByIdAndUpdate(conversationId, { hasNotOpen }, { new: true });
                io.to(conversationId).emit('convo-updated', updatedConversation);
                socket.broadcast.emit('notification', {
                    collaborators,
                    organisation,
                    newMessage,
                    conversationId,
                });
            }
        }
        catch (error) {
            console.log(error);
        }
    }));
    socket.on('message-view', (messageId) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        yield message_2.default.findByIdAndUpdate(messageId, {
            hasRead: true,
        });
        if (message_1.default) {
            io.emit('message-view', messageId);
        }
        else {
            console.log('message not found');
        }
    }));
    socket.on('reaction', ({ emoji, id, isThread, userId }) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        // 1. Message.findbyid(id)
        let message;
        if (isThread) {
            message = yield thread_2.default.findById(id);
        }
        else {
            message = yield message_2.default.findById(id);
        }
        if (!message) {
            // Handle the case where the model with the given id is not found
            return;
        }
        // 2. check if emoji already exists in Message.reactions array
        if (message.reactions.some((r) => r.emoji === emoji)) {
            // 3. if it does, check if userId exists in reactedToBy array
            if (message.reactions.some((r) => r.emoji === emoji &&
                r.reactedToBy.some((v) => v.toString() === userId))) {
                // Find the reaction that matches the emoji and remove userId from its reactedToBy array
                const reactionToUpdate = message.reactions.find((r) => r.emoji === emoji);
                if (reactionToUpdate) {
                    reactionToUpdate.reactedToBy = reactionToUpdate.reactedToBy.filter((v) => v.toString() !== userId);
                    // If reactedToBy array is empty after removing userId, remove the reaction object
                    if (reactionToUpdate.reactedToBy.length === 0) {
                        message.reactions = message.reactions.filter((r) => r !== reactionToUpdate);
                    }
                    // await message.populate([
                    //   "reactions.reactedToBy",
                    //   "sender",
                    //   // "threadReplies",
                    // ]);
                    if (isThread) {
                        yield message.populate(['reactions.reactedToBy', 'sender']);
                    }
                    else {
                        yield message.populate([
                            'reactions.reactedToBy',
                            'sender',
                            'threadReplies',
                        ]);
                    }
                    socket.emit('message-updated', { id, message, isThread });
                    yield message.save();
                }
            }
            else {
                // Find the reaction that matches the emoji and push userId to its reactedToBy array
                const reactionToUpdate = message.reactions.find((r) => r.emoji === emoji);
                if (reactionToUpdate) {
                    reactionToUpdate.reactedToBy.push(userId);
                    // await message.populate([
                    //   "reactions.reactedToBy",
                    //   "sender",
                    //   // isThread && "threadReplies",
                    //   // "threadReplies",
                    // ]);
                    if (isThread) {
                        yield message.populate(['reactions.reactedToBy', 'sender']);
                    }
                    else {
                        yield message.populate([
                            'reactions.reactedToBy',
                            'sender',
                            'threadReplies',
                        ]);
                    }
                    socket.emit('message-updated', { id, message, isThread });
                    yield message.save();
                }
            }
        }
        else {
            // 4. if it doesn't exists, create a new reaction like this {emoji, reactedToBy: [userId]}
            message.reactions.push({ emoji, reactedToBy: [userId] });
            // await message.populate([
            //   "reactions.reactedToBy",
            //   "sender",
            //   // isThread && "threadReplies",
            //   // "threadReplies",
            // ]);
            if (isThread) {
                yield message.populate(['reactions.reactedToBy', 'sender']);
            }
            else {
                yield message.populate([
                    'reactions.reactedToBy',
                    'sender',
                    'threadReplies',
                ]);
            }
            socket.emit('message-updated', { id, message, isThread });
            yield message.save();
        }
    }));
    // Event handler for joining a room
    socket.on('join-room', ({ roomId, userId }) => {
        // Join the specified room
        socket.join(roomId);
        // Store the user's socket by their user ID
        users[userId] = socket;
        // Broadcast the "join-room" event to notify other users in the room
        socket.to(roomId).emit('join-room', { roomId, otherUserId: userId });
        console.log(`User ${userId} joined room ${roomId}`);
    });
    // Event handler for sending an SDP offer to another user
    socket.on('offer', ({ offer, targetUserId }) => {
        // Find the target user's socket by their user ID
        const targetSocket = users[targetUserId];
        if (targetSocket) {
            targetSocket.emit('offer', { offer, senderUserId: targetUserId });
        }
    });
    // Event handler for sending an SDP answer to another user
    socket.on('answer', ({ answer, senderUserId }) => {
        socket.broadcast.emit('answer', { answer, senderUserId });
    });
    // Event handler for sending ICE candidates to the appropriate user (the answerer)
    socket.on('ice-candidate', ({ candidate, senderUserId }) => {
        // Find the target user's socket by their user ID
        const targetSocket = users[senderUserId];
        if (targetSocket) {
            targetSocket.emit('ice-candidate', candidate, senderUserId);
        }
    });
    // Event handler for leaving a room
    socket.on('room-leave', ({ roomId, userId }) => {
        socket.leave(roomId);
        // Remove the user's socket from the users object
        delete users[userId];
        // Broadcast the "room-leave" event to notify other users in the room
        socket.to(roomId).emit('room-leave', { roomId, leftUserId: userId });
        console.log(`User ${userId} left room ${roomId}`);
    });
});
// Routes
app.use('/api/v1/auth', auth_1.default);
app.use('/api/v1/channel', channel_1.default);
app.use('/api/v1/messages', message_1.default);
app.use('/api/v1/threads', thread_1.default);
app.use('/api/v1/teammates', teammates_1.default);
app.use('/api/v1/organisation', organisation_1.default);
app.use('/api/v1/conversations', conversations_1.default);
// Define a route
app.get('/test', (req, res) => {
    appTestsTotal.inc(); // metric for app calls
    res.send('This is a test endpoint');
});
app.get("/metrics", (req, res) => {
    metricsReadTotal.inc(); // metric readings counter metric
    res.set('Content-Type', Prometheus.register.contentType);
    res.send(Prometheus.register.metrics());
});
// error handler
app.use(errorResponse_1.default);
// Start the server
const port = process.env.PORT || 8080;
server.listen({
    port: port,
    // host: "0.0.0.0",
    callback: () => {
        console.log(`Server is running on port ${port}`);
    },
});
//# sourceMappingURL=index.js.map