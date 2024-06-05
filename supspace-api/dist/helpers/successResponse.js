"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function successResponse(res, data) {
    res.status(201).json({
        data,
    });
}
exports.default = successResponse;
//# sourceMappingURL=successResponse.js.map