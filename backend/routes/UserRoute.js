const express = require("express");
const router = express.Router();
const userController = require("../controllers/UserController");

router.post("/", userController.addUser);
router.post("/signin", userController.signinUser);
router.get("/:id", userController.getUserById);



module.exports = router;