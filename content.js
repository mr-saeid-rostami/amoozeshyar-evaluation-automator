
const DONATE_LINK = "https://hi.amoozeshjo.workers.dev/"; 
const GITHUB_LINK = "https://github.com/mr-saeid-rostami"; 

let isBotRunning = false;
let tableFound = false;

function updateBotState(state) {
    let bot = document.getElementById("amz-minimized-bot");
    if (!bot) return;
    bot.className = ""; 
    if (state === 'active') {
        bot.classList.add("bot-active");
    } else if (state === 'error') {
        bot.classList.add("bot-error");
    } else {
        bot.classList.add("bot-inactive");
    }
}

function injectUI() {
    if (document.getElementById("amz-bot-panel")) return;

    let logoUrl = chrome.runtime.getURL("logo.png");
    
    let minBot = document.createElement("div");
    minBot.id = "amz-minimized-bot";
    minBot.className = "bot-inactive";
    minBot.style.backgroundImage = `url('${logoUrl}')`;
    document.body.appendChild(minBot);

    let panel = document.createElement("div");
    panel.id = "amz-bot-panel";
    panel.innerHTML = `
        <div class="amz-header">
            <img src="${logoUrl}" alt="Logo">
            <span class="amz-title">ربات هوشمند ارزشیابی آموزشیار</span>
            <button id="amz-minimize-btn" title="کوچک کردن">_</button>
        </div>
        <div id="amz-rules" class="amz-copyright">
            این افزونه برای تسریع نظرسنجی آموزشیار دانشگاه آزاد اسلامی طراحی و توسعه یافته.<br>
            حقوق کپی رایت محفوظ و متعلق به <a href="${GITHUB_LINK}" target="_blank">سعید رستمی</a> میباشد.<br><br>
            <b>اخطار:</b> هرگونه کپی برداری از این برنامه و ایده ی آن بدون هماهنگی با برنامه نویس در اخلاق نیست.
            <br><br>
            <button id="amz-accept-rules" class="amz-btn" style="padding:5px;">قوانین را میپذیرم</button>
        </div>
        
        <div id="amz-main-app" style="display:none;">
            <div class="amz-status-box">
                <div id="amz-stats">در حال بررسی صفحه...</div>
                <div class="amz-log" id="amz-logger">آماده به کار...</div>
            </div>
            
            <p style="font-size:10px; color:#e91e63; text-align:justify; line-height:1.5;">
                <b>هشدار:</b> پس از شروع به موس و کیبورد دست نزنید.<br> 
                اگر سایت گیر کرد نگران نباشید ربات ما خودش درستش میکنه. اگر حس کردید پس از پایان کار ربات، همچنان نطرسنجی خالی است، مشکل را با برنامه نویس در میان بگذارید.
            </p>
            
            <button id="amz-start-btn" class="amz-btn">شروع خودکار ارزشیابی</button>
            <button id="amz-stop-btn" class="amz-btn" style="display:none;">متوقف کردن ربات (یا کلید P)</button>
            
            <div class="amz-footer">
                <a href="${DONATE_LINK}" target="_blank">آموزش جو</a>
                <span>All rights reserved 2026</span>
                <a href="${GITHUB_LINK}" target="_blank">گیت‌هاب</a>
            </div>
        </div>
    `;
    document.body.appendChild(panel);

    document.getElementById("amz-minimize-btn").onclick = () => {
        document.getElementById("amz-bot-panel").style.transform = "scale(0)";
        setTimeout(() => {
            document.getElementById("amz-bot-panel").style.display = "none";
            document.getElementById("amz-minimized-bot").style.display = "block";
        }, 300);
    };

    document.getElementById("amz-minimized-bot").onclick = () => {
        document.getElementById("amz-minimized-bot").style.display = "none";
        document.getElementById("amz-bot-panel").style.display = "block";
        setTimeout(() => {
            document.getElementById("amz-bot-panel").style.transform = "scale(1)";
        }, 10);
    };

    chrome.storage.local.get(["rulesAccepted"], (res) => {
        if (res.rulesAccepted) {
            document.getElementById("amz-rules").style.display = "none";
            document.getElementById("amz-main-app").style.display = "block";
            checkCurrentPage();
        }
    });

    document.getElementById("amz-accept-rules").addEventListener("click", () => {
        chrome.storage.local.set({ rulesAccepted: true });
        document.getElementById("amz-rules").style.display = "none";
        document.getElementById("amz-main-app").style.display = "block";
        checkCurrentPage();
    });

    // دکمه شروع
    document.getElementById("amz-start-btn").addEventListener("click", () => {
        chrome.storage.local.set({ botRunning: true, evaluatedLinks: [], returningFromForm: false });
        isBotRunning = true;
        updateUIButtons(true);
        updateBotState('active');
        speak("عملیات شروع شد...");
        startProcess();
    });

    document.getElementById("amz-stop-btn").addEventListener("click", stopBot);
}

