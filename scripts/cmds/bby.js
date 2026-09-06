const axios = require("axios");

const mahmud = [
    "baby",
    "bby",
    "babu",
    "bbu",
    "jan",
    "bot",
    "জান",
    "জানু",
    "বেবি",
    "wifey",
    "hina",
    "hinata",
];

const baseApiUrl = async () => {
    const base = await axios.get("https://raw.githubusercontent.com/mahmud-aura/HINATA/main/baseApiUrl.json");
    return base.data.mahmud;
};

module.exports.config = {
    name: "baby",
    aliases: ["bby", "bbu", "jan", "janu", "wifey", "bot", "hinata", "hina"],
    version: "4.7",
    author: "MahMUD",
    countDown: 0,
    role: 0,
    description: "better than all sim simi and most fastest",
    category: "chat",
    guide: {
        en: "{pn} [anyMessage] OR\nteach [YourMessage] - [Reply1], [Reply2], [Reply3]... OR\nremove [YourMessage] OR\nrm [YourMessage] - [indexNumber] OR\nmsg [YourMessage] OR\nlist [all / pageNumber] OR\nedit [YourMessage] - [NeWMessage]\nNote: better than all sim simi and most fastest"
    }
};

module.exports.onStart = async ({ api, event, args, usersData }) => {
    const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68);
    if (module.exports.config.author !== obfuscatedAuthor) {
        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
    }
    
    const rawMsg = args.join(" ");
    const msg = rawMsg.toLowerCase();
    const uid = event.senderID;

    try {
        if (!args[0]) {
            const ran = ["Bolo baby", "I love you", "type !bby hi"];
            return api.sendMessage(ran[Math.floor(Math.random() * ran.length)], event.threadID, event.messageID);
        }

        if (args[0] === "teach") {
            const mahmud = rawMsg.replace(/^teach\s+/i, "");
            const [trigger, ...responsesArr] = mahmud.split(" - ");
            const responses = responsesArr.join(" - ");
            if (!trigger || !responses) return api.sendMessage("❌ | teach [question] - [response1, response2,...]", event.threadID, event.messageID);
            const response = await axios.post(`${await baseApiUrl()}/api/teach`, { trigger, responses, userID: uid });
            const userName = (await usersData.getName(parseInt(uid, 10))) || "Unknown User";
            return api.sendMessage(`✅ Replies added: "${responses}" to "${trigger}"\n• 𝐓𝐞𝐚𝐜𝐡𝐞𝐫: ${userName}\n• 𝐓𝐨𝐭𝐚𝐥: ${response.data.count || 0}`, event.threadID, event.messageID);
        }

        if (args[0] === "remove" || args[0] === "rm") {
            const mahmud = rawMsg.replace(/^(remove|rm)\s+/i, "");
            const [trigger, index] = mahmud.split(" - ");
            if (!trigger || !index || isNaN(index)) return api.sendMessage("❌ | remove [question] - [index]", event.threadID, event.messageID);
            const response = await axios.delete(`${await baseApiUrl()}/api/teach/remove`, { data: { trigger, index: parseInt(index, 10) }, });
            return api.sendMessage(response.data.message, event.threadID, event.messageID);
        }

        if (args[0] === "list") {
            const isAll = args[1] === "all" || !isNaN(args[1]);
            const endpoint = isAll ? "/list/all" : "/list";
            const response = await axios.get(`${await baseApiUrl()}/api/teach${endpoint}`);             
            if (!isAll) return api.sendMessage(response.data.message, event.threadID, event.messageID); let page = parseInt(!isNaN(args[1]) ? args[1] : args[2], 10) || 1;
            const limit = 100; const rawData = response.data.data; const teachers = [];
            for (const userID of Object.keys(rawData)) { let name = "Unknown";  try { name = (await usersData.getName(parseInt(userID, 10))) || "Unknown";  } catch (e) {
            console.error(`getName failed for userID ${userID}:`, e.message); }
            teachers.push({ name, value: rawData[userID] });
         }

            teachers.sort((a, b) => b.value - a.value);
            const totalPages = Math.ceil(teachers.length / limit) || 1;            
            if (page < 1) page = 1; if (page > totalPages) page = totalPages; const start = (page - 1) * limit;
            const paginatedData = teachers.slice(start, start + limit);
            let message = "👑 List of Baby teachers:\n\n";
            for (let i = 0; i < paginatedData.length; i++) { const t = paginatedData[i]; const num = String(start + i + 1).padEnd(3);
            message += `${num}. ${t.name}: ${t.value}\n`; }            
            message += `\n• Total page: [${page}/${totalPages}]`; message += `\n• Total Teacher: ${teachers.length}`; message += `\n• type !baby list all ${page < totalPages ? page + 1 : page} and see next page`;            
            return api.sendMessage(message, event.threadID, event.messageID);
        }

        if (args[0] === "edit") {
            const mahmud = rawMsg.replace(/^edit\s+/i, "");
            const [oldTrigger, ...newArr] = mahmud.split(" - ");
            const newResponse = newArr.join(" - ");
            if (!oldTrigger || !newResponse) return api.sendMessage("❌ | Format: edit [question] - [newResponse]", event.threadID, event.messageID);
            await axios.put(`${await baseApiUrl()}/api/teach/edit`, { oldTrigger, newResponse });
            return api.sendMessage(`✅ Edited "${oldTrigger}" to "${newResponse}"`, event.threadID, event.messageID);
        }

        if (args[0] === "message" || args[0] === "msg") {
            const searchTrigger = args.slice(1).join(" ");
            if (!searchTrigger) return api.sendMessage("Please provide a message to search.", event.threadID, event.messageID); try {
            const response = await axios.get(`${await baseApiUrl()}/api/teach/msg`, { params: { userMessage: `msg ${searchTrigger}` } });
            return api.sendMessage(response.data.message || "No message found.", event.threadID, event.messageID);
          } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || "error";
            return api.sendMessage(errorMessage, event.threadID, event.messageID);
            }
        }

        const attachments = event.attachments || [];
        const response = (await axios.post(`${await baseApiUrl()}/api/baby?text=${encodeURIComponent(msg)}&font=3`, { attachments })).data.reply;

        return api.sendMessage(response, event.threadID, (err, info) => {
            if (!err) {
                global.GoatBot.onReply.set(info.messageID, {
                    commandName: module.exports.config.name,
                    type: "reply",
                    messageID: info.messageID,
                    author: event.senderID,
                    text: response
                });
            }
        }, event.messageID);

    } catch (err) {
        console.error(err);
        api.sendMessage(`${err.response?.data || err.message}`, event.threadID, event.messageID);
    }
};

