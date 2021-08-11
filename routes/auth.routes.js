const router = require("express").Router();
const {userController} = require("../controller/user.controller.js");

router.post("/signup", userController.createSignup);
router.post("/login", userController.login);
router.post("/reset", userController.reset);

module.exports = router;
