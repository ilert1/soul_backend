const { exec } = require("child_process");
const https = require("https");

const TG_BOT_TOKEN = "7737204288:AAH_qGJpeHfbGokGmVcaHClcotSwbv1lWrM";
const CHAT_ID = -1002695265804;

class DeployHealthCheck {
  constructor(tgBotToken, chatId) {
    this.tgBotToken = tgBotToken;
    this.chatId = chatId;
    this.url = `https://api.telegram.org/bot${tgBotToken}/sendMessage`;
  }

  makeHealthCheck() {
    exec(
      'curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3005/docs',
      (error, stdout) => {
        console.log("stdout: ", stdout);
        const time = new Date().toLocaleTimeString();
        if (stdout.trim().startsWith("2")) {
          console.log("✅ Healthcheck прошел успешно после деплоя");
          this.sendTgGroupNotificaiton(
            `✅ Healthcheck прошел успешно после деплоя. Время: ${time}.`
          );
        } else {
          console.error("⚠️ Ошибка healthcheck после деплоя");
          this.sendTgGroupNotificaiton(
            `⚠️ Ошибка healthcheck после деплоя. Время: ${time}.`
          );
        }
      }
    );
  }

  sendTgGroupNotificaiton(message) {
    const postData = JSON.stringify({
      chat_id: this.chatId,
      text: message,
    });

    const options = {
      hostname: "api.telegram.org",
      path: `/bot${this.tgBotToken}/sendMessage`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        console.log("Ответ от Telegram:", data);
      });
    });

    req.on("error", (e) => {
      console.error(`Ошибка при отправке запроса: ${e.message}`);
    });

    req.write(postData);
    req.end();
  }
}

const deployHealthCheck = new DeployHealthCheck(TG_BOT_TOKEN, CHAT_ID);

setTimeout(() => deployHealthCheck.makeHealthCheck(), 60000);
