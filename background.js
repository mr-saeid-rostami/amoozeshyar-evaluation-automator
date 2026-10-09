chrome.alarms.create("donateCheckAlarm", { periodInMinutes: 60 }); // هر ساعت چک میکند

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "donateCheckAlarm") {
        chrome.storage.local.get(["lastDonateDate"], (result) => {
            let lastDate = result.lastDonateDate || 0;
            let now = new Date().getTime();
            let daysPassed = (now - lastDate) / (1000 * 3600 * 24);

            if (daysPassed >= 15) {
                chrome.storage.local.set({ showDonatePopup: true });
            }
        });
    }
});