// config/appConfig.js
require('dotenv').config();

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET environment variable is not set. This is required for security.');
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production');
  }
}

if (!process.env.SECRET_WORD) {
  console.error('WARNING: SECRET_WORD environment variable is not set. Using default (not recommended for production).');
}

module.exports = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'default_secret_change_me_in_production',
  secretWord: process.env.SECRET_WORD || 'default_secret_word_change_me',
};
