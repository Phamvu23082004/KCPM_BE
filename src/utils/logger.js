/**
 * Utils - Các hàm tiện ích
 * Thư mục này sẽ chứa các hàm helper, validator, formatter v.v.
 */

// Ví dụ: Function log với timestamp
const logger = {
  info: (message) => console.log(`[INFO] ${new Date().toISOString()}: ${message}`),
  error: (message) => console.error(`[ERROR] ${new Date().toISOString()}: ${message}`),
  warn: (message) => console.warn(`[WARN] ${new Date().toISOString()}: ${message}`),
};

module.exports = { logger };
