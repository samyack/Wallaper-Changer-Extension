document.addEventListener('DOMContentLoaded', function() {
    const toggleSwitch = document.getElementById('toggleSwitch');
    const toggleStatus = document.getElementById('toggleStatus');
    const previousWallpaperBtn = document.getElementById('prevButton');
    const nextWallpaperBtn = document.getElementById('nextButton');

    // Check if the extension is enabled by default
    chrome.management.get('jgljfcgfldbadoohflpjbheloooggmdm', function(info) {
        const isEnabled = info.enabled;
        toggleSwitch.checked = isEnabled;
        toggleStatus.textContent = isEnabled ? 'Extension is currently ON' : 'Extension is currently OFF';
    });

    // Toggle extension state when switch is clicked
    toggleSwitch.addEventListener('change', function() {
        const enabled = toggleSwitch.checked;
        chrome.storage.sync.set({ 'enabled': enabled }, function() {
            toggleStatus.textContent = enabled ? 'Extension is currently ON' : 'Extension is currently OFF';
            updateExtensionState(enabled);
        });

        // Enable/disable the extension based on the toggle switch state
        if (enabled) {
            chrome.management.setEnabled('jgljfcgfldbadoohflpjbheloooggmdm', true);
        } else {
            chrome.management.setEnabled('jgljfcgfldbadoohflpjbheloooggmdm', false);
        }
    });

    // Update extension state based on toggle switch
    function updateExtensionState(enabled) {
        chrome.runtime.sendMessage({ command: "toggleExtension", enabled: enabled });
    }

    // Previous Wallpaper button click event
    previousWallpaperBtn.addEventListener('click', function() {
        changeWallpaper('previous');
    });

    // Next Wallpaper button click event
    nextWallpaperBtn.addEventListener('click', function() {
        changeWallpaper('next');
    });

    // Function to change wallpaper
    function changeWallpaper(direction) {
        // Send message to background script to change the wallpaper
        chrome.runtime.sendMessage({ command: "changeWallpaper", direction: direction });
    }
});
