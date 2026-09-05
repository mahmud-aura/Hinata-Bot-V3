const axios = require("axios");
const fs = require("fs");
const path = require("path");

const mahmud = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "slap",
                version: "2.7",
                author: "MahMUD",
                countDown: 10,
                role: 0,
                description: {
                        en: "Give someone a slap effect",
                        vi: "Tạo hiệu ứng slap cho ai đó"
                },
                category: "fun",
                guide: {
                        en: '   {pn} <@tag>: Give slap effect by tagging'
                                + '\n   {pn} <uid>: Create effect using UID'
                                + '\n   (Or use by replying to a message)',
                        vi: '   {pn} <@tag>: Tạo hiệu ứng slap bằng cách gắn thẻ'
                                + '\n   {pn} <uid>: Tạo hiệu ứng bằng UID'
                                + '\n   (Hoặc phản hồi tin nhắn)'
                }
        },

        langs: {
                en: {
                        noTarget: "× Baby, mention, reply, or provide UID of the target.",
                        success: "Baby, it’s just for fun. Don’t take it seriously.\n• 𝐄𝐟𝐟𝐞𝐜𝐭: 𝐒𝐥𝐚𝐩\n• 𝐓𝐚𝐫𝐠𝐞𝐭: %1",
                        error: "API error: %1. Contact MahMUD for help.\n•WhatsApp: 01836298139"
                },
                vi: {
                        noTarget: "× Cưng ơi, hãy gắn thẻ, phản hồi hoặc cung cấp UID mục tiêu.",
                        success: "Baby, it’s just for fun. Don’t take it seriously.\n• 𝐄𝐟𝐟𝐞𝐜𝐭: 𝐒𝐥𝐚𝐩\n• 𝐓𝐚𝐫𝐠𝐞𝐭: %1",
                        error: "API error: %1. Contact MahMUD for help.\n•WhatsApp: 01836298139"
                }
        },

        onStart: async function ({ api, event, args, message, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                const { senderID, mentions, messageReply, messageID } = event;
                let id2;
                let targetName = "";

                if (messageReply) {
                        id2 = messageReply.senderID;
                } else if (Object.keys(mentions).length > 0) {
                        id2 = Object.keys(mentions)[0];
                } else if (args[0] && !isNaN(args[0])) {
                        id2 = args[0];
                } else {
                        id2 = senderID;
                }

                try {
                        const userInfo = await api.getUserInfo(id2);
                        if (userInfo && userInfo[id2]) {
                                targetName = userInfo[id2].name || userInfo[id2].firstName || "User";
                        } else {
                                targetName = "User";
                        }
                } catch (e) {
                        targetName = "User";
                }

                if (!id2) return message.reply(getLang("noTarget"));

                api.setMessageReaction("⏳", messageID, () => { }, true);

                const cacheDir = path.join(__dirname, "cache");
                const filePath = path.join(cacheDir, `slap_${id2}.png`);

                try {
                        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

                        const response = await axios.get(`${await mahmud()}/api/fun?type=slap&user=${id2}`, { responseType: "arraybuffer" });
                        
                        fs.writeFileSync(filePath, Buffer.from(response.data));
 
                        api.setMessageReaction("🪽", messageID, () => { }, true);
  
                        return message.reply({
                                body: getLang("success", targetName),
                                attachment: fs.createReadStream(filePath)
                        }, () => {
                                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                        });

                } catch (err) {
                        console.error("error:", err);
                        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                        return message.reply(getLang("error", err.message));
                }
        }
};
