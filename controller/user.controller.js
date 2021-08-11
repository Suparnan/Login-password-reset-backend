const User = require("../models/users.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
    host: "in-v3.mailjet.com",
    port: 587,
    auth: {
        user: "7da09124e19b69b6d183438f2b434d3c",
        password: "7a4189a20a20cd3bec8ef371a389814f",
    },
//     service: 'gmail',
//     auth: {
//         user: 'sonuragavan@gail.com',
//         pass: 'Challenger!1'
//     }
});

const userController = {
   
    // createSignup will validate and post the userData in to the Database
    createSignup: async (request, response) => {
        try{
            const {username, email, password, confirmpassword} = request.body;

            if(!username || !email || !password || !confirmpassword){
                return response.status(400).json({message:"All the fields are required"});
             }

            const user = await User.findOne({email})
            if(user) return response.status(400).json({message:"User already exist"});

            const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if(!re.test(email))
                return response.status(400).json({message:"Incorrect email"});

            if(password.length < 6) return response.status(400).json({message:"password should be more than 4 charecters"});

            if(password != confirmpassword)
                return response.status(403).json({message:"Password doesn't match, Please enter the password properly"})
             

            const hashpass =  await bcrypt.hash(password, 10);
            const saveUser = new User({
                username ,
                email ,
                password: hashpass,
            })

            await saveUser.save()
            return response.status(200).json(saveUser)
           
        } catch (error) {
            return response.status(404).json({messge:error.message});
        }
    },

    login: async (request, response) => {
        try{
            const { email, password } = request.body;
            console.log("inside Login",email,password);

            if( !email || !password) {
                return response.status(400).json({message:"All the fields are required"});
            }            
            
            const user = await User.findOne({email});
            if(!user) return response.status(400).json({message:"Email doesn't exist"});
            
            const doMatch = await bcrypt.compare(password, user.password);
            if(!doMatch) return response.status(400).json({message:"Password Incorrect"});
            
            if(doMatch){ 
                const token = jwt.sign({_id:user._id}, "enamoragasiyam", {expiresIn:"1d"});
                const {_id, username, email} = user

                transport.sendMail({
                    to: email,
                    from: 'sonuragavan27@gmail.com',
                    subject: `Signup Successful`,
                    html:`
                    <h1>Welcome, ${user.username}</h1>
                    <h5>Sign-up Successful</h5>
                    `,
                });


                console.log('outside sendmail')
               
                response.status(200).json({
                    mytoken: token,
                    user: {
                        _id,
                        username,
                        email,
                    }
                })
            }
           
          //  return response.status(200).json({message:"Logged-In Successfully"})

        } catch (error) {
            return response.status(400).json({messge:error.message});
        }
    },
    
    reset: async(request, response) => {
        try{
            const { email } = request.body;
            
            if(!email)
            return response.status(400).json({message:"Please enter your Email"});

            const user = await User.findOne({email});
            if(!user) 
            return response.status(400).json({message:"Please enter Registered email"});
            
            // if(user) {
            //     const token = jwt.sign({_id:user._id}, "enamoragasiyam", {expiresIn:"1d"});
                // const options = {
                //     expires: new Date(Date.now() + 900000),
                //     httpOnly: false
                // }

                // response.cookie('jwt-token',token,options);

                // transport.sendMail({
                //     to: user.email,
                //     from: 'sonuragavan27@gmail.com',
                //     subject: `Signup Successful`,
                //     html:`
                //     <h1>Welcome, ${user.username}</h1>
                //     <h5>Sign-up Successful</h5>
                //     `,
                // });

                // console.log('outside sendmail')
                // const {_id, username, email} = user
                // response.status(200).json({
                //     mytoken: token,
                //     user: {
                //         _id,
                //         username,
                //         email,
                //     }
                // })
            // }
            return response.status(200).json({message:"Password reset link will be sent to your email"});    
            

        } catch(error) {
            return response.status(400).json({message:error.message})
        }
    },

    resetform: async(request, response) => {
        try{
            const { username, password, confirmpassword} = request.body;

            if(!username || !password || !confirmpassword){
                return response.status(400).json({message:"All the fields are required"});
             }

            const user = await User.findOne({username})
            if(!user) return response.status(400).json({message:"Please enter appropriate username"});
            
            if(password.length < 6) return response.status(400).json({message:"password should be more than 4 charecters"});

            if(password != confirmpassword)
                return response.status(403).json({message:"Password doesn't match, Please enter the password properly"})
             

            const hashpass =  await bcrypt.hash(password, 10);
            const saveUser = new User({
                password: hashpass,
            })

            await saveUser.save()
            return response.status(200).json(saveUser)
           
        } catch (error) {
            return response.status(404).json({messge:error.message});
        }
    },


}

module.exports = {userController};
