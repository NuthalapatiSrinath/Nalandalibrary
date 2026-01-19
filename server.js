const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan"); // HTTP Logger
const { graphqlHTTP } = require("express-graphql");

// Config & Database
const config = require("./src/config");
const connectDB = require("./src/config/db");
const logger = require("./src/utils/logger"); // Import Custom Logger

// Routes & Middleware
const authRoutes = require("./src/routes/authRoutes");
const bookRoutes = require("./src/routes/bookRoutes");
const borrowRoutes = require("./src/routes/borrowRoutes");
const errorHandler = require("./src/middlewares/errorMiddleware"); // Import Error Handler
const { graphqlAuth } = require("./src/middlewares/authMiddleware");

const graphQlSchema = require("./src/api/graphql/schema");
const graphQlResolvers = require("./src/api/graphql/resolvers");

// Init App
const app = express();

// Connect to Database
// (Mongoose handles connection buffering, so this is safe for Serverless/Vercel)
connectDB();

// --- 1. Global Middleware ---
app.use(helmet());
app.use(cors());
app.use(express.json());

// Use morgan for HTTP logs, stream them to our winston logger
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  }),
);

// --- 2. REST Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/borrow", borrowRoutes);

// --- 3. Health Check Route (Requested) ---
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    message: "Nalanda Library API is healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// --- 4. GraphQL API ---
app.use(
  "/graphql",
  graphqlAuth,
  graphqlHTTP({
    schema: graphQlSchema,
    rootValue: graphQlResolvers,
    graphiql: !config.isProduction, // Disable playground in production
    // Custom Error Formatting for GraphQL
    customFormatErrorFn: (err) => {
      logger.error(`GraphQL Error: ${err.message}`);
      return {
        message: err.message,
        status: err.originalError?.status || 500,
        path: err.path,
      };
    },
  }),
);

// --- 5. Base Route ---
app.get("/", (req, res) => {
  res.send(`
    <h1>Nalanda Library API is Running 🚀</h1>
    <p>Health Check: <a href="/health">/health</a></p>
    <p>GraphQL Endpoint: <a href="/graphql">/graphql</a></p>
  `);
});

// --- 6. Global Error Handler (Must be last) ---
app.use(errorHandler);

// --- 7. Start Server (Modified for Vercel) ---
const PORT = config.port || 5000;

// Only listen if running locally (not on Vercel)
if (require.main === module) {
  app.listen(PORT, () => {
    logger.info(`🚀 Server running in ${config.env} mode on port ${PORT}`);
  });
}

// Export the app for Vercel (Serverless)
module.exports = app;
