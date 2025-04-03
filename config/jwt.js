require('dotenv').config();

const { JWT_SECRET_KEY, GEMINI_API_KEY } = process.env;

if (!JWT_SECRET_KEY || !GEMINI_API_KEY) {
    throw new Error("Missing environment variables");
}

module.exports = {
    JWT_SECRET: JWT_SECRET_KEY, // Use the correct name
    GEMINI_API_KEY
};
