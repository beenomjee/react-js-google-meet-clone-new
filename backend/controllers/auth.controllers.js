import { User } from "../db/index.js";

export const signUpController = async (req, res) => {
  try {
    let { email, password, fName, lName, file } = req.body;
    if (!email || !password || !fName || !lName)
      return res.status(403).json("All Fields are required!");

    //   checking old user!
    let user = await User.findOne({ email });
    if (user) {
      return res.status(403).json({
        message: "Email already used!",
      });
    }

    // createing new
    user = await User.create({
      email,
      password,
      fName,
      lName,
      file,
    });

    // generating token
    const token = user.generateToken();

    return res.status(201).json({
      fName: user.fName,
      lName: user.lName,
      email: user.email,
      file: user.file,
      _id: user._id,
      token,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: err.message,
    });
  }
};

export const signInController = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(403).json("All Fields are required!");

    //   checking user exist!
    let user = await User.findOne({ email });
    if (!user)
      return res.status(403).json({
        message: "Email not Found!",
      });

    const isPassMatch = await user.comparePassword(password);

    if (!isPassMatch)
      return res.status(403).json({
        message: "Password not correct!",
      });

    // generating token
    const token = user.generateToken();

    return res.status(200).json({
      fName: user.fName,
      lName: user.lName,
      email: user.email,
      file: user.file,
      _id: user._id,
      token,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: err.message,
    });
  }
};
