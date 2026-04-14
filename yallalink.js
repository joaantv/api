/*==================================
~> Name Plugin       : Table Matches API
~> Version:          : 2024 / 1.0 - STABLE
~> Last Updated      : 25 - 11 - 2024   : ->  02:00 AM  +02 GMT
~> Developer By      : STING WEB
==================================*/

function startCountdown() {
    const matches = document.querySelectorAll(".STING-WEB-Match");
    const userTimeZoneOffset = new Date().getTimezoneOffset();

    matches.forEach((match) => {
        const countdownElement = match.querySelector(".STING-WEB-Time-Descending");
        const timeElement = match.querySelector(".STING-WEB-Time");
        const statusElement = match.querySelector(".STING-WEB-Status");
        const hereElement = match.querySelector(".STING-WEB-Play");

        const matchStartTime = countdownElement.getAttribute("data-start");
        const matchEndTime = countdownElement.getAttribute("data-end");

        const matchStartDate = new Date(matchStartTime);
        const matchEndDate = new Date(matchEndTime);

        const localStartDate = new Date(matchStartDate.getTime() - userTimeZoneOffset * 60000 - 3 * 60 * 60 * 1000);

        timeElement.textContent = localStartDate.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });

        const interval = setInterval(() => {
            const now = new Date();
            const timeRemaining = matchStartDate - now;
            const timeToEnd = matchEndDate - now;

            if (timeToEnd <= 0) {
                hereElement.textContent = "إنتهت المباراة";
                statusElement.textContent = "إنتهت";
                clearInterval(interval);
                match.classList.add("END");

            } else if (timeRemaining <= 0 && timeToEnd > 0) {
                hereElement.textContent = "شاهد الآن";
                statusElement.textContent = "جارية الآن";
                match.classList.add("LIVE");

            } else if (timeRemaining <= 30 * 60 * 1000) {
                const minutesRemaining = Math.floor(timeRemaining / (1000 * 60));
                statusElement.textContent = "تبداء قريباً";
                countdownElement.textContent = `${minutesRemaining} دقيقة`;
                match.classList.add("SOON");
                hereElement.textContent = "تبداء قريباً";

            } else {
                const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
                const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

                let countdownText = "";
                if (days > 0) countdownText += `${days}:`;
                if (days > 0 || hours > 0) countdownText += `${hours.toString().padStart(2, "0")}:`;

                countdownText += `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

                hereElement.textContent = "لم تبداء";
                countdownElement.textContent = countdownText;
                statusElement.textContent = "لم تبداء بعد";
                match.classList.add("NOT");
            }

        }, 100);
    });
}

async function fetchMatches(url) {
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error('Error fetching matches:', error);
        document.querySelector("sting-web").innerHTML =
            `<div style="text-align:center; padding:20px; color:red;">Error</div>`;
        return [];
    }
}

function showLoading() {
    document.querySelector('.STING-WEB-API-Matches').classList.add("load");
}

function hideLoading() {
    document.querySelector('.STING-WEB-API-Matches').classList.remove("load");
}

async function loadMatches() {
    showLoading();

    const stingWebElement = document.querySelector('sting-web');
    const label = stingWebElement.getAttribute('label');
    const view = stingWebElement.getAttribute('view');

    const url = `https://yalla-api.joaantv.workers.dev/${label}`;
    const data = await fetchMatches(url);

    const matches = data[label] || [];

    // 🔥 هنا أهم تعديل: نستخدم link من API مباشرة
    displayMatches(matches, view);

    hideLoading();
}

function displayMatches(matches, view) {
    const container = document.getElementById('Matches');

    let matchHtml = '';

    switch (view) {
        case '1':
            matchHtml = matches.map(match => `
                <div class="STING-WEB-Match">
                    <a href="${match.link || '#'}">
                        <div class="STING-WEB-Top">

                            <div class="STING-WEB-Right">
                                <img src="${match['Team-Right'].Logo}">
                                <span>${match['Team-Right'].Name}</span>
                            </div>

                            <div class="STING-WEB-Center">
                                <div class="STING-WEB-Result">${match['Team-Right'].Goal}</div>

                                <div class="STING-WEB-Match-Bio">
                                    <div class="STING-WEB-Time"></div>
                                    <div class="STING-WEB-Status"></div>
                                    <div class="STING-WEB-Time-Descending"
                                         data-start="${match['Time-Start']}"
                                         data-end="${match['Time-End']}">
                                    </div>
                                </div>

                                <div class="STING-WEB-Result">${match['Team-Left'].Goal}</div>
                            </div>

                            <div class="STING-WEB-Left">
                                <img src="${match['Team-Left'].Logo}">
                                <span>${match['Team-Left'].Name}</span>
                            </div>

                        </div>

                        <div class="STING-WEB-Bottom">
                            <span>${match.Tv}</span>
                            <span>${match.Mic}</span>
                            <span>${match['Cup-Name']}</span>
                        </div>

                        <div class="STING-WEB-Here">
                            <span class="STING-WEB-Play"></span>
                        </div>
                    </a>
                </div>
            `).join('');
            break;

        default:
            matchHtml = '<div>لا توجد مباريات</div>';
    }

    container.innerHTML = matchHtml;

    if (view === '1') startCountdown();
}

loadMatches();
