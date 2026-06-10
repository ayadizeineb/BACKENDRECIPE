const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/UserSchema");

// REGISTER
const addUser = async (req, res, next) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        await newUser.save();

        const token = jwt.sign(
            { id: newUser._id },
            process.env.SECRET_KEY,
            { expiresIn: "1w" }
        );

        // hide password
        const userData = newUser.toObject();
        delete userData.password;

        return res.status(201).json({
            message: "User created successfully",
            token,
            user: userData
        });

    } catch (err) {
        console.error("Error creating user:", err);
        return next(err);
    }
};


// LOGIN
const signinUser = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password" });
        }

        const token = jwt.sign(
            { id: existingUser._id },
            process.env.SECRET_KEY,
            { expiresIn: "1w" }
        );

        const userData = existingUser.toObject();
        delete userData.password;

        return res.status(200).json({
            message: "User signed in successfully",
            token,
            user: userData
        });

    } catch (err) {
        console.error("Error signing in user:", err);
        return next(err);
    }
};

//get user by id

const getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (err) {
        return next(err);
    }
};

module.exports = { addUser, signinUser, getUserById };
