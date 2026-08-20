import {} from "express";
// Ye 4 parameters (err, req, res, next) batate hain ki ye ek Error Handler hai
export const errorHandler = (err, req, res, next) => {
    // Terminal mein error print karega taaki aapko (developer ko) pata chale
    console.error("🔥 Global Error Log:", err.stack || err.message);
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error! Kuch gadbad ho gayi.";
    // Frontend ko ek clean JSON bheje ga
    res.status(statusCode).json({
        success: false,
        message: message,
    });
};
//# sourceMappingURL=error.middleware.js.map