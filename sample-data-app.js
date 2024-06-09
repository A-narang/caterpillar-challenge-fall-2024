// GLOBAL CONSTANTS
const url = 'https://challenge.sandboxnu.com/s/PMRGIYLUMERDU6ZCMVWWC2LMEI5CE3TBOJQW4ZZOMFXEA3TPOJ2GQZLBON2GK4TOFZSWI5JCFQRGI5LFEI5DCNZRG44TSMJZHE4SYITDNBQWY3DFNZTWKIR2EJDGY33XEJ6SYITIMFZWQIR2EJQTMVDCORZTI4CWNFXHOZLOJI2TERDHHURH2==='
const sampleData = require('./sample-data.json');
let sessions = sampleData.sessions;
let rounds = sampleData.rounds;
let participantInfo = sampleData.participantInfo;


async function getSessionsByParticpantID(id) {
    result = sessions.filter(({ participantId }) => participantId == id);
    return result;
}

async function getRoundById(id) {
    result = rounds.find(({ roundId }) => roundId == id);
    return result;
}

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

async function getAverageSessionDuration(sessions) {
    let duration = 0;
    // add up add session durations
    for (const s of sessions) {
        duration += (s.endTime - s.startTime);
    }
    // calc average
    return Math.round(duration / sessions.length * 100) / 100;
}

async function getLanguageStats(sessions) {
    const lMap = new Map();
    for (const s of sessions) {
        const language = s.language;
        if (!lMap.has(language)) {
            lMap.set(language, []);
        }

        lMap.set(language, lMap.get(language).concat(s.rounds));
    }

    let languages = [];
    //console.log(lMap);

    for (let lang of lMap.keys()) {
        let roundIds = lMap.get(lang);
        let scoreTotal = 0;
        let durationTotal = 0;

        // Use `Promise.all` to fetch all round details concurrently
        const roundPromises = roundIds.map(roundId => getRoundById(roundId));
        const rounds = await Promise.all(roundPromises);

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

    languages.sort((a, b) => b.totalScore - a.totalScore);

    languages.forEach(lang => delete lang.totalScore);

    return languages;
}

async function getStats(s, r, pi) {

    // loop through participants
    for (const key of Object.keys(pi)) {
        // get participant's sessions based on id
        const sesh = await getSessionsByParticpantID(pi[key].participantId);

        const obj = {
            "id": pi[key].participantId,
            "name": pi[key].name,
            "languages": await getLanguageStats(sesh),
            "averageRoundScore": await getAverageRoundScore(sesh) || "N/A",
            "averageSessionDuration": await getAverageSessionDuration(sesh) || "N/A"
        }
        console.log(obj);
    }
}

getStats(sessions, rounds, participantInfo);
