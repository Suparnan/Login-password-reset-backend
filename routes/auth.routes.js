import express from 'express';
import { userSchema } from "./models/users.js"

const bcrypt = require('bcrypt');
const router = express.Router();

router.post("/signin-user", (req,res,next) => {
    let getUser;
    userSchema.findOne({email: req.body.email})
    .then(user => {
        if(!user) {
            return res.status(401).json({message:'Auth Failed'});
        }
        getUser = user;
        return bcrypt.compare(req.body.password, user.password);
    })
    .then(response => {
        if(!response) {
            return res.status(401).json({message:'Auth Failed'});
        }
        let jwtToken = jwt.sign({
            email: getUser.email,
        }, "longer secret is better",{
            expiry: "2h"
        });
        res.status(200).json({
            token: jswToken,
            expiresIn : 6600,
            msg: getUser
        })    
        .catch((err) => {
            return res.status(401).json({message:'Auth Failed'});
        });
    });
});


module.exports = router;