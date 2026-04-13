/*==================================
~> Name Plugin       : Table Matches API
~> Version:          : 2024 / 1.0 - STABLE
~> Last Updated      : 25 - 11 - 2024   : ->  02:00 AM  +02 GMT
~> Developer By      : STING WEB - Facebook Page   : ->  https://www.facebook.com/stingweb.eg
~> Desgin URL        : https://www.sting-web.com
=========== [ STING WEB ] ==========*/
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
        const localEndDate = new Date(matchEndDate.getTime() - userTimeZoneOffset * 60000 - 3 * 60 * 60 * 1000);
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
                hereElement.textContent = "Match End";
                statusElement.textContent = "End";
                clearInterval(interval);
                match.classList.add("END");
            } else if (timeRemaining <= 0 && timeToEnd > 0) {
                hereElement.textContent = "Watch Now";
                statusElement.textContent = "Live Now";
                match.classList.add("LIVE");
            } else if (timeRemaining <= 30 * 60 * 1000) {
                const minutesRemaining = Math.floor(timeRemaining / (1000 * 60));
                statusElement.textContent = "Soon";
                countdownElement.textContent = `${minutesRemaining} دقيقة`;
                match.classList.add("SOON");
                hereElement.textContent = "Soon";
            } else {
                const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
                const hours = Math.floor(
                    (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
                );
                const minutes = Math.floor(
                    (timeRemaining % (1000 * 60 * 60)) / (1000 * 60)
                );
                const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
                let countdownText = "";
                if (days > 0) {
                    countdownText += `${days}:`;
                }
                if (days > 0 || hours > 0) {
                    countdownText += `${hours.toString().padStart(2, "0")}:`;
                }
                countdownText += `${minutes.toString().padStart(2, "0")}:${seconds
                    .toString()
                    .padStart(2, "0")}`;
                hereElement.textContent = "Not Started";
                countdownElement.textContent = countdownText;
                statusElement.textContent = "Not Started Yet";
                match.classList.add("NOT");
            }
        }, 100);
    });
}
function getMatchLinks() {
    const linksElement = document.querySelector('match-link');
    const links = linksElement.textContent.split(',').map(link => link.trim());
    return links;
}
async function fetchMatches(url) {
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error('Error fetching matches:', error);
        document.querySelector("sting-web").innerHTML = `<div class="Error" style="text-align:center; padding:20px; color:red;">Error</div>`;
        return [];
    }
}
function showLoading() {
    document.querySelector('match-link').style.display = "none";
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
    const matchLinks = getMatchLinks();
    const url = `https://yalla-api.joaantv.workers.dev/${label}`;
    const data = await fetchMatches(url);
    const matches = data[label] || [];
    matches.forEach((match, index) => {
        if (matchLinks[index]) {
            match.link = matchLinks[index];
        }
    });
    displayMatches(matches, view);
    hideLoading();
}
function displayMatches(matches, view) {
    const container = document.getElementById('Matches');
    const styleElement = document.createElement('style');
    let cssStyles = '';
    let matchHtml = '';
    switch (view) {
        case '1':
            cssStyles = `sting-web #Matches { display: grid; } @keyframes blinker { 50% { opacity: 0.2; } } .STING-WEB-Match { background: #fff; width: 98%; margin: 0 auto; padding: 10px; margin-bottom: 8px; border: 1px solid #e0e0e0; position: relative; } .STING-WEB-Gird { display: grid; } .STING-WEB-Match a { color: #000; } .STING-WEB-Top { width: 100%; display: grid; grid-template-columns: 1fr 2fr 1fr; align-items: center; justify-items: center; } .STING-WEB-Right, .STING-WEB-Left { display: grid; text-align: center; justify-items: center; } .STING-WEB-Right span,.STING-WEB-Left span { margin-top: 12px; font-size: 15px; } .STING-WEB-Right img,.STING-WEB-Left img { width: 50px; height: 50px; object-fit: contain; } .STING-WEB-Center { display: flex; width: 100%; justify-content: space-around; align-items: center; } .STING-WEB-Result { font-weight: 600; font-size: 30px; color: #0277bd; } .STING-WEB-Time { text-align: center; letter-spacing: -2px; font-family: arial; direction: ltr; font-size: 28px; color: #474952; font-weight: 700; padding: 0; line-height: 1; margin: 5px 0 5px 0; } .STING-WEB-Status, .STING-WEB-Time-Descending { color: #fff; border-radius: 8px; background: #0277bd; font-weight: 700; font-size: 14px; margin: 8px auto; max-width: 80px; line-height: 2; text-align: center; } .STING-WEB-TimeZone { font-size: 12px; font-weight: 400; color: #931800; text-align: center; } .STING-WEB-Match.LIVE .STING-WEB-Status { background: #ff0000; animation: .5s ease-in-out infinite blinker; } .STING-WEB-Match.LIVE .STING-WEB-Play { background: #ff0000; } .STING-WEB-Match.SOON { order: 1; } .STING-WEB-Match.LIVE { order: 2; } .STING-WEB-Match.NOT { order: 3; } .STING-WEB-Match.END { order: 4; } .STING-WEB-Bottom { width: 100%; text-align: center; display: flex; justify-content: space-between; } .STING-WEB-Betola { font-size: 14px; width: 100%; display: flex; padding-top: 5px; border-top: 1px solid #e5e5ee; align-items: center; justify-content: center; } .STING-WEB-Betola.Cup:before { content: ""; margin-left: 8px; background-image: url("data:image/svg+xml,%3Csvg aria-hidden='true' focusable='false' data-prefix='far' data-icon='trophy' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 576 512'%3E%3Cpath d='M448 64V16c0-8.8-7.2-16-16-16H144c-8.8 0-16 7.2-16 16v48H16C7.2 64 0 71.2 0 80v60.8C0 201.1 68.3 266 159.6 283.4c27.4 57.9 68.1 88.2 104.4 97.4V464h-64c-22.1 0-40 17.9-40 40 0 4.4 3.6 8 8 8h240c4.4 0 8-3.6 8-8 0-22.1-17.9-40-40-40h-64v-83.2c36.3-9.3 77-39.5 104.4-97.4C507.5 266.1 576 201.2 576 140.8V80c0-8.8-7.2-16-16-16H448zM48 140.8V112h80c0 39.2 2.1 76.2 12.3 116.8-55.1-18.9-92.3-58.9-92.3-88zM288 336c-53 0-112-78.4-112-216V48h224v72c0 140.5-60.8 216-112 216zm240-195.2c0 29.1-37.2 69.1-92.3 88C445.9 188.2 448 151.1 448 112h80v28.8z' class='' fill='%23ff930c'%3E%3C/path%3E%3C/svg%3E"); background-repeat: no-repeat; width: 20px; height: 20px; display: flex; align-items: center; } .STING-WEB-Betola.Mic:before { content: ""; margin-left: 8px; background-image: url("data:image/svg+xml,%3Csvg aria-hidden='true' focusable='false' data-prefix='far' data-icon='microphone' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 352 512'%3E%3Cpath d='M336 192h-16c-8.84 0-16 7.16-16 16v48c0 74.8-64.49 134.82-140.79 127.38C96.71 376.89 48 317.11 48 250.3V208c0-8.84-7.16-16-16-16H16c-8.84 0-16 7.16-16 16v40.16c0 89.64 63.97 169.55 152 181.69V464H96c-8.84 0-16 7.16-16 16v16c0 8.84 7.16 16 16 16h160c8.84 0 16-7.16 16-16v-16c0-8.84-7.16-16-16-16h-56v-33.77C285.71 418.47 352 344.9 352 256v-48c0-8.84-7.16-16-16-16zM176 352c53.02 0 96-42.98 96-96V96c0-53.02-42.98-96-96-96S80 42.98 80 96v160c0 53.02 42.98 96 96 96zM128 96c0-26.47 21.53-48 48-48s48 21.53 48 48v160c0 26.47-21.53 48-48 48s-48-21.53-48-48V96z' class='' fill='%23ff930c'%3E%3C/path%3E%3C/svg%3E"); background-repeat: no-repeat; width: 20px; height: 20px; display: flex; align-items: center; } .STING-WEB-Betola.Tv:before { content: ""; margin-left: 8px; background-image: url("data:image/svg+xml,%3Csvg aria-hidden='true' focusable='false' data-prefix='fal' data-icon='tv-retro' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath d='M416 243v-8c0-6.6 5.4-12 12-12h8c6.6 0 12 5.4 12 12v8c0 6.6-5.4 12-12 12h-8c-6.6 0-12-5.4-12-12zm96-100v288c0 26.5-21.5 48-48 48h-16v33h-16l-11-33H91l-11 33H64v-33H48c-26.5 0-48-21.5-48-48V143c0-26.5 21.5-48 48-48h160.1l-74.8-67.1c-6.6-5.9-7.2-16-1.3-22.6 5.9-6.6 16-7.2 22.6-1.3L256 95h.8L357.3 4.1c6.6-5.9 16.7-5.4 22.6 1.2 5.9 6.6 5.4 16.7-1.2 22.6L304.5 95H464c26.5 0 48 21.5 48 48zm-32 0c0-8.8-7.2-16-16-16H48c-8.8 0-16 7.2-16 16v288c0 8.8 7.2 16 16 16h416c8.8 0 16-7.2 16-16V143zm-256 49c-68.8 0-106.2 2.3-125.3 4.3-1.3 14.4-2.7 41.5-2.7 90.7 0 50.5 1.4 78 2.7 92.8 19.2 1.9 56.5 4.2 125.3 4.2s106.1-2.3 125.3-4.2c1.3-14.7 2.7-42.3 2.7-92.8 0-49.2-1.4-76.3-2.7-90.7-19.1-2-56.5-4.3-125.3-4.3m0-32c128 0 152 8 152 8s8 0 8 119c0 121-8 121-8 121s-24 8-152 8-152-8-152-8-8 0-8-121c0-119 8-119 8-119s24-8 152-8zm204 159h8c6.6 0 12-5.4 12-12v-8c0-6.6-5.4-12-12-12h-8c-6.6 0-12 5.4-12 12v8c0 6.6 5.4 12 12 12z' class='' fill='%23ff930c'%3E%3C/path%3E%3C/svg%3E"); background-repeat: no-repeat; width: 20px; height: 20px; display: flex; align-items: center; } .STING-WEB-Here { top: 0; text-align: center; bottom: 0; right: 0; left: 0; background: #00000063; display: none; } .STING-WEB-Play { z-index: 9; top: 32%; background: #27a2e1; color: #fff; font-weight: 600; width: 150px; margin: 0 auto; text-align: center; border-radius: 6px; padding: 4px 0; right: 0; left: 0; display: none; } .STING-WEB-Match:hover .STING-WEB-Here,.STING-WEB-Match:hover .STING-WEB-Play { position: absolute; display: block; } .STING-WEB-Match.LIVE .STING-WEB-Time ,.STING-WEB-Match.LIVE .STING-WEB-Time-Descending { display: none; } .STING-WEB-Match.NOT .STING-WEB-Status { display: none; } .STING-WEB-Match.SOON .STING-WEB-Status,.STING-WEB-Match.SOON .STING-WEB-Play { background: #008000; } .STING-WEB-Match.SOON  .STING-WEB-Time-Descending { display: none; } .STING-WEB-Match.END .STING-WEB-Status,.STING-WEB-Match.END .STING-WEB-Play  { background: #000; } .STING-WEB_MatchingNone { min-height: 250px; display: flex; align-items: center; justify-content: center; width: 96%; color: #666; border-radius: 10px; background: #fff; margin: 0 auto; margin-bottom: 12px; } @media screen and (max-width: 720px) { .STING-WEB-Right span, .STING-WEB-Left span { font-size: 13px; margin-top: 6px; } .STING-WEB-Betola.Cup:before, .STING-WEB-Betola.Mic:before, .STING-WEB-Betola.Tv:before { width: 15px; height: 15px; } .STING-WEB-Betola.Mic { display: none; } .STING-WEB-Right img,.STING-WEB-Left img { width: 40px; height: 40px; } .STING-WEB-Betola { font-size: 12px; } .STING-WEB-TimeZone { font-size: 10px; } .STING-WEB-Time { margin: 5px 0 2px; font-size: 17px; letter-spacing: -1px; } .STING-WEB-Status, .STING-WEB-Time-Descending { font-size: 12px; min-width: 70px; } .STING-WEB-Result { font-size: 26px; }} .Night .STING-WEB-Match { background: #0e1019; border: 1px solid #0e1019; } .Night .STING-WEB-Betola { border-top: 2px solid #191d2d; } .Night .STING-WEB-Status,.Night .STING-WEB-Time-Descending { background: #191d2d; } .Night .STING-WEB-Play { background: #191d2d; }.Night .STING-WEB-Match * { color: #fff; }`;
            matchHtml = matches.map(match => `
                   <div class="STING-WEB-Match">
                        <a href="${match.link}" title="${match['Team-Right'].Name} vs ${match['Team-Left'].Name}">
                            <div class="STING-WEB-Top">
                                <div class="STING-WEB-Right">
                                    <img title="${match['Team-Right'].Name}" src="${match['Team-Right'].Logo}" alt="${match['Team-Right'].Name}" width="50" height="50" loading="lazy"/>
                                    <span>${match['Team-Right'].Name}</span>
                                </div>
                                <div class="STING-WEB-Center">
                                    <div class="STING-WEB-Result">${match['Team-Right'].Goal}</div>
                                    <div class="STING-WEB-Match-Bio">
                                        <div class="STING-WEB-TimeZone">Your device time</div>
                                        <div class="STING-WEB-Time"></div>
                                        <div class="STING-WEB-Status"></div>
                                        <div class="STING-WEB-Time-Descending" data-start="${match['Time-Start']}" data-end="${match['Time-End']}"></div>
                                    </div>
                                    <div class="STING-WEB-Result">${match['Team-Left'].Goal}</div>
                                </div>
                                <div class="STING-WEB-Left">
                                    <img src="${match['Team-Left'].Logo}" title="${match['Team-Left'].Name}" alt="${match['Team-Left'].Name}" width="50" height="50" loading="lazy"/>
                                    <span>${match['Team-Left'].Name}</span>
                                </div>
                            </div>
                            <div class="STING-WEB-Bottom">
                                <span class="STING-WEB-Betola Tv">${match.Tv}</span>
                                <span class="STING-WEB-Betola Mic">${match.Mic}</span>
                                <span class="STING-WEB-Betola Cup">${match['Cup-Name']}</span>
                            </div>
                            <div class="STING-WEB-Here">
                                <span class="STING-WEB-Play"></span>
                            </div>
                        </a>
                    </div>
            `).join('');
            break;
        case '2':
            cssStyles = `sting-web #Matches { display: grid; }`;
            matchHtml = matches.map(match => `
            `).join('');
            break;
        case '3':
            cssStyles = ``;
            matchHtml = matches.map(match => ``).join('');
            break;
        default:
            cssStyles = `.STING-WEB_MatchingNone { min-height: 250px; display: flex; align-items: center; justify-content: center; width: 98%; color: #666; border-radius: 6px; margin: 12px 12px -12px 12px; background: #eceef2; }.Night .STING-WEB_MatchingNone { background: #1c2733; }`;
            matchHtml = '<div class="STING-WEB_MatchingNone"><br><br><br><p>لا توجد مباريات هامة اليوم</p><br><br><br></div>';
    }
    styleElement.textContent = cssStyles;
    document.head.appendChild(styleElement);
    container.innerHTML = matchHtml;
    switch (view) { case '1':  startCountdown(); }
    switch (view) { case '2':   }
    switch (view) { case '3':   }
}
loadMatches();
console.group(
   "%cSTING WEB - Table Matches API",
   "font-weight:600;color:#f50;font-size:20px;font-family:Segoe UI;"
 ),
   console.log("=> Designed by      : %cSTING WEB",
     "font-weight:600;color:#ff0000;font-size:15px;font-family:Segoe UI;"),
   console.log("=> FB Page URL      : https://fb.com/stingweb.eg"),
   console.log("=> Version          : 2024 / 1.0 - STABLE"),
   console.log("=> Desgin URL       : https://www.sting-web.com"),
   console.log(
     "=> %cاطلب نسخة لموقعك الان  - من خلال ستينج ويب",
     "font-weight:600;color:#f50;font-size:14px;font-family:Segoe UI;"
   ),
console.groupEnd();
