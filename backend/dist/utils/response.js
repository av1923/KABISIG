export function sendSuccess(res, data, message = 'Operation successful', statusCode = 200) {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        timestamp: new Date().toISOString(),
    });
}
export function sendCreated(res, data, message = 'Resource created successfully') {
    return sendSuccess(res, data, message, 201);
}
export function sendError(res, message = 'An unexpected error occurred', statusCode = 400, details) {
    return res.status(statusCode).json({
        success: false,
        message,
        error: message,
        ...(details !== undefined ? { details } : {}),
        timestamp: new Date().toISOString(),
    });
}
export function sendPaginated(res, data, pagination, message = 'Data retrieved successfully') {
    const totalPages = Math.ceil(pagination.total / pagination.limit) || 1;
    return res.status(200).json({
        success: true,
        message,
        data,
        pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total: pagination.total,
            totalPages,
        },
        timestamp: new Date().toISOString(),
    });
}
//# sourceMappingURL=response.js.map