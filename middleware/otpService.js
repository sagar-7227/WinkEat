const otpGenerator = require("otp-generator");
const OTPModel = require("../models/otp");
const UserModel = require("../models/User");
// dotenv.config({ path: "./config.env" });



const sendOTP = async (username, mobile, name) => {
    
  try {
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      number: true,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    console.log(otp);
    
    await addNewOTP(otp, 15, username, "PENDING");
    await sendVerificationMessage(
      {
        name,
        otp,
      },
      mobile
    );
    return {
      success: true,
      message: "OTP sent successfully",
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const reSendOTP = async (username, mobile, name) => {
    const user=await UserModel.findOne({mobileNo:mobile});
    console.log(user);
    if(user.status == 'pending'){
        try {
            await rejectPendingOTP(username);
            console.log(mobile);
            return await sendOTP(username, mobile, name);
          } catch (error) {
            console.error(error);
            throw error;
          }
    }
    else{
        return {
            success: false,
            message: "User already verified",
          };
    }
 
};

const verifyOTP = async (username, otp) => {
  try {
    const validOTP = await OTPModel.findOne({
      otp,
      username,
      status: "PENDING",
      expireIn: { $gte: new Date().getTime() },
    });

    if (validOTP) {
      await OTPModel.updateOne(
        { _id: validOTP._id },
        { $set: { status: "CONFIRMED" } }
      );
      await UserModel.updateOne({ username }, { $set: { status: "VERIFIED" } });
      return {
        success: true,
        message: "User verified",
      };
    }
    throw new Error("Invalid OTP");
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// const sendVerificationMessage = (params, mobileNumber) => {
    
//   return courier.send({
//     message: {
//     courier:{},
//       to: {
//         data: params,
//         phone_number: mobileNumber,
//       },
//       content: {
//         title: "XYZ Verification",
//         body: "Hi {{name}},\nYour verification code for XYZ is {{otp}}.",
//       },
//       routing: {
//         method: "single",
//         channels: ["sms"],
//       },
//     },
//   });
// };

const sendVerificationMessage = async (params, mobileNumber) => {
   console.log("Hello i am in "+ params.name+mobileNumber);
    const accountSid = process.env.TWILIO_ACCOUNT_SID || "AC077001f67e4f778b21ee3b27c8748f0c"; 
    const authToken = process.env.TWILIO_AUTH_TOKEN || "2fef3f874d2af21b177f0111beccc06e";
    const client = require('twilio')(accountSid, authToken); 
 
    await client.messages 
      .create({   
        from: process.env.Twilio_Number || '+12569524213',
        body: `Hi ${params.name},\nYour verification code for XYZ is ${params.otp}, Use this before 15 mins.`,     
         to: `+91${mobileNumber}`,
       }) 
      .then(message => console.log(message.sid)) 
      .done();
      console.log("Done")
};
const addMinutesToDate = (date, minutes) => {
  return new Date(date.getTime() + minutes * 60000);
};

const addNewOTP = (otp, expirationTime, username, status) => {
  const otpModel = new OTPModel({
    otp,
    expireIn: addMinutesToDate(new Date(), expirationTime),
    username,
    status,
  });
  return otpModel.save();
};

const rejectPendingOTP = (username) => {
  return OTPModel.updateMany(
    { username, status: "PENDING" },
    { $set: { status: "REJECTED" } }
  );
};

module.exports = {
  sendOTP,
  reSendOTP,
  verifyOTP,
};
