const User = require("../models/users.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const transport = nodemailer.createTransport({
    host: "in-v3.mailjet.com",
    port: 587,
    auth: {
        user: "7da09124e19b69b6d183438f2b434d3c",
        password: "7a4189a20a20cd3bec8ef371a389814f",
    },
});

const userController = {

    // createSignup will validate and post the userData in to the Database
    createSignup: async (request, response) => {
        try {
            const { username, email, password, confirmpassword } = request.body;

            if (!username || !email || !password || !confirmpassword) {
                return response.status(400).json({ message: "All the fields are required" });
            }

            const user = await User.findOne({ email })
            if (user) return response.status(400).json({ message: "User already exist" });

            const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (!re.test(email))
                return response.status(400).json({ message: "Incorrect email" });

            if (password.length < 6) return response.status(400).json({ message: "password should be more than 4 charecters" });

            if (password != confirmpassword)
                return response.status(403).json({ message: "Password doesn't match, Please enter the password properly" })


            const hashpass = await bcrypt.hash(password, 10);
            const saveUser = new User({
                username,
                email,
                password: hashpass,
            })

            await saveUser.save()
            return response.status(200).json(saveUser)

        } catch (error) {
            return response.status(404).json({ messge: error.message });
        }
    },

    login: async (request, response) => {
        try {
            const { email, password } = request.body;
            console.log("inside Login", email, password);

            if (!email || !password) {
                return response.status(400).json({ message: "All the fields are required" });
            }

            const user = await User.findOne({ email });
            if (!user) return response.status(400).json({ message: "Email doesn't exist" });

            const doMatch = await bcrypt.compare(password, user.password);
            if (!doMatch) return response.status(400).json({ message: "Password Incorrect" });

            if (doMatch) {
                const token = jwt.sign({ _id: user._id }, "enamoragasiyam", { expiresIn: "1d" });
                const { _id, username, email } = user

                transport.sendMail({
                    to: email,
                    from: 'sonuragavan27@gmail.com',
                    subject: `Signup Successful`,
                    html: `
                    <h1>Welcome, ${user.username}</h1>
                    <h5>Login Successful</h5>
                    `,
                });

                console.log('outside sendmail');
                response.status(200).json({
                    mytoken: token,
                    user: {
                        _id,
                        username,
                        email,
                    }
                })
            }

            return response.status(200).json({ message: "Logged-In Successfully" })

        } catch (error) {
            return response.status(400).json({ messge: error.message });
        }
    },

    reset: async (request, response) => {

        const { email } = request.body;
        crypto.randomBytes(32, (err, buffer) => {
            if (err) {
                console.log(err);
            }
            const token = buffer.toString('hex');
            User.findOne({ email: email })
                .then(async (user) => {
                    if (!user) {
                        return response.status(400).json({ message: "Please enter Registered email" });
                    }
                    user.resetToken = token;
                    user.expireTime = Date.now + 3600000;
                    user.save()
                        .then((result) => {
                            transport.sendMail({
                                to: user.email,
                                from: 'sonuragavan27@gmail.com',
                                subject: `Signup Successful`,
                                html: `
                            <h1>Welcome, ${user.username}</h1>
                            <p>Please click on the given <a href="http://localhost/auth/resetform">here </a>and enter the pass code</p>
                            <h5>You're Passcode is ${token}</h5>
                            `,
                            });
                            response.json({ message: "Check your email" });
                        })
                })
        })
    },

    resetform: async (request, response) => {

        const { sentToken, password, confirmpassword } = request.body;

        if (!sentToken || !password || !confirmpassword) {
            return response.status(400).json({ message: "All the fields are required" });
        }

        User.findOne({ resetToken: sentToken }, { expireTime: { $gt: Date.now() } })
            .then(user => {
                if (!user || password != confirmpassword) {
                    return response.status(422).json({ message: "Please try again" });
                }
                bcypt.hash(password, 12)
                    .then(hashpass => {
                        user.password = hashpass
                        user.resetToken = undefined
                        user.expireTime = undefined
                        user.save()
                            .then(() => {
                                return response.status(200).json({ message: "Password updated successfully" })
                            })
                    })
            })
    }
}

module.exports = { userController };
