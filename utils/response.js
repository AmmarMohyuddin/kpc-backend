const successResponse = (res, status, message, data = {}) => {
  return res.status(status).json({
    success: true,
    status,
    message,
    data: data || {},
  });
};

const errorResponse = (res, status, message, error = null) => {
  if (typeof status !== "number") {
    console.error("Invalid status code:", status);
    status = 500;
  }
  return res.status(status).json({
    success: false,
    status,
    message,
    error,
  });
};

module.exports = {
  successResponse,
  errorResponse,
};
