const Logger = {
  info:  (msg, ...a) => console.log( `[INFO]  [${new Date().toISOString()}] ${msg}`, ...a),
  warn:  (msg, ...a) => console.warn( `[WARN]  [${new Date().toISOString()}] ${msg}`, ...a),
  error: (msg, ...a) => console.error(`[ERROR] [${new Date().toISOString()}] ${msg}`, ...a),
};
export default Logger;