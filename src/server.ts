import { PORT } from "./config/env";
import { app } from "./app";
import connectDB from "./config/connectDB";
import { mailer } from "./utils/NodeMailer";

const server = app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
  connectDB();
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: any) => {
  console.log(`Shutting down the server for ERROR: ${err.message}`);
  console.log(`Shutting down the server for unhandled promise rejections`);

  server.close(() => {
    process.exit(1);
  });

  // server.close();

  // server.listen(PORT, () => {
  //   console.log(`Server is running on port http://localhost:${PORT}`);
  // });
});
