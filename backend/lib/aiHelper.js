const dailyInsightFormatter = (entry, user) => {
    const formattedEntry = `${user.name} feeling score for ${entry.date.toISOString().split('T')[0]} was ${entry.feelingScore} out of 10. 
${user.name.split(' ')[0]} said his achievement was ${entry.achievement}. He slept for ${entry.sleepHours} hours and the sleep notes are: ${entry.sleepNotes}.
${user.name.split(' ')[0]} wasted ${entry.timeWastedMinutes} minutes in the day due to ${entry.timeWastedNotes}.
${user.name.split(' ')[0]}'s journal entry is: ${entry.diaryEntry}.`
    return formattedEntry
};

const normalFormatter = (entry) => {
    return `Entry for Date: ${entry.date.toISOString().split('T')[0]}....
Feeling score: ${entry.feelingScore}/10, Achievement: ${entry.achievement}, ${entry.sleepHours} hours slept, sleep notes: ${entry.sleepNotes}.
Unproductive time: ${entry.timeWastedMinutes} mins because of ${entry.timeWastedNotes}.
Journal Entry: ${entry.diaryEntry}
----ENDS----`
}

const weeklyInsightFormatter = (entries, user) => {
    let formattedPrompt =  `This is the weekly entries ${user.name} made. Review them and find patterns and praise him or scold him for these entries.`
    entries.forEach((e) => {
        formattedPrompt += normalFormatter(e);
    })
    return formattedPrompt
}

const monthlyInsightFormatter = (entries, user) => {
    let formattedPrompt =  `These are the entries ${user.name} made. Review them and find patterns and praise him or scold him for these entries.`
    entries.forEach((e) => {
        formattedPrompt += normalFormatter(e);
    })
    return formattedPrompt
}

module.exports = {dailyInsightFormatter, weeklyInsightFormatter, monthlyInsightFormatter}