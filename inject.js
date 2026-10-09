(function() {
    window.alert = function() {};
    window.confirm = function() { return true; };

    let excellentRadios = document.querySelectorAll('input[type="radio"][title="خیلی خوب"]');
    
    excellentRadios.forEach(radio => {
        radio.checked = true;
        if (typeof radio.onclick === "function") {
            radio.onclick(); 
        }
    });

    setTimeout(() => {
        let saveBtn = document.querySelector('input[onclick*="saveQuestionarieResponse"]');
        if (saveBtn) {
            if (typeof saveBtn.onclick === "function") {
                saveBtn.onclick();
            } else if (typeof window.saveQuestionarieResponse === "function") {
                window.saveQuestionarieResponse();
            } else {
                saveBtn.click();
            }
        }
    }, 800);
})();