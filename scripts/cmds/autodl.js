const axios = require("axios");
const fs = require("fs");

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
        return base.data.mahmud69;
};

module.exports = {
        config: {
                name: "autodl",
                version: "2.7",
                author: "MahMUD",
                countDown: 0,
                role: 0,
                description: {
                        en: "Auto download video from Tiktok, Facebook, Instagram, YouTube, and more",
                        vi: "Tự động tải xuống video từ Tiktok, Facebook, Instagram, YouTube và nhiều hơn nữa"
                },
                category: "media",
                guide: {
                        en: '   {pn} <video_link>: Automatically download videos from TikTok, YouTube, Twitter/X, Facebook, Instagram, Tumblr, Threads, Spotify, SoundCloud, Snapchat, Reddit, Pinterest, LinkedIn, Kuaishou, Kwai, Douyin, Dailymotion, CapCut, and Bluesky'
                                + '\n   (Or use by replying to a message containing a link)',
                        vi: '   {pn} <video_link>: Tự động tải video từ TikTok, YouTube, Twitter/X, Facebook, Instagram, Tumblr, Threads, Spotify, SoundCloud, Snapchat, Reddit, Pinterest, LinkedIn, Kuaishou, Kwai, Douyin, Dailymotion, CapCut và Bluesky'
                                + '\n   (Hoặc sử dụng bằng cách trả lời tin nhắn chứa liên kết)'
                }
        },

        langs: {
                en: {
                        defaultCaption: "Downloaded Video",
                        error: "× Failed to download video.\n•WhatsApp: 01836298139"
                },
                vi: {
                        defaultCaption: "Video Đã Tải Xuống",
                        error: "× Không thể tải xuống video.\n•WhatsApp: 01836298139"
                }
        },

        onStart: async function () {},

        onChat: async function ({ api, event, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }
                
                let textInput = event.body ? event.body.trim() : "";

                try {
                        const exactUrlMatch = textInput.match(/^https?:\/\/[^\s]+$/i);
                        if (!exactUrlMatch) return; 

                        const mahmud = exactUrlMatch[0]; 

                        if (
                                mahmud.includes("tiktok.com") ||
                                mahmud.includes("youtube.com") || 
                                mahmud.includes("youtu.be") ||
                                mahmud.includes("twitter.com") || 
                                mahmud.includes("x.com") ||
                                mahmud.includes("facebook.com") || 
                                mahmud.includes("fb.watch") ||
                                mahmud.includes("instagram.com") ||
                                mahmud.includes("tumblr.com") ||
                                mahmud.includes("threads.net") ||
                                mahmud.includes("spotify.com") ||
                                mahmud.includes("soundcloud.com") ||
                                mahmud.includes("snapchat.com") ||
                                mahmud.includes("reddit.com") ||
                                mahmud.includes("pinterest.com") || 
                                mahmud.includes("pin.it") ||
                                mahmud.includes("linkedin.com") ||
                                mahmud.includes("kuaishou.com") || 
                                mahmud.includes("kwai.com") ||
                                mahmud.includes("douyin.com") ||
                                mahmud.includes("dailymotion.com") || 
                                mahmud.includes("dai.ly") ||
                                mahmud.includes("capcut.com") ||
                                mahmud.includes("bsky.app")
                        ) {
                             api.setMessageReaction("🐤", event.messageID, (err) => {}, true);
                                
                                if (!fs.existsSync(__dirname + "/cache")) fs.mkdirSync(__dirname + "/cache");
                                const path = __dirname + "/cache/mahmud.mp4";

                                const response = await axios.get(`${await baseApiUrl()}/api/download?url=${encodeURIComponent(mahmud)}`);
                                if (!response.data || !response.data.result) throw new Error("Failed to video URL");

                                const videoUrl = response.data.result;
                                const vid = (await axios.get(videoUrl, { responseType: "arraybuffer" })).data;
                                fs.writeFileSync(path, Buffer.from(vid, "binary"));

                                api.setMessageReaction("🪽", event.messageID, (err) => {}, true);
                                api.sendMessage(
                                        {
                                                body: response.data.cp || getLang("defaultCaption"),
                                                attachment: fs.createReadStream(path),
                                        },
                                        event.threadID,
                                        () => fs.unlinkSync(path),
                                        event.messageID
                                );
                        }
                } catch (e) {
                        api.setMessageReaction("❎", event.messageID, (err) => {}, true);
                }
        },
};
