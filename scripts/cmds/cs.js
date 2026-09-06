const axios = require("axios");

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/mahmud-aura/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "cmdstore",
                aliases: ["cmds", "cs"],
                version: "2.7",
                author: "MahMUD",
                countDown: 5,
                role: 0,
                category: "utility",
                description: {
                        en: "Browse, search, and view detailed information of commands from the online store.",
                        vi: "Duyệt, tìm kiếm và xem thông tin chi tiết các lệnh từ cửa hàng trực tuyến."
                },
                guide: {
                        en: "• View command list: {pn}\n• View specific page: {pn} <page_number>\n• Search commands by name: {pn} <search_query>\n• View trending/top commands: {pn} top\n• View latest added commands: {pn} latest\n• View detailed info: {pn} info <command_name>\n• View full usage guide: {pn} rules\n\nNote: Reply with the corresponding number in the list to view quick info.",
                        vi: "• Xem danh sách lệnh: {pn}\n• Xem trang cụ thể: {pn} <số_trang>\n• Tìm kiếm lệnh theo tên: {pn} <từ_khóa>\n• Xem các lệnh thịnh hành/top: {pn} top\n• Xem các lệnh mới thêm: {pn} latest\n• Xem thông tin chi tiết: {pn} info <tên_lệnh>\n• Xem hướng dẫn đầy đủ: {pn} rules\n\nLưu ý: Phản hồi (reply) bằng số thứ tự trong danh sách để xem thông tin nhanh."
                }
        },

        langs: {
                en: {
                        notFound: "No commands found for %1".",
                        notYourReply: "Not your reply.",
                        invalidSelection: "Invalid selection! Please enter a valid number.",
                        error: "API error: %1. Contact MahMUD for help.\n•WhatsApp: 01836298139"
                },
                vi: {
                        notFound: "Không tìm thấy lệnh \"%1\".",
                        notYourReply: "Không phải phản hồi của bạn.",
                        invalidSelection: "Lựa chọn không hợp lệ!",
                        error: "API error: %1. Contact MahMUD for help.\n•WhatsApp: 01836298139"
                }
        },

        onStart: async function ({ api, event, args, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                try {
                        const axiosConfig = { validateStatus: (status) => status >= 200 && status < 500 };

                        if (args[0]?.toLowerCase() === "info") {
                                const cmdName = args.slice(1).join(" ").trim();
                                if (!cmdName) return api.sendMessage("Please provide a command name.\nExample: !cmds info baby", event.threadID, event.messageID);
                                
                                const response = await axios.get(`${await baseApiUrl()}/api/cmdstore/info?name=${encodeURIComponent(cmdName)}&source=info`, axiosConfig);
                                const data = response.data;
                                if (!data?.success) {
                                        api.setMessageReaction("❌", event.messageID, () => {}, true);
                                        return api.sendMessage(getLang("notFound", cmdName), event.threadID, event.messageID);
                                }
                                api.setMessageReaction("✅", event.messageID, () => {}, true);
                                return api.sendMessage(data.displayText, event.threadID, event.messageID);
                        }

                        if (args[0]?.toLowerCase() === "rules") {
                                const response = await axios.get(`${await baseApiUrl()}/api/cmdstore?type=rules`, axiosConfig);
                                const data = response.data;
                                if (!data?.success) {
                                        api.setMessageReaction("❌", event.messageID, () => {}, true);
                                        return api.sendMessage(getLang("error", "Failed to load guide."), event.threadID, event.messageID);
                                }
                                api.setMessageReaction("✅", event.messageID, () => {}, true);
                                return api.sendMessage(data.displayText, event.threadID, event.messageID);
                        }

                        let apiUrl = `${await baseApiUrl()}/api/cmdstore`;
                        if (args[0]?.toLowerCase() === "top") apiUrl += `?type=top`;
                        else if (args[0]?.toLowerCase() === "latest") apiUrl += `?type=latest`;
                        else {
                                const query = args.join(" ").trim();
                                if (query) apiUrl += !isNaN(query) ? `?page=${query}` : `?q=${encodeURIComponent(query)}`;
                        }

                        const response = await axios.get(apiUrl, axiosConfig);
                        const data = response.data;
                        if (!data?.success || !data.commands?.length) {
                                api.setMessageReaction("❌", event.messageID, () => {}, true);
                                return api.sendMessage(getLang("notFound", args.join(" ") || "all"), event.threadID, event.messageID);
                        }

                        api.setMessageReaction("✅", event.messageID, () => {}, true);
                        api.sendMessage(data.displayText, event.threadID, (err, info) => {
                                if (!err) {
                                        global.GoatBot.onReply.set(info.messageID, {
                                                commandName: this.config.name,
                                                messageID: info.messageID,
                                                author: event.senderID,
                                                commands: data.commands
                                        });
                                }
                        }, event.messageID);

                } catch (error) {
                        api.setMessageReaction("❌", event.messageID, () => {}, true);
                        return api.sendMessage(getLang("error", error.message), event.threadID, event.messageID);
                }
        },

        onReply: async function ({ api, event, Reply, getLang }) {
                if (Reply.author !== event.senderID) return api.sendMessage(getLang("notYourReply"), event.threadID, event.messageID);

                const index = parseInt(event.body);
                const list = Reply.commands;

                if (isNaN(index) || index < 1 || index > list.length) return api.sendMessage(getLang("invalidSelection"), event.threadID, event.messageID);

                try {
                        const selected = list[index - 1];

                        const response = await axios.get(`${await baseApiUrl()}/api/cmdstore/info?name=${encodeURIComponent(selected.name)}`);
                        const data = response.data;
                        if (!data?.success) {
                                api.setMessageReaction("❌", event.messageID, () => {}, true);
                                return api.sendMessage(getLang("notFound", selected.name), event.threadID, event.messageID);
                        }

                        api.unsendMessage(Reply.messageID);
                        api.setMessageReaction("✅", event.messageID, () => {}, true);
                        return api.sendMessage(data.displayText, event.threadID, event.messageID);
                } catch (error) {
                        api.setMessageReaction("❌", event.messageID, () => {}, true);
                        return api.sendMessage(getLang("error", error.message), event.threadID, event.messageID);
                }
        }
};
