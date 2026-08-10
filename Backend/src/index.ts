import express, { type Request, type Response } from "express";

// Initialize the Express application
const app = express();

// Define the port we want our server to listen on
const PORT = 5000;

// Add a simple route to check if the server is alive
app.get("/", (req: Request, res: Response) => {
  res.send("Online Complaint Management System API is running!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running smoothly on http://localhost:${PORT}`);
});
