/*==================================
~> Name Plugin       : Table Matches API
~> Version           : 2026 / 2.1 - FIXED
~> Mode              : Old Version Style + API Match Links
==================================*/

let STING_WEB_TIMERS = [];

function clearAllTimers() {
    STING_WEB_TIMERS.forEach(clearInterval);
    STING_WEB_TIMERS = [];
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function parseMatchDate(value) {
    if (!value) return null;

    // لو التاريخ بدون Z نعامله كتوقيت محلي كما هو
    const date = new Date(value);
    if (isNaN(date.getTime())) return null;
    return date;
}

function formatMatchTime(date) {
    return date.toLocaleTimeString("ar-SA", {
        hour: "2-digit",
        minute: "2-digit"
    });
}

function getMatchLink(match) {
    if (match.link && String(match.link).trim() !== "") return match.link;
    if (match.url && String(match.url).trim() !== "") return match.url;
    if (match.matchUrl && String(match.matchUrl).trim() !== "") return match.matchUrl;
    if (match.MatchUrl && String(match.MatchUrl).trim() !== "") return match.MatchUrl;
    if (match["match-link"] && String(match["match-link"]).trim() !== "") return match["match-link"];
    if (match["Match-Link"] && String(match["Match-Link"]).trim() !== "") return match["Match-Link"];
    if (match.watchUrl && String(match.watchUrl).trim() !== "") return match.watchUrl;
    if (match.WatchUrl && String(match.WatchUrl).trim() !== "") return match.WatchUrl;

    // fallback from match_id
    if (match.match_id) return `/matches/${match.match_id}`;

    return "#";
}

function startCountdown() {
    clearAllTimers();

    const matches = document.querySelectorAll(".STING-WEB-Match");

    matches.forEach((match) => {
        const countdownElement = match.querySelector(".STING-WEB-Time-Descending");
        const timeElement = match.querySelector(".STING-WEB-Time");
        const statusElement = match.querySelector(".STING-WEB-Status");
        const playElement = match.querySelector(".STING-WEB-Play");

        if (!countdownElement || !timeElement || !statusElement || !playElement) return;

        const matchStartDate = parseMatchDate(countdownElement.getAttribute("data-start"));
        const matchEndDate = parseMatchDate(countdownElement.getAttribute("data-end"));

        if (!matchStartDate || !matchEndDate) {
            timeElement.textContent = "--:--";
            statusElement.textContent = "غير متاح";
            countdownElement.textContent = "--:--";
            playElement.textContent = "غير متاح";
            return;
        }

        timeElement.textContent = formatMatchTime(matchStartDate);

        const updateState = () => {
            const now = new Date();
            const timeRemaining = matchStartDate.getTime() - now.getTime();
            const timeToEnd = matchEndDate.getTime() - now.getTime();

            match.classList.remove("NOT", "SOON", "LIVE", "END");

            if (timeToEnd <= 0) {
                playElement.textContent = "انتهت المباراة";
                statusElement.textContent = "انتهت";
                countdownElement.textContent = "00:00";
                match.classList.add("END");
                return true;
            }

            if (timeRemaining <= 0) {
                playElement.textContent = "شاهد الآن";
                statusElement.textContent = "مباشر الآن";
                countdownElement.textContent = "LIVE";
                match.classList.add("LIVE");
                return false;
            }

            if (timeRemaining <= 30 * 60 * 1000) {
                const minutesRemaining = Math.floor(timeRemaining / (1000 * 60));
                statusElement.textContent = "قريبًا";
                countdownElement.textContent = `${minutesRemaining} دقيقة`;
                playElement.textContent = "قريبًا";
                match.classList.add("SOON");
                return false;
            }

            const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

            let countdownText = "";
            if (days > 0) countdownText += `${days}:`;
            if (days > 0 || hours > 0) countdownText += `${hours.toString().padStart(2, "0")}:`;
            countdownText += `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

            playElement.textContent = "لم تبدأ";
            countdownElement.textContent = countdownText;
            statusElement.textContent = "لم تبدأ بعد";
            match.classList.add("NOT");
            return false;
        };

        const done = updateState();
        if (!done) {
            const timer = setInterval(() => {
                const finished = updateState();
                if (finished) clearInterval(timer);
            }, 1000);

            STING_WEB_TIMERS.push(timer);
        }
    });
}

async function fetchMatches(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
}

function showLoading() {
    const container = document.getElementById("Matches");
    if (!container) return;

    container.innerHTML = `
        <div class="STING-WEB_MatchingNone">
            <p>جاري تحميل المباريات...</p>
        </div>
    `;
}

function hideLoading() {}

function getApiUrl(label) {
    const stingWebElement = document.querySelector("sting-web");
    const customApiUrl = stingWebElement?.getAttribute("api-url");
    if (customApiUrl) return customApiUrl;

    return `https://api.sting-web.com/apps/3in1/npm/en.json${label}`;
}

function normalizeMatches(data, label) {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (label && Array.isArray(data[label])) return data[label];
    if (Array.isArray(data.matches)) return data.matches;
    if (data.data && Array.isArray(data.data)) return data.data;
    if (data.data && label && Array.isArray(data.data[label])) return data.data[label];
    return [];
}

async function loadMatches() {
    const stingWebElement = document.querySelector("sting-web");
    if (!stingWebElement) return;

    const label = stingWebElement.getAttribute("label") || "today";
    const view = stingWebElement.getAttribute("view") || "1";
    const url = getApiUrl(label);

    showLoading();

    try {
        const data = await fetchMatches(url);
        const matches = normalizeMatches(data, label).map((match) => ({
            ...match,
            link: getMatchLink(match)
        }));

        displayMatches(matches, view);
    } catch (error) {
        console.error("Error fetching matches:", error);
        const container = document.getElementById("Matches");
        if (container) {
            container.innerHTML = `
                <div class="STING-WEB_MatchingNone">
                    <p style="color:red;">خطأ في تحميل البيانات</p>
                </div>
            `;
        }
    } finally {
        hideLoading();
    }
}

function displayMatches(matches, view) {
    const container = document.getElementById("Matches");
    if (!container) return;

    const oldStyle = document.getElementById("sting-web-style");
    if (oldStyle) oldStyle.remove();

    const styleElement = document.createElement("style");
    styleElement.id = "sting-web-style";

    let cssStyles = "";
    let matchHtml = "";

    switch (view) {
        case "1":
            cssStyles = `
                sting-web #Matches { display: grid; }
                @keyframes blinker { 50% { opacity: 0.2; } }

                .STING-WEB-Match {
                    background: #fff;
                    width: 98%;
                    margin: 0 auto;
                    padding: 10px;
                    margin-bottom: 8px;
                    border: 1px solid #e0e0e0;
                    position: relative;
                    border-radius: 6px;
                }

                .STING-WEB-Match a {
                    color: #000;
                    text-decoration: none;
                }

                .STING-WEB-Top {
                    width: 100%;
                    display: grid;
                    grid-template-columns: 1fr 2fr 1fr;
                    align-items: center;
                    justify-items: center;
                }

                .STING-WEB-Right, .STING-WEB-Left {
                    display: grid;
                    text-align: center;
                    justify-items: center;
                }

                .STING-WEB-Right span, .STING-WEB-Left span {
                    margin-top: 12px;
                    font-size: 15px;
                }

                .STING-WEB-Right img, .STING-WEB-Left img {
                    width: 50px;
                    height: 50px;
                    object-fit: contain;
                }

                .STING-WEB-Center {
                    display: flex;
                    width: 100%;
                    justify-content: space-around;
                    align-items: center;
                }

                .STING-WEB-Result {
                    font-weight: 600;
                    font-size: 30px;
                    color: #0277bd;
                }

                .STING-WEB-Time {
                    text-align: center;
                    letter-spacing: -2px;
                    font-family: arial;
                    direction: ltr;
                    font-size: 28px;
                    color: #474952;
                    font-weight: 700;
                    line-height: 1;
                    margin: 5px 0;
                }

                .STING-WEB-Status, .STING-WEB-Time-Descending {
                    color: #fff;
                    border-radius: 8px;
                    background: #0277bd;
                    font-weight: 700;
                    font-size: 14px;
                    margin: 8px auto;
                    max-width: 100px;
                    line-height: 2;
                    text-align: center;
                    padding: 0 8px;
                }

                .STING-WEB-TimeZone {
                    font-size: 12px;
                    font-weight: 400;
                    color: #931800;
                    text-align: center;
                }

                .STING-WEB-Match.LIVE .STING-WEB-Status {
                    background: #ff0000;
                    animation: .5s ease-in-out infinite blinker;
                }

                .STING-WEB-Match.LIVE .STING-WEB-Play { background: #ff0000; }
                .STING-WEB-Match.SOON { order: 1; }
                .STING-WEB-Match.LIVE { order: 2; }
                .STING-WEB-Match.NOT { order: 3; }
                .STING-WEB-Match.END { order: 4; }

                .STING-WEB-Bottom {
                    width: 100%;
                    text-align: center;
                    display: flex;
                    justify-content: space-between;
                }

                .STING-WEB-Betola {
                    font-size: 14px;
                    width: 100%;
                    display: flex;
                    padding-top: 5px;
                    border-top: 1px solid #e5e5ee;
                    align-items: center;
                    justify-content: center;
                }

                .STING-WEB-Here {
                    top: 0;
                    text-align: center;
                    bottom: 0;
                    right: 0;
                    left: 0;
                    background: #00000063;
                    display: none;
                }

                .STING-WEB-Play {
                    z-index: 9;
                    top: 32%;
                    background: #27a2e1;
                    color: #fff;
                    font-weight: 600;
                    width: 150px;
                    margin: 0 auto;
                    text-align: center;
                    border-radius: 6px;
                    padding: 4px 0;
                    right: 0;
                    left: 0;
                    display: none;
                }

                .STING-WEB-Match:hover .STING-WEB-Here,
                .STING-WEB-Match:hover .STING-WEB-Play {
                    position: absolute;
                    display: block;
                }

                .STING-WEB-Match.LIVE .STING-WEB-Time,
                .STING-WEB-Match.LIVE .STING-WEB-Time-Descending { display: none; }

                .STING-WEB-Match.NOT .STING-WEB-Status { display: none; }

                .STING-WEB-Match.SOON .STING-WEB-Status,
                .STING-WEB-Match.SOON .STING-WEB-Play { background: #008000; }

                .STING-WEB-Match.SOON .STING-WEB-Time-Descending { display: none; }

                .STING-WEB-Match.END .STING-WEB-Status,
                .STING-WEB-Match.END .STING-WEB-Play { background: #000; }

                .STING-WEB_MatchingNone {
                    min-height: 250px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 96%;
                    color: #666;
                    border-radius: 10px;
                    background: #fff;
                    margin: 0 auto;
                    margin-bottom: 12px;
                }
            `;

            matchHtml = matches.map((match) => `
                <div class="STING-WEB-Match">
                    <a href="${escapeHtml(match.link)}" title="${escapeHtml(match['Team-Right']?.Name || '')} vs ${escapeHtml(match['Team-Left']?.Name || '')}" target="_blank" rel="noopener noreferrer">
                        <div class="STING-WEB-Top">
                            <div class="STING-WEB-Right">
                                <img src="${escapeHtml(match['Team-Right']?.Logo || '')}" alt="${escapeHtml(match['Team-Right']?.Name || '')}" loading="lazy" />
                                <span>${escapeHtml(match['Team-Right']?.Name || '')}</span>
                            </div>
                            <div class="STING-WEB-Center">
                                <div class="STING-WEB-Result">${escapeHtml(match['Team-Right']?.Goal ?? '-')}</div>
                                <div class="STING-WEB-Match-Bio">
                                    <div class="STING-WEB-TimeZone">توقيت جهازك</div>
                                    <div class="STING-WEB-Time"></div>
                                    <div class="STING-WEB-Status"></div>
                                    <div class="STING-WEB-Time-Descending" data-start="${escapeHtml(match['Time-Start'] || '')}" data-end="${escapeHtml(match['Time-End'] || '')}"></div>
                                </div>
                                <div class="STING-WEB-Result">${escapeHtml(match['Team-Left']?.Goal ?? '-')}</div>
                            </div>
                            <div class="STING-WEB-Left">
                                <img src="${escapeHtml(match['Team-Left']?.Logo || '')}" alt="${escapeHtml(match['Team-Left']?.Name || '')}" loading="lazy" />
                                <span>${escapeHtml(match['Team-Left']?.Name || '')}</span>
                            </div>
                        </div>
                        <div class="STING-WEB-Bottom">
                            <span class="STING-WEB-Betola Tv">${escapeHtml(match.Tv || '')}</span>
                            <span class="STING-WEB-Betola Mic">${escapeHtml(match.Mic || '')}</span>
                            <span class="STING-WEB-Betola Cup">${escapeHtml(match['Cup-Name'] || '')}</span>
                        </div>
                        <div class="STING-WEB-Here">
                            <span class="STING-WEB-Play"></span>
                        </div>
                    </a>
                </div>
            `).join("");
            break;

        default:
            cssStyles = `
                .STING-WEB_MatchingNone {
                    min-height: 250px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 98%;
                    color: #666;
                    border-radius: 6px;
                    margin: 12px;
                    background: #eceef2;
                }
            `;
            matchHtml = '<div class="STING-WEB_MatchingNone"><p>لا توجد مباريات هامة اليوم</p></div>';
    }

    if (!matches.length) {
        matchHtml = '<div class="STING-WEB_MatchingNone"><p>لا توجد مباريات هامة اليوم</p></div>';
    }

    styleElement.textContent = cssStyles;
    document.head.appendChild(styleElement);
    container.innerHTML = matchHtml;

    if (view === "1") startCountdown();
}

loadMatches();