function updateUIButtons(running) {
    let startBtn = document.getElementById("amz-start-btn");
    let stopBtn = document.getElementById("amz-stop-btn");
    if(startBtn && stopBtn) {
        startBtn.style.display = running ? "none" : "block";
        stopBtn.style.display = running ? "block" : "none";
    }
}

function stopBot() {
    chrome.storage.local.set({ botRunning: false });
    isBotRunning = false;
    updateUIButtons(false);
    updateBotState('inactive');
    speak("ربات متوقف شد.");
}

function speak(text) {
    let logger = document.getElementById("amz-logger");
    if(logger) logger.innerText = "🗣️ " + text;
    console.log("Amoozeshyar Bot:", text);
}

// توقف با کیبورد (دکمه P)
document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === 'p' && isBotRunning) {
        stopBot();
    }
});

function checkCurrentPage() {
    chrome.storage.local.get(["botRunning", "evaluatedLinks"], (res) => {
        isBotRunning = res.botRunning;
        let evaluatedLinks = res.evaluatedLinks || [];

        let table = document.getElementById("panel__2");
        let formSaveBtn = document.querySelector('input[onclick*="saveQuestionarieResponse"]');
        
        if (isBotRunning) {
            updateUIButtons(true);
            updateBotState('active');
        } else {
            updateUIButtons(false);
            updateBotState('inactive');
        }
        
        if (table) {
            table.classList.add("amz-highlight-table");
            tableFound = true;
            
            let rows = table.querySelectorAll("tbody tr");
            let total = 0;
            let pending = 0;

            rows.forEach(row => {
                let isPending = row.querySelector(".mdi-close-box-outline");
                let isCompleted = row.querySelector(".mdi-checkbox-marked-outline");
                let linkTag = row.querySelector("a[name='rowLink']");
                let linkId = linkTag ? linkTag.getAttribute("onclick") : null;

                if (linkId && evaluatedLinks.includes(linkId)) {
                    isPending = null; 
                    isCompleted = true;
                }

                if (isPending || isCompleted) {
                    total++;
                    if (isCompleted) {
                        row.classList.add("amz-row-completed"); // افکت سبز برای ردیف‌های تکمیل شده
                    } else if (isPending) {
                        pending++;
                    }
                }
            });

            document.getElementById("amz-stats").innerHTML = `تعداد کل اساتید: <b>${total}</b> <br> مانده برای ارزشیابی: <b>${pending}</b>`;
            
            if (pending === 0 && total > 0) {
                document.getElementById("amz-start-btn").disabled = true;
                document.getElementById("amz-start-btn").innerText = "همه نظرسنجی‌ها تکمیل است";
                updateBotState('inactive');
                showDonationPopup();
            }

        } else if (formSaveBtn) {
            document.getElementById("amz-stats").innerHTML = "در حال مشاهده فرم ارزشیابی...";
            document.getElementById("amz-start-btn").disabled = true;
        } else {
            document.getElementById("amz-stats").innerHTML = "به صفحه ارزشیابی اساتید بروید تا دکمه فعال شود.";
            document.getElementById("amz-start-btn").disabled = true;
        }

        if (isBotRunning) {
            setTimeout(startProcess, 2000);
        }
    });
}