module.exports.onReply = async ({ api, event }) => {
    if (event.type !== "message_reply") return;
    try {
        const text = event.body?.toLowerCase() || "";
        const attachments = event.attachments || [];
        const response = (await axios.post(`${await baseApiUrl()}/api/baby?text=${encodeURIComponent(text)}&font=3`, { attachments })).data.reply;

        api.sendMessage(response, event.threadID, (err, info) => {
            if (!err) {
                global.GoatBot.onReply.set(info.messageID, {
                    commandName: module.exports.config.name,
                    type: "reply",
                    messageID: info.messageID,
                    author: event.senderID,
                    text: response
                });
            }
        }, event.messageID);
    } catch (err) {
        console.error(err);
    }
};

module.exports.onChat = async ({ api, event }) => {
    try {
        const body = event.body ? event.body.toLowerCase() : "";
        const hasTrigger = mahmud.some(word => body.startsWith(word));

        if (event.type !== "message_reply" && hasTrigger) {
            api.setMessageReaction("🪽", event.messageID, () => {}, true);

            const text = body.replace(/^\S+\s*/, "");
            const attachments = event.attachments || [];

            const randomMessage = [
                "আমাকে ডাকলে ,আমি কিন্তূ কিস করে দেবো😘 ",
                "neo amr boss k message daw 01836298139",
                "গোলাপ ফুল এর জায়গায় আমি দিলাম তোমায় মেসেজ",
                "বলো কি বলবা, সবার সামনে বলবা নাকি?🤭🤏",
                "𝗜 𝗹𝗼𝘃𝗲 𝘆𝗼𝘂__😘😘",
                "𝗕𝗯𝘆 𝗕𝗯𝘆 না করে আমার বস মানে, MahMUD ,MahMUD ও তো করতে পারো😑?",
                "আমার সোনার বাংলা, তারপরে লাইন কি? 🙈",
                "🍺 এই নাও জুস খাও..!𝗕𝗯𝘆 বলতে বলতে হাপায় গেছো না 🥲",
                "হটাৎ আমাকে মনে পড়লো 🙄",
                "𝗕𝗯𝘆 বলে অসম্মান করচ্ছিছ,😰😿",
                "𝗔𝘀𝘀𝗮𝗹𝗮𝗺𝘂𝗹𝗮𝗶𝗸𝘂𝗺 🐤🐤",
                "আমি তোমার সিনিয়র আপু ওকে 😼সম্মান দেও🙁",
                "খাওয়া দাওয়া করসো 🙄",
                "এত কাছেও এসো না,প্রেম এ পরে যাবো তো 🙈",
                "আরে আমি মজা করার mood এ নাই😒",
                "𝗛𝗲𝘆 𝗛𝗮𝗻𝗱𝘀𝗼𝗺𝗲 বলো 😁😁",
                "আরে Bolo আমার জান, কেমন আসো? 😚",
                "একটা BF খুঁজে দাও 😿",
                "oi mama ar dakis na pilis 😿",
                "amr JaNu lagbe,Tumi ki single aso?",
                "আমাকে না দেকে একটু পড়তেও বসতে তো পারো 🥺🥺",
                "তোর বিয়ে হয় নি 𝗕𝗯𝘆 হইলো কিভাবে,,🙄",
                "আজ একটা ফোন নাই বলে রিপ্লাই দিতে পারলাম না_🙄",
                "চৌধুরী সাহেব আমি গরিব হতে পারি😾🤭 -কিন্তু বড়লোক না🥹 😫",
                "আমি অন্যের জিনিসের সাথে কথা বলি না__😏ওকে"
            ];

            if (!text && attachments.length === 0) {
                const babyMessage = randomMessage[Math.floor(Math.random() * randomMessage.length)];
                return await api.sendMessage(babyMessage, event.threadID, (err, info) => {
                    if (!err) {
                        global.GoatBot.onReply.set(info.messageID, {
                            commandName: module.exports.config.name,
                            type: "reply",
                            messageID: info.messageID,
                            author: event.senderID,
                            text: babyMessage
                        });
                    }
                }, event.messageID);
            }

            const response = (await axios.post(`${await baseApiUrl()}/api/baby?text=${encodeURIComponent(text)}&font=3`, { attachments })).data.reply;

            return await api.sendMessage(response, event.threadID, (err, info) => {
                if (!err) {
                    global.GoatBot.onReply.set(info.messageID, {
                        commandName: module.exports.config.name,
                        type: "reply",
                        messageID: info.messageID,
                        author: event.senderID,
                        text: response
                    });
                }
            }, event.messageID);
        }
    } catch (err) {
        console.error(err);
    }
};
