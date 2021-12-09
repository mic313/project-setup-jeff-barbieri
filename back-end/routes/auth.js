const router = require("express").Router();
const jwt = require("jsonwebtoken");
const User = require("../model/User");
const bcrypt = require("bcryptjs");   //i thought it should be require("bcryptjs") but this works instead?

// validation
const { registerValidation, loginValidation } = require("../validation");

//register route
router.post("/register", async (req, res) => {
  // validate the user
  const { error } = registerValidation(req.body);

  //throw validation errors
  if (error) return res.status(400).json({ error: error.details[0].message });
  
  const isEmailExist = await User.findOne({ email: req.body.email });

  // throw error when email already registered
  if (isEmailExist)
    return res.status(400).json({ error: "Email already exists" });
  
  // hash the password
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash(req.body.password, salt);
  
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password, // hashed password
  });
  try {
    const savedUser = await user.save();
    res.json({ error: null, data: savedUser });
  } catch (error) {
    res.status(400).json({ error });
  }
});


// login route
router.post("/login", async (req, res) => {
  
  // validate the user
  const { error } = loginValidation(req.body);
  
  // throw validation errors
  if (error) return res.status(400).json({ error:   error.details[0].message });
  
  const user = await User.findOne({ email: req.body.email });
  
  // throw error when email is wrong
  if (!user) return res.status(400).json({ error: "Email is wrong" });
  
  // check for password correctness
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  console.log("req.body PASSWORD? : ", req.body.password);
  console.log("user PASSWORD? : ", user.password);
  
  if (req.body.password!=user.password)
    return res.status(400).json({ error: "Password is wrong" });
 
  // create token
  const token = jwt.sign(
    // payload data
    {
      name: user.name,
      id: user._id,
    },
    process.env.JWT_SECRET
  );

  res.header("auth-token", token).json({
    error: null,
    data: {
      token,
    },
  });
});

module.exports = router;