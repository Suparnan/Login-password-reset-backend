const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require('cookie-parser')

const app = express();
const PORT = process.env.PORT || 4180;
require("dotenv").config();


//DB connection
const url="mongodb+srv://Suparnan:Guvi@123@cluster0.clkv3.mongodb.net/userAuth";
//const url="mongodb://localhost/userAuth";
mongoose.connect(url,{useNewUrlParser: true,
                      useUnifiedTopology: true 
                     });
const con = mongoose.connection;
con.on('open',() => console.log("Database connected succesfully"));

//Middleware
app.use(express.json());
app.use(cors());

//API Title
app.get('/', (request, response) => {
   response.json({message:"API created"});
});

//Router linking
app.use("/auth", require("./routes/auth.routes.js"));

//Server Connection
app.listen(PORT,() => {
    console.log("The express server started successfully in the",+PORT);
})
