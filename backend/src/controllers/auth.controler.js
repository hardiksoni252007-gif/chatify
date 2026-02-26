import User from "../models/user.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utlis.js";
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
            generateToken(newUser._id, res)
            await newUser.save()

            res.status(201).json({
                _id:newUser._id,
                fullName:newUser.fullName,
                email:newUser.email,
                profilePic:newUser.profilePic,
            })
            // send welcome email to user
        }else{
            return res.status(400).json({message:"Invalid user"})
        }
    } catch (error) {
        console.log("Error in signup controller",error)
        res.status(500).json({message:"Internal server error"})
    }
}