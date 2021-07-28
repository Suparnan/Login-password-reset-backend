import express from "express";
import mongoose from "mongoose";
import {User} from "./models/users.js"
import cors from "cors";

const app = express();
const PORT = 4180;

const url="mongodb+srv://Suparnan:Guvi@123@cluster0.clkv3.mongodb.net/userAuth";
//const url="mongodb://localhost/userAuth";
mongoose.connect(url,{useNewUrlParser: true,
                      useUnifiedTopology: true 
                     });
const con = mongoose.connection;
con.on('open',() => console.log("Database connected succesfully"));

app.use(express.json());
app.use(cors());

app.get('/', (request, response) => {
    // console.log('Hello There, your GET message is successful')
    // const msge = "your GET message is successful";
    response
    // .status('Hello There, We are in this localhost '+PORT,' and your GET message is successful')
    .send("your GET message is successful");
});

app.get('/users', async (request, response) => {
    const uname = await User.find({});
    response.send(uname);
});

app.get('/use/:email/:pwd',cors(), async (request, response) => {
    const {email} = request.params;
    const {pwd} = request.params;
    const uname = await User.find({email:{$eq:email}},{_id:0,username:0});
    response.send(uname);
});

app.listen(PORT,() => {
    console.log("The express server started successfully in the",+PORT);
})