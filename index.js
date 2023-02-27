// import pkg from "./library/header"
const express = require("express");
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { Configuration, OpenAIApi } = require("openai");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.sendFile("index.html", { root: __dirname });
});

const client = new Client({
  puppeteer: {
    headless: true,
    args: [ "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-accelerated-2d-canvas",
    "--no-first-run",
    "--no-zygote",
    "--single-process", // <- this one doesn't works in Windows
    "--disable-gpu",],

  },
  authStrategy: new LocalAuth({
    clientId: "client-one",
  }),
});

client.initialize();

client.on("authenticated", (session) => {
  console.log("WHATSAPP WEB => Authenticated");
});

const configuration = new Configuration({
  apiKey: "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",
});
const openai = new OpenAIApi(configuration);

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", async () => {
  console.log("WhatsApp is ready");
});

client.on("message", async (message) => {
 if(message.body.charAt(0)==="." || message.body.charAt(1)==="." || message.body.charAt(2)==="."){
  if (message.body.includes(".ai")) {
    if(message.body.includes("porn")){
      return message.reply("*Your Question contains the words related to pornographic and it is against our policy.*");
    }
    try {
      const body = message.body.slice(4);
      if (body.length > 0) {
        runCompletion(openai, message, body);
      } else {
        message.reply(
          "*Your Question is Empty* \n\n *Please use ->* .ai Your Question"
        );
      }
    } catch (error) {
      console.log(error)
    }
  }else{
    message.reply("Command Not Found.\n\n*Use :* .ai your-questions");
  }
 }
  
});

async function runCompletion(openai, message, body) {
  message.reply(
    `😎😎 *Please wait, while your response is being generated* \n\n *it may take time depending upon your internet speed and length of response.* 😎😎`
  );
  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      max_tokens: 1000,
      prompt: body,
    });
    if(completion.data){
      const data = completion.data.choices[0].text;
      if(data.length>0){
        message.reply(
          `❓) ${body}\n\nAns: 👇 Total Length: ${data.length} \n\n${data.slice(2)}`
        );
      }else{
        message.reply("Something went Wrong.\n Please try again!!")
      }
    }
  } catch (error) {
    console.log(error);
  }
}

const port = process.env.PORT || 8000;
app.listen(port, function () {
  console.log("App is running on*:" + port);
});