function startProcess() {
    if (!isBotRunning) return;

    let table = document.getElementById("panel__2");
    let formSaveBtn = document.querySelector('input[onclick*="saveQuestionarieResponse"]');

    if (table) {
        chrome.storage.local.get(["evaluatedLinks"], (res) => {
            chrome.storage.local.set({ returningFromForm: false });
            let evaluatedLinks = res.evaluatedLinks || [];

            let rows = table.querySelectorAll("tbody tr");
            let targetLink = null;
            let profName = "";

            for (let row of rows) {
                let pendingIcon = row.querySelector(".mdi-close-box-outline");
                let linkTag = row.querySelector("a[name='rowLink']");
                let nameTag = row.querySelector("td[headerdata='استاد'] span");
                let linkId = linkTag ? linkTag.getAttribute("onclick") : null;

                if (pendingIcon && linkId && !evaluatedLinks.includes(linkId)) {
                    targetLink = linkTag;
                    profName = nameTag ? nameTag.innerText : "نامشخص";
                    
                    evaluatedLinks.push(linkId);
                    chrome.storage.local.set({ evaluatedLinks: evaluatedLinks });
                    break;
                }
            }

            if (targetLink) {
                speak(`در حال رفتن به نظرسنجی استاد: ${profName}`);
                setTimeout(() => { targetLink.click(); }, 2500);
            } else {
                speak("ارزشیابی تمام شد! دریافت کارت...");
                chrome.storage.local.set({ botRunning: false });
                updateBotState('inactive');
                updateUIButtons(false);
                setTimeout(() => {
                    let printBtn = document.querySelector("button[onclick*='showStudentExamCardAll']");
                    if (printBtn) printBtn.click();
                    showDonationPopup();
                }, 3000);
            }
        });
    } 
    else if (formSaveBtn) {
        chrome.storage.local.get(["returningFromForm"], (res) => {
            if (res.returningFromForm) {
                speak("سایت گیر کرده، تلاش مجدد برای بازگشت...");
                setTimeout(() => { window.history.back(); }, 3000);
                return;
            }

            let pageText = document.body.innerHTML;
            let isAlreadyEvaluated = pageText.includes("(ارزشيابي شده)") || document.querySelector('input[type="radio"]:disabled');
            
            if (isAlreadyEvaluated) {
                speak("این استاد قبلاً ارزشیابی شده! بازگشت به لیست...");
                chrome.storage.local.set({ returningFromForm: true });
                setTimeout(() => { window.history.back(); }, 2000);
                return;
            }

            speak("در حال پر کردن فرم و ثبت امن...");
            
            let script = document.createElement('script');
            script.src = chrome.runtime.getURL('inject.js');
            script.onload = function() {
                this.remove();
            };
            document.documentElement.appendChild(script);

            chrome.storage.local.set({ returningFromForm: true });

            setTimeout(() => {
                speak("ثبت انجام شد! در حال بازگشت به لیست...");
                window.history.back();
            }, 4500);
        });
    } else {
        speak("خطا: تایم ارزشیابی بسته است یا صفحه نامعتبر است.");
        chrome.storage.local.set({ botRunning: false });
        updateUIButtons(false);
        updateBotState('error'); 
    }
}

function showDonationPopup() {
    chrome.storage.local.set({ lastDonateDate: new Date().getTime(), showDonatePopup: false });

    if (document.getElementById("amz-donate-modal")) return;

    let modal = document.createElement("div");
    modal.id = "amz-donate-modal";
    modal.innerHTML = `
        <h3 style="margin-top:0;">اگه نظری دارید با ما در میان بزارید ☕</h3>
        <p style="font-size:12px; color:#555; text-align:justify; line-height:1.6;">
            کار ربات تموم شد! نظرت چیه یه سری به برنامه نویس بزنی؟<br>
            <b style="color:#e91e63;">نکته مهم:</b> اگر وضعیت تیک نظرسنجی ضربدر هست کافیه یه بار صفحه رو رفرش کنید و اگر مرورگر چیزی پرسید و دکمه ادامه یا Continue داشت روی آن بزنید تا تیک‌ها سبز شوند.
        </p>
        <button class="amz-btn-donate amz-btn-d1" id="btn-github">1. برنامه نویس رو ببینم ! (GitHub)</button>
        <button class="amz-btn-donate amz-btn-d3" id="btn-later">2. بستن </button>
    `;
    document.body.appendChild(modal);

    document.getElementById("btn-github").onclick = () => { window.open(GITHUB_LINK, "_blank"); modal.remove(); };    
    document.getElementById("btn-later").onclick = () => { 
        window.open(GITHUB_LINK, "_blank");
        modal.remove(); 
    };
}

chrome.storage.local.get(["showDonatePopup"], (res) => {
    if (res.showDonatePopup) {
        showDonationPopup();
    }
});

window.onload = () => {
    setTimeout(injectUI, 1000);
};