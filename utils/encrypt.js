// utils/encrypt.js
const CryptoJS = require("crypto-js");
const SECRET_KEY = process.env.DATA_SECRET_KEY || "supersecretkey";

function encryptData(data) {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
}

function decryptData(encrypted) {
  const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}

module.exports = { encryptData, decryptData };