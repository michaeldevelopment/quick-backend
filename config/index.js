require("dotenv").config();

const config = {
  PORT: process.env.PORT || 3002,
  DATABASE: {
    url:
      process.env.NODE_ENV === "test"
        ? process.env.TEST_MONGODB_URI
        : process.env.MONGODB_URI,
  },
  // TODO: add more filter options
  filter: { options: ["type"] },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  sendgrid: {
    apiKey: process.env.SENGRID_API_KEY,
    senderEmail: process.env.SENDER_EMAIL,
    resetUrl: process.env.CLIENT_URL,
  },
  epayco: {
    publicKey: process.env.EPAYCO_PUBLIC_KEY,
    privateKey: process.env.EPAYCO_PRIVATE_KEY,
  },
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
};

module.exports = config;
