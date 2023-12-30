import { readFile } from 'fs/promises';

/**
 * Reads the user email from the user file
 * @param {String} fileName 
 * @returns {String} user email (with hidden characters)
 */
export const readUserEmail = async (fileName) => {
    const user = await readFile(fileName, 'utf-8');
    const email = JSON.parse(user).email;
    const hiddenEmail = email.replace(/(?<=.{3}).(?=.*@)/g, '*');
    return hiddenEmail;
}

/**
 * Extracts a list of timestamps from a conversation list
 * @param {GPTConversation[]} conversations
 * @returns {number[]} an array of timestamps, each timestamp is a message
 */
export const extractUserMessageTimestamps = (conversations) => {
    const messages = [];
    for (const conversation of conversations) {
        for (const entryId of Object.keys(conversation.mapping)) {
            const message = conversation.mapping[entryId]?.message;
            if (message && message.author.role === 'user') {
                messages.push(message.create_time * 1000);
            }
        }
    }
    return messages;
}

/**
 * Extracts the date of the first conversation
 * @param {GPTConversation} conversations 
 * @returns {Date} the date of the first conversation
 */
export const extractFirstConversationDate = (conversations) => {
    const firstConversation = conversations.sort((a, b) => a.create_time - b.create_time)[0];
    const firstConversationDate = new Date(firstConversation.create_time * 1000);
    return firstConversationDate;
}

/**
 * Reads a list of conversations from a file
 * @param {String} fileName the file containing the conversations
 * @returns {GPTConversation[]} a list of conversations
 */
export const readConversations = async (fileName) => {
    const conversations = await readFile(fileName, 'utf-8');
    return JSON.parse(conversations);
}

/**
 * Computes the number of messages by week
 * @param {number[]} messages an array of timestamps, each timestamp is a message
 * @returns {number[]} an array of message counts, each count is a week
 */
export const getMessageCountByWeeks = (messages) => {
    const fingerprint = (date) => date.getFullYear() + getWeekNumber(date);
    const messageCountByWeeks = {};
    for (const message of messages) {
        const yearWeek = fingerprint(new Date(message));
        messageCountByWeeks[yearWeek] = (messageCountByWeeks[yearWeek] || 0) + 1;
    }
    return Object.values(messageCountByWeeks);
}

/**
 * Computes the average number of messages by day on a given number of days
 * @param {number[]} messages an array of timestamps, each timestamp is a message
 * @param {number} dayCount number of days to average
 * @returns {number} average number of messages by day
 */
export const getAverageMessageCountDays = (messages, dayCount) => {
    const now = Date.now();
    const dayMs = 86400000;
    const dayCountMs = dayCount * dayMs;
    const messagesInDayCount = messages.filter((message) => now - message < dayCountMs).length;
    return Math.ceil(messagesInDayCount / dayCount);
}

/**
 * Extracts the year and week number from a date
 * @param {Date} date
 * @returns {String} week number
 */
function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return String(Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7));
}
