const AppError = require("./AppError");

function base64ToBlob(base64Data) {
  if (!base64Data || typeof base64Data !== "string") {
    throw new AppError("Invalid image data received", 400, "INVALID_IMAGE_FORMAT");
  }

  const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  let mimeType = "image/jpeg";
  let buffer;

  if (matches && matches.length === 3) {
    mimeType = matches[1];
    buffer = Buffer.from(matches[2], "base64");
  } else {
    buffer = Buffer.from(base64Data.replace(/^data:image\/\w+;base64,/, ""), "base64");
  }

  if (!buffer || buffer.length === 0) {
    throw new AppError("Empty image buffer", 400, "EMPTY_IMAGE");
  }

  return new Blob([buffer], { type: mimeType });
}

function isValidBase64Image(str) {
  if (!str || typeof str !== "string") return false;
  return /^data:image\/(jpeg|png|webp|jpg);base64,([A-Za-z0-9+/=])+/.test(str);
}

module.exports = {
  base64ToBlob,
  isValidBase64Image,
};
