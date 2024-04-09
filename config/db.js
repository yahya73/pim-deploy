import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config();

const databaseName = process.env.DBNAME;
const databaseURL = process.env.DBURL;
mongoose.set("debug", true);
mongoose.Promise = global.Promise;

const connectDb = () => {
  mongoose
    .connect(`mongodb+srv://ihebdebbech20:ihebdebbech20@devdb.c6atpkg.mongodb.net/Mindfulllearn?retryWrites=true&w=majority`,{

    serverApi: {
      version:'1',
      strict: true,
      deprecationErrors: true,
    }
    })
    .then(() => {
      console.log("Connected to database");
      
    })
    .catch((err) => {
      console.log(err);
    });
};

export default connectDb;
