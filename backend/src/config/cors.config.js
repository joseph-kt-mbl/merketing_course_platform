export const allowedOrigins = [
  "http://localhost:5173",
  /^https:\/\/[a-z0-9-]+\.ngrok-free\.app$/,
  /^https:\/\/[a-z0-9-]+\.ngrok\.io$/,
];

export const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some((allowed) => {
      if (typeof allowed === "string") return allowed === origin;
      if (allowed instanceof RegExp) return allowed.test(origin);
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "ngrok-skip-browser-warning"],
};

export const socketCorsOptions = {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      
      const isAllowed = allowedOrigins.some((allowed) => {
        if (typeof allowed === "string") return allowed === origin;
        if (allowed instanceof RegExp) return allowed.test(origin);
        return false;
      });
      
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by Socket.io CORS"));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    transports: ['websocket', 'polling'],
  }
};