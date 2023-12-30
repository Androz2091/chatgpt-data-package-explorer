import chalk from 'chalk';
import date from 'date-and-time';
import asciiChart from 'asciichart';
import { plot } from './chart.js';
import { readUserEmail , readConversations, extractFirstConversationDate, extractUserMessageTimestamps, getMessageCountByWeeks, getAverageMessageCountDays } from './utils.js';

const logStatistics = (title, value, color) => console.log(`${chalk[color](title)}: ${value.toLocaleString('en-US')}`);
const lineBreak = () => console.log('');

(async () => {

    const userFile = './data/user.json';
    const hiddenEmail = await readUserEmail(userFile);

    const conversationsFile = './data/conversations.json';
    const conversations = await readConversations(conversationsFile);

    const firstConversationDate = extractFirstConversationDate(conversations);
    const formattedFirstConversationDate = date.format(firstConversationDate, 'MMMM DD, YYYY');
    const dayCountElapsed = Math.ceil(date.subtract(new Date(), firstConversationDate).toDays());

    const messages = extractUserMessageTimestamps(conversations);
    const totalMessageCount = messages.length;

    console.log(chalk.yellow('🧠 ChatGPT Data Package Explorer 🧠'));
    lineBreak();
    logStatistics('Statistics for', hiddenEmail, 'blue');
    lineBreak();

    logStatistics('You met ChatGPT on', `${formattedFirstConversationDate} (${dayCountElapsed} days ago)`, 'green');
    logStatistics('Total conversations', conversations.length, 'cyan');
    logStatistics('Total messages', totalMessageCount, 'cyan');
    
    lineBreak();

    logStatistics('Average message count per days (beginning)', getAverageMessageCountDays(messages, dayCountElapsed), 'cyan');
    logStatistics('Average message count per days (last month)', getAverageMessageCountDays(messages, 30), 'cyan');
    logStatistics('Average message count per days (last week)', getAverageMessageCountDays(messages, 7), 'cyan');

    lineBreak();

    printGraph(getMessageCountByWeeks(messages));
    
})();

/**
 * Prints the message count by weeks graph
 * @param {number[]} messageCountByWeeks an array of message counts, each count is a week
 * @returns {void}
 */
function printGraph (messageCountByWeeks) {
    const messageCountByWeeksArray = Object.keys(messageCountByWeeks).map((key) => messageCountByWeeks[key]);

    console.log(plot(messageCountByWeeksArray, {
        xArray: new Array(messageCountByWeeksArray.length).fill(6),
        title: 'Message count by weeks',
        xLabel: 'weeks',
        yLabel: 'messages',
        height: 10,
        colors: [
            asciiChart.blue,
        ],
        height: 15,
        width: 70
    }));
}
