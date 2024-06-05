"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const mongoose_1 = tslib_1.__importDefault(require("mongoose"));
function connectDB() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        // try {
        yield mongoose_1.default.connect(process.env.MONGODB_URI, {
            dbName: process.env.MONGODB_DB_NAME,
        });
        // console.log(`MongoDB connected: ${conn.connection.name}`)
        // } catch (error) {
        //   console.error(`Error: ${(error as Error).message}`)
        //   process.exit(1)
    });
}
exports.default = connectDB;
// }
//# sourceMappingURL=db.js.map