const responseHandler = (req, res, next) => {
  res.success = (result = null, message = "Success", status = 200) => {
    return res.status(status).json({
      EC: 0,
      EM: message,
      result: result,
    });
  };

  next();
};

module.exports = responseHandler;
