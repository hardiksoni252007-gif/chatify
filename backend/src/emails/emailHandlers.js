import { resendClient } from "../lib/resend.js";
import { sender } from "../lib/resend.js";
import { createWelcomeEmailTemplate } from '../emails/emailTemplate.js';

export const sendWelcomeEmail = async(email,name,clientUrl)=>{
    const {data,error} = await resendClient.emails.send({
        from:`${sender.name} <${sender.email}>`,
        to:email,
        subject: "Welcome to Chatify",
        html:createWelcomeEmailTemplate(name,clientUrl)
    })

    if(error){
        console.error("Error sending welcome email", error);
        throw new Error("Failed to send welcome email");
    }
    console.log("Welcome email sent successfully", data);
}