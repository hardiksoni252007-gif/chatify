import express from "express";

let router = express.Router();

router.get("/send", (req, res) =>{
    res.send("Send message endpoint")
})


export default router;