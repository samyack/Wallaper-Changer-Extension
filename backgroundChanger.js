const imageLinks = [
    "https://images.unsplash.com/photo-1542384701-9eaf70a33558?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1551641506-ee5bf4cb45f1?q=80&w=2968&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1522961364055-ae8ee2526003?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1503385824845-4f3407ce5e03?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1517210067403-d86a5703516f?q=80&w=2831&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/flagged/photo-1575555201693-7cd442b8023f?q=80&w=3000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1539278311020-fe8d86254350?q=80&w=2938&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1563503136947-cc262fa1e423?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1588729626776-8d97bdce8e08?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://i.pinimg.com/originals/7a/3e/36/7a3e36cf8e864d6fb605533a5c5522d8.jpg"
];

let usedIndexes = []; // Array to track used indexes

// Set initial alarm for midnight
setMidnightAlarm();

// Function to set alarm for midnight
function setMidnightAlarm() {
    const now = new Date();
    const midnight = new Date(
        now.getFullYear(), 
        now.getMonth(), 
        now.getDate() + 1, // Next day
        0,                  // Hour
        0,                  // Minute
        0                   // Second
    );

    // Calculate time until midnight
    const timeUntilMidnight = midnight.getTime() - now.getTime();

    // Set alarm for midnight
    chrome.alarms.create('midnightAlarm', {
        when: Date.now() + timeUntilMidnight
    });
}

// Handle alarm
chrome.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name === 'midnightAlarm') {
        // Reset used indexes array if all images are used
        if (usedIndexes.length === imageLinks.length) {
            usedIndexes = [];
        }

        // Get a random unused index
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * imageLinks.length);
        } while (usedIndexes.includes(randomIndex));
        usedIndexes.push(randomIndex);

        // Get new image URL using random index
        const newBackgroundURL = imageLinks[randomIndex];

        // Update background
        chrome.action.setBadgeText({text: 'BG'});
        chrome.action.setBadgeBackgroundColor({color: [255, 0, 0, 255]});
        chrome.action.setTitle({title: 'Changing Background'});

        // Send message to update background
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.scripting.executeScript({
                target: {tabId: tabs[0].id},
                function: updateBackground,
                args: [newBackgroundURL]
            });
        });

        // Reset alarm for next midnight
        setMidnightAlarm();
    }
});

// Function to update background
function updateBackground(newBackgroundURL) {
    document.body.style.backgroundImage = `url('${newBackgroundURL}')`;
    localStorage.setItem('backgroundURL', newBackgroundURL);
    // console.log("new bg");
    // location.reload();
}
