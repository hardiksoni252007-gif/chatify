import User from "../models/user.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utlis.js";
import { sendWelcomeEmail } from "../emails/emailHandlers.js";
import { ENV } from "../lib/env.js";

export const signup = async (req, res) =>{
    const {fullName, email, password} = req.body;

    try {
        if(!fullName || !email || !password){
            return res.status(400).json({message:"All feilds are required"})
        }
        if(password.length < 6){
            return res.status(400).json({message:"Password must be atleat of six character"})
        }

        // checiking if emails are valid or not
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
          return res.status(400).json({message:"Invalid email"});  
        } 

        const user = await User.findOne({email})
        if(user) res.status(400).json({message:"email already existed"})

        // password caching: 123456 => $%@gafsf^&*ahahh
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
        })
        if(newUser){
            //before coderabbit
            // generateToken(newUser._id, res)
            // await newUser.save()

            //after coderabbit
            const savedUser = await newUser.save();
            generateToken(savedUser._id, res);

            res.status(201).json({
                _id:newUser._id,
                fullName:newUser.fullName,
                email:newUser.email,
                profilePic:newUser.profilePic,
            })
            // send welcome email to user

            try {
                await sendWelcomeEmail(savedUser.email, savedUser.fullName, ENV.CLIENT_URL);
            } catch (error) {
                console.error("Failed to send welcome email", error)
            }
        }else{
            return res.status(400).json({message:"Invalid user"})
        }
    } catch (error) {
        console.log("Error in signup controller",error)
        res.status(500).json({message:"Internal server error"})
    }
}

export const login = async (req,res) => {
    const {email, password} = req.body

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }


    try {
        const user = await User.findOne({email})
        if(!user) return res.status(400).json({message:"Invalid Credentials"});
            //!never tell your client wich detail is wrong
        
        const isPasswordCorrect = await bcrypt.compare(password, user.password)
        if(!isPasswordCorrect) return res.status(400).json({message:"Invalid Credentials"});

        generateToken(user._id, res)

        res.status(200).json({
            _id: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        });
    } catch (error) {
        console.error("Error in login controller", error);
        res.ststus(500).json({message: "internal server error"});
    }
}
export const logout = (_,res) => {
    res.cookie("jwt","",{ maxAge:0 });
    res.status(200).json({message: "logged out succesfully"});
}