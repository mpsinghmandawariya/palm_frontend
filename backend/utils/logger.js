const sanitizeMeta = (meta) => {
  if (!meta || typeof meta !== "object") return meta;
  const sanitized = { ...meta };
  // Never log raw base64 images or high-dimensional float vectors
  if (sanitized.image) sanitized.image = "[IMAGE_DATA_REDACTED]";
  if (sanitized.embedding) sanitized.embedding = `[${sanitized.embedding.length}d_VECTOR_REDACTED]`;
  if (sanitized.target_embedding) sanitized.target_embedding = "[VECTOR_REDACTED]";
  if (sanitized.password) sanitized.password = "[REDACTED]";
  if (sanitized.pin) sanitized.pin = "[REDACTED]";
  return sanitized;
};

const formatMessage = (level, message, meta = null, requestId = null) => {
  const timestamp = new Date().toISOString();
  const reqTag = requestId ? ` [${requestId}]` : "";
  const metaStr = meta ? ` ${JSON.stringify(sanitizeMeta(meta))}` : "";
  return `[${timestamp}] [${level}]${reqTag} ${message}${metaStr}`;
};

const logger = {
  info: (msg, meta, reqId) => console.log(formatMessage("INFO", msg, meta, reqId)),
  warn: (msg, meta, reqId) => console.warn(formatMessage("WARN", msg, meta, reqId)),
  error: (msg, meta, reqId) => console.error(formatMessage("ERROR", msg, meta, reqId)),
  debug: (msg, meta, reqId) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug(formatMessage("DEBUG", msg, meta, reqId));
    }
  },
};

module.exports = logger;
