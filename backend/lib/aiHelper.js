// Daily insight formatter
// {
//     "_id": "68fd3796d1252a50674ccd3d",
//     "date": "2025-10-25T00:00:00.000Z",
//     "user": "68cab9506accf406b01b00c6",
//     "feelingScore": 7,
//     "achievement": "A little work on FIARY",
//     "timeWastedMinutes": 360,
//     "timeWastedNotes": "Minecraft and scrolling",
//     "sleepHours": 10,
//     "sleepNotes": "2-9, 3-6pm",
//     "diaryEntry": "I woke up around 9am, after breakfast did some work on FIARY, after lunch I was feeling under the weather by sneezing and water from eyes so slept from around 2:30 and when i work up it was 6:30 and still there was some signs of cold. So after a wile had dinner then i went to a medical shop for medicine and then had tea and then did some work on FIARY, Pleaed minecraft with aadish from some time then was scrolling and now gonna sleep.\n\nLearnt a new things I can use AI in many other ways to make my project faster.\nI was also frustrated by my previous design of some components in my FIARY project, some parts are very badly designed so i have to redisng and a lot of ediging code. 🫤",
//     "createdAt": "2025-10-25T20:48:22.947Z",
//     "updatedAt": "2025-10-25T20:48:22.947Z",
//     "__v": 0
// },

// {
//     "user": {
//         "_id": "68cab9506accf406b01b00c6",
//         "name": "Ritesh Prajapati",
//         "email": "ritesh@gmail.com",
//         "profilePic": "",
//         "createdAt": "2025-09-17T13:36:16.019Z",
//         "updatedAt": "2025-09-17T13:36:16.019Z",
//         "__v": 0
//     }
// }
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