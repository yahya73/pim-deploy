import express from "express";
import session from "express-session";
import mongoose from "mongoose";
import morgan from "morgan";
import cors from "cors";
import { Server } from "socket.io"; // Import socket.io
import http from "http"; // Import http module
 // Import http module
import { notFoundError } from "./middlewares/error-handler.js";
import { errorHandler } from "./middlewares/error-handler.js";
import Routes from "./routes/Routes.js";
import PartenaireRoutes from "./routes/partenaireRoutes.js";
import ParentRoutes from "./routes/parentRoutes.js";
import dotenv from "dotenv";
import NotificationRoutes from "./routes/NotificationRoutes.js";
import chatRoutes from "./routes/ChatRoutes.js";
import ProductRoutes from "./routes/ProductRoutes.js";
import PaymentRoutes from "./routes/payment.js";
import WishlistRoutes from "./routes/wishlistRoutes.js";
import userRoutes from './routes/UserRoutes.js';
import productroutes from "./routes/productroutesmootez.js";
import reelRoutes from "./routes/reelRoutes.js";
import reportRoute from "./routes/reportRoutes.js" 
import MarketRoute from "./routes/market.route.js" ;
import TaskRoutes from './routes/taskRoutes.js';
import cron from 'node-cron';
import { sendAiQuizes } from './controllers/taskController.js'


// Creating an express app
const app = express();
app.use(session({
  secret: 'e0a37e5d5295b90702a8ff5a2e27c47dcd51d05a11cfc69590dcb5d5904a64f',
  resave: false,
  saveUninitialized: true
}));
const server = http.createServer(app); // Create a server instance
 // Create a server instance

dotenv.config();
// Setting the port number for the server (default to 9090 if not provided)
const PORT = 9090 || process.env.PORT;
const databaseName = "PIM";


// Enabling debug mode for mongoose
mongoose.set("debug", true);
mongoose.set("debug", true);

// Setting the global Promise library
mongoose.Promise = global.Promise;

// Connecting to the MongoDB database
mongoose
  .connect(
    `mongodb+srv://localhost:GWaB8yrPjyl265Vw@paymentforkids.vliqoot.mongodb.net/${databaseName}`
  )
  //.connect('mongodb://localhost:27017/kidscoin')
  .then(() => {
    console.log(`Connected to  db`);
  })
  .catch((error) => {
    console.log(error);
  });

// Enabling Cross-Origin Resource Sharing
app.use(cors());

// Using morgan for logging HTTP requests
app.use(morgan("dev"));
app.use(morgan("dev"));

// Parsing JSON request bodies
app.use(express.json());

// Parsing URL-encoded request bodies with extended format
app.use(express.urlencoded({ extended: true }));

// Serving static files (images) from the 'public/images' directory
app.use("/img", express.static("public/images"));

app.use('/WishList', WishlistRoutes);
// Importing the routes for the 'tests' resource
app.use("/partenaire", PartenaireRoutes);
app.use('/parent', ParentRoutes);
app.use("/chat", chatRoutes);
 app.use("/", userRoutes);
app.use('/api', Routes);
app.use('/api', ProductRoutes);
app.use('/api', NotificationRoutes);
app.use('/product', productroutes)
app.use('/api',PaymentRoutes);
app.use('/api', reelRoutes);
app.use('/api',reportRoute);
app.use('/api',MarketRoute);
app.use('/task', TaskRoutes);

//scheduler
cron.schedule('0 0 * * *', sendAiQuizes);

// Using custom middleware for handling 404 errors
app.use(notFoundError);

// Using custom middleware for handling general errors
app.use(errorHandler);

// Start the socket server
export const io = new Server(server);

// Socket.io event handling
io.on("connection", (socket) => {
  console.log("A user connected");

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Starting the server and listening on the specified port
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
