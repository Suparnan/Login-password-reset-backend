const router = require("express").Router();
const {userController} = require("../controller/user.controller.js");

router.post("/signup", userController.createSignup); //Register 
router.post("/login", userController.login); //Login
router.post("/reset", userController.reset); //reset email 
router.post("/resetform", userController.resetform); //reset password

module.exports = router;
