const router = require("express").Router();
const User = require("../model/User");

// validation
const { registerValidation } = require("../validation");
router.post("/register", async (req, res) => {
  // validate the user
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
const isEmailExist = await User.findOne({ email: req.body.email });
if (isEmailExist)
return res.status(400).json({ error: "Email already exists" });
const user = new User({
  name: req.body.name,
  email: req.body.email,
  password: req.body.password,
});
  try {
    const savedUser = await user.save();
    res.json({ error: null, data: savedUser });
  } catch (error) {
    res.status(400).json({ error });
  }
});
module.exports = router;