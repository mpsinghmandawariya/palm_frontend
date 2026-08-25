const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// ==============================
// REGISTER
// ==============================
const register = async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      dob,
      gender,
      aadhaarTestId,
      password,
      confirmPassword,
      pin,
      initialBalance,
    } = req.body;


    // Required fields
    if (
      !name ||
      !email ||
      !mobile ||
      !dob ||
      !aadhaarTestId ||
      !password ||
      !confirmPassword ||
      !pin
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }


    // Password validation
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }


    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters",
      });
    }


    // PIN validation
    if (!/^\d{4}$/.test(pin)) {
      return res.status(400).json({
        success: false,
        message: "PIN must be exactly 4 digits",
      });
    }


    // Mobile validation
    if (!/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 10-digit mobile number",
      });
    }


    // Email validation
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address",
      });
    }


    // Check existing user
    const existingUser = await User.findOne({
      $or: [{ email }, { mobile }],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email or mobile number already registered",
      });
    }


    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Hash PIN
    const hashedPin = await bcrypt.hash(pin, 10);


    // Wallet balance
    let balance = 5000;

    if (
      initialBalance !== undefined &&
      initialBalance !== null &&
      initialBalance !== ""
    ) {
      balance = Number(initialBalance);

      if (isNaN(balance) || balance < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid initial balance",
        });
      }
    }


    // Create user
    const user = await User.create({
      name,
      email,
      mobile,
      dob,
      gender,
      aadhaarTestId,
      password: hashedPassword,
      pin: hashedPin,
      walletBalance: balance,
    });


    // Generate JWT
    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );


    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        walletBalance: user.walletBalance,
        palmRegistered: user.palmRegistered,
      },
    });


  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



// ==============================
// LOGIN
// ==============================
const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;


    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Email/mobile and password are required",
      });
    }


    // Find using email OR mobile
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { mobile: identifier },
      ],
    });


    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid login credentials",
      });
    }


    // Compare password
    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );


    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid login credentials",
      });
    }


    // JWT
    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );


    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        walletBalance: user.walletBalance,
        palmRegistered: user.palmRegistered,
      },
    });


  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



module.exports = {
  register,
  login,
};