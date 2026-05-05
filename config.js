module.exports = {
    port: 3000,

    // 🔒 Change this in production
    apiKey: process.env.API_KEY || "CHANGE_THIS_SECRET",

    // Optional: lock target URL
    allowedTarget: "https://rcclive.nationalbank.co.ke/AmaliWebService/FileManager.asmx"
};