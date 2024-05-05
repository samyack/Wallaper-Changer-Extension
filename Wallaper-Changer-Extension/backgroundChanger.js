let currentBackgroundURL = null;
let lastUsedIndex = -1; // Track the index of the last used image

// Set initial background image on extension load
setInitialBackground();

// Set initial alarm for midnight
setMidnightAlarm();

// Function to set initial background image
function setInitialBackground() {
    // Check if background image has already been set
    chrome.storage.local.get(['backgroundURL', 'lastUsedIndex'], function(data) {
        if (!chrome.runtime.lastError && data && data.backgroundURL) {
            currentBackgroundURL = data.backgroundURL;
            lastUsedIndex = data.lastUsedIndex !== undefined ? data.lastUsedIndex : -1;
            updateBackground(currentBackgroundURL);
        } else {
            // If not set or error occurred, select a random image link
            fetch('imageLinks.json')
                .then(response => response.json())
                .then(data => {
                    const imageLinks = data.imageLinks;
                    lastUsedIndex = -1; // Reset last used index
                    selectNewBackground(imageLinks);
                })
                .catch(error => console.error('Error fetching image links:', error));
        }
    });
}

// Set alarm for midnight
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
        // Reset alarm for next midnight
        setMidnightAlarm();
        // Select a new background image
        fetch('imageLinks.json')
            .then(response => response.json())
            .then(data => {
                const imageLinks = data.imageLinks;
                selectNewBackground(imageLinks);
            })
            .catch(error => console.error('Error fetching image links:', error));
    }
});

// Function to select a new background image
function selectNewBackground(imageLinks) {
    let randomIndex = Math.floor(Math.random() * imageLinks.length);
    while (randomIndex === lastUsedIndex) {
        // Ensure the new index is different from the last used index
        randomIndex = Math.floor(Math.random() * imageLinks.length);
    }
    lastUsedIndex = randomIndex;
    currentBackgroundURL = imageLinks[randomIndex];
    // Update the background image
    updateBackground(currentBackgroundURL);
    // Save the background URL and last used index
    chrome.storage.local.set({ 'backgroundURL': currentBackgroundURL, 'lastUsedIndex': lastUsedIndex });
}

// Function to update background
function updateBackground(newBackgroundURL) {
    // Check if document is defined (avoid error when running in background)
    if (typeof document !== 'undefined') {
        document.body.style.backgroundImage = `url('${newBackgroundURL}')`;
    }
}

// Listen for messages from the popup or other parts of the extension
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.command === "changeWallpaper") {
        const direction = message.direction;
        fetch('imageLinks.json')
            .then(response => response.json())
            .then(data => {
                const imageLinks = data.imageLinks;
                if (direction === 'previous') {
                    // Calculate the index of the previous wallpaper
                    let previousIndex = lastUsedIndex - 1;
                    if (previousIndex < 0) {
                        previousIndex = imageLinks.length - 1;
                    }
                    lastUsedIndex = previousIndex;
                } else if (direction === 'next') {
                    // Calculate the index of the next wallpaper
                    let nextIndex = lastUsedIndex + 1;
                    if (nextIndex >= imageLinks.length) {
                        nextIndex = 0;
                    }
                    lastUsedIndex = nextIndex;
                }
                currentBackgroundURL = imageLinks[lastUsedIndex];
                // Update the background image
                updateBackground(currentBackgroundURL);
                // Save the background URL and last used index
                chrome.storage.local.set({ 'backgroundURL': currentBackgroundURL, 'lastUsedIndex': lastUsedIndex });
            })
            .catch(error => console.error('Error fetching image links:', error));
    }
});
