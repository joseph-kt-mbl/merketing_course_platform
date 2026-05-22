import app from './app.js';
import connectDB from './config/db.js';
import ngrok from "@ngrok/ngrok";
import http from "http";
import { Server } from "socket.io";
import './config/env.js';
import { socketCorsOptions } from './config/cors.config.js';

const PORT = process.env.PORT || 5000;

connectDB();

const server = http.createServer(app);
export const io = new Server(server, socketCorsOptions);

io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
});

// const startServer = async () => {
//   try {
//     if (process.env.NGROK_AUTHTOKEN) {
//       await ngrok.authtoken(process.env.NGROK_AUTHTOKEN);
//     }

//     server.listen(PORT, async () => {
//   console.log(`🚀 Server running on port ${PORT}`);
//   console.log(`🔌 Socket.io enabled on port ${PORT}`);
//   console.log(`📡 Ngrok enabled: ${!!process.env.NGROK_AUTHTOKEN}`);

//   const ngrokToken = process.env.NGROK_AUTHTOKEN;
//   if (ngrokToken && !ngrokToken.startsWith('${')) {
//     try {
//       console.log(`⏳ Connecting to ngrok...`);
//       const listener = await ngrok.connect({
//         addr: Number(PORT),
//         response_header_add: ["ngrok-skip-browser-warning=true"],
//       });
//       const url = listener.url();
//       console.log(`🌍 Ngrok URL: ${url}`);
//     } catch (ngrokError) {
//       console.error("❌ Ngrok connection error:", ngrokError.message ?? ngrokError);
//     }
//   } else {
//     console.warn("⚠️ Ngrok skipped: token missing or invalid");
//   }
// });

  
//   } catch (error) {
//     console.error("❌ Server startup error:", error);
//   }
// };


const startServer = async () => {
  try {
    // Wait for server to fully listen before ngrok connects
    await new Promise((resolve, reject) => {
      server.listen(PORT, resolve);
      server.once('error', reject);
    });

    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔌 Socket.io enabled on port ${PORT}`);

    const ngrokToken = process.env.NGROK_AUTHTOKEN;
    if (ngrokToken && !ngrokToken.startsWith('${')) {
      try {
        console.log(`⏳ Connecting to ngrok...`);
        const listener = await ngrok.connect({
          addr: Number(PORT),
          response_header_add: ["ngrok-skip-browser-warning=true"],
        });
        console.log(`🌍 Ngrok URL: ${listener.url()}`);
      } catch (ngrokError) {
        console.error("❌ Ngrok error:", ngrokError.message ?? ngrokError);
      }
    }
  } catch (error) {
    console.error("❌ Server startup error:", error);
  }
};


startServer();



// import app from './app.js';
// import connectDB from './config/db.js';
// import http from "http";
// import { Server } from "socket.io";
// import './config/env.js';
// import { socketCorsOptions } from './config/cors.config.js';

// const PORT = process.env.PORT || 5000;

// // Connect database
// connectDB();

// // Create HTTP server
// const server = http.createServer(app);

// // Initialize Socket.io
// export const io = new Server(server, socketCorsOptions);

// // Socket connection
// io.on("connection", (socket) => {
//   console.log("🟢 Client connected:", socket.id);

//   socket.on("disconnect", () => {
//     console.log("🔴 Client disconnected:", socket.id);
//   });
// });

// // Start server
// const startServer = async () => {
//   try {
//     server.listen(PORT, () => {
//       console.log(`🚀 Server running on port ${PORT}`);
//       console.log(`🔌 Socket.io enabled on port ${PORT}`);
//     });
//   } catch (error) {
//     console.error("❌ Server startup error:", error);
//   }
// };

// startServer();

