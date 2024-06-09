// DATA DEFINITIONS
/**
 * a session has a:
 * - participantId
 * - sessionId
 * - language
 * - rounds
 * - startTime
 * - endTime
 */

/**
 * a round has a
 * - roundId
 * - sessionId
 * - score
 * - startTime
 * - endTime
 */

/**
 * a participantInfo has a
 * - participantId
 * - name
 * - age
 * - sessions
 */

/**
 * stats has a 
 * - participantId
 * - name
 * - languageStats
 * - average round score
 * - average session duration
 */

/**
 * language stats has a
 * - langauge
 * - average score
 * - average round duration 
 */

// GLOBAL CONSTANTS
const url = 'https://challenge.sandboxnu.com/s/PMRGIYLUMERDU6ZCMVWWC2LMEI5CE3TBOJQW4ZZOMFXEA3TPOJ2GQZLBON2GK4TOFZSWI5JCFQRGI5LFEI5DCNZRG44TSMJZHE4SYITDNBQWY3DFNZTWKIR2EJDGY33XEJ6SYITIMFZWQIR2EJQTMVDCORZTI4CWNFXHOZLOJI2TERDHHURH2==='
let sessions;
let rounds
let participantInfo


// Gets data from url
async function getData() {
    try {
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            // seperates data
            sessions = data.sessions;
            rounds = data.rounds;
            participantInfo = data.participantInfo;
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// filters sessions based on given participant id
async function getSessionsByParticpantID(id) {
    result = sessions.filter(({ participantId }) => participantId == id);
    return result;
}

// finds round with given id
async function getRoundById(id) {
    result = rounds.find(({ roundId }) => roundId == id);
    return result;
}

// gets all rounds in given sessions + finds the average score
async function getAverageRoundScore(sessions) {
    let roundsInAllSessions = [];
    // get all rounds in sessions
    for (const s of sessions) {
        roundsInAllSessions = roundsInAllSessions.concat(s.rounds);
    }
    // add up all scores in rounds
    let score = 0;
    for (const r of roundsInAllSessions) {
        let round = await getRoundById(r);
        score += round.score;
    }
    // calc average
    return Math.round(score / roundsInAllSessions.length * 100) / 100;
}

// finds average duration of given sessions
function getAverageSessionDuration(sessions) {
    let duration = 0;
    // add up add session durations
    for (const s of sessions) {
        duration += (s.endTime - s.startTime);
    }
    // calc average
    return Math.round(duration / sessions.length * 100) / 100;
}

// gets statistics by language from the given session
async function getLanguageStats(sessions) {
    // maps language to roundIds
    const lMap = new Map();
    for (const s of sessions) {
        const language = s.language;
        if (!lMap.has(language)) {
            lMap.set(language, []);
        }
        lMap.set(language, lMap.get(language).concat(s.rounds));
    }

    let languages = [];

    // loop through languages
    for (let lang of lMap.keys()) {
        let roundIds = lMap.get(lang);
        let scoreTotal = 0;
        let durationTotal = 0;

        // get rounds from roundIds
        const roundPromises = roundIds.map(roundId => getRoundById(roundId));
        const rounds = await Promise.all(roundPromises);

        // loop though rounds
        for (const round of rounds) {
            scoreTotal += round.score;
            durationTotal += (round.endTime - round.startTime);
        }

        const langStats = {
            "language": lang,
            "totalScore": scoreTotal,
            "averageScore": Math.round(scoreTotal / rounds.length * 100) / 100 || "N/A",
            "averageRoundDuration": Math.round(durationTotal / rounds.length * 100) / 100 || "N/A"
        };

        languages.push(langStats);
    }

    // sort by totalScore
    languages.sort((a, b) => b.totalScore - a.totalScore);
    // delete tota score property
    languages.forEach(lang => delete lang.totalScore);
    return JSON.stringify(languages);
}

async function getStats(s, r, pi) {
    let result = [];
    // loop through participants
    for (const key of Object.keys(pi)) {
        // get participant's sessions based on id
        const sesh = await getSessionsByParticpantID(pi[key].participantId);

        const obj = {
            "id": pi[key].participantId,
            "name": pi[key].name,
            "languages": JSON.parse(await getLanguageStats(sesh)),
            "averageRoundScore": await getAverageRoundScore(sesh) || "N/A",
            "averageSessionDuration": await getAverageSessionDuration(sesh) || "N/A"
        }
        result.push(obj);
    }
    // sort by name
    result.sort((a, b) => a.name.localeCompare(b.name));
    return result;
}



async function submit() {
    try {
        await getData();
        const answer = await getStats(sessions, rounds, participantInfo);

        console.log(answer);

        // POST request
        const response = await fetch(url, {
            method: "POST",
            body: JSON.stringify(answer),
            headers: {
                "Content-Type": "application/json; charset=UTF-8"
            }
        });

        // Parse the JSON response
        const result = await response;
        console.log('Response: ', result);

    } catch (error) {
        console.error('Error: ', error);
    }
}

submit();