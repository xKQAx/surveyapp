const crypto = require('crypto');
const { getSupabase, isSupabaseConfigured } = require('./supabase');
const seedData = require('./seedData');

let memoryResponses = [];

function cloneCanonicalSurveys() {
    return JSON.parse(JSON.stringify(seedData.surveys));
}

function inferQuestionType(options) {
    const opts = (options || []).slice().sort((a, b) => a.id - b.id);
    if (opts.length === 0) return 'text';
    if (opts.length === 2) return 'boolean';
    if (opts.length === 5) return 'rating';
    return 'choice';
}

function mapDbQuestion(q) {
    const options = (q.options || []).slice().sort((a, b) => a.id - b.id);
    const type =
        q.question_type && q.question_type !== 'choice'
            ? q.question_type
            : inferQuestionType(options);
    return {
        id: q.id,
        text: q.text,
        type,
        options: options.length ? options : undefined
    };
}

/** Listado fijo: siempre las 5 encuestas canónicas (no depende de filas en BD). */
async function listSurveys() {
    return cloneCanonicalSurveys();
}

/** Detalle fijo: mismas 5 encuestas desde seed (ids 1–5). */
async function getSurveyById(id) {
    const surveyId = parseInt(id, 10);
    const s = seedData.surveys.find((x) => x.id === surveyId);
    return s ? JSON.parse(JSON.stringify(s)) : null;
}

function resolveAnswerForDb(question, value) {
    const v = value;
    if (question.type === 'text') {
        return { option_id: null, text_value: String(v || '') };
    }
    const opts = question.options || [];
    if (question.type === 'rating') {
        const idNum = parseInt(v, 10);
        if (!Number.isNaN(idNum) && opts.some((o) => o.id === idNum)) {
            return { option_id: idNum, text_value: null };
        }
        const str = String(v);
        const match = opts.find(
            (o) =>
                o.text === str ||
                o.text.trim().startsWith(str) ||
                o.text.includes(str)
        );
        if (!match) {
            const n = parseInt(str, 10);
            const byIndex = opts[n - 1];
            return { option_id: byIndex ? byIndex.id : null, text_value: null };
        }
        return { option_id: match.id, text_value: null };
    }
    if (question.type === 'boolean') {
        const idNum = parseInt(v, 10);
        if (!Number.isNaN(idNum) && opts.some((o) => o.id === idNum)) {
            return { option_id: idNum, text_value: null };
        }
        const wantSi = v === 'si' || v === true || v === 'Sí';
        const match = opts.find((o) => {
            const t = (o.text || '').toLowerCase();
            if (wantSi) return /^(sí|si|yes|✅)/i.test(o.text || '');
            return /^(no|❌)/i.test(o.text || '') || t === 'no';
        });
        return { option_id: match ? match.id : null, text_value: null };
    }
    if (question.type === 'choice') {
        const idNum = parseInt(v, 10);
        if (!Number.isNaN(idNum) && opts.some((o) => o.id === idNum)) {
            return { option_id: idNum, text_value: null };
        }
        const match = opts.find((o) => String(o.id) === String(v));
        return { option_id: match ? match.id : null, text_value: null };
    }
    const idNum = parseInt(v, 10);
    if (!Number.isNaN(idNum) && opts.some((o) => o.id === idNum)) {
        return { option_id: idNum, text_value: null };
    }
    return { option_id: null, text_value: null };
}

async function loadDbQuestionsOrdered(surveyId) {
    const supabase = getSupabase();
    const { data, error } = await supabase
        .from('questions')
        .select('id, text, question_type, options ( id, text )')
        .eq('survey_id', surveyId)
        .order('id');
    if (error) throw error;
    return data || [];
}

async function submitResponses(surveyId, answers, respondentName) {
    const survey = await getSurveyById(surveyId);
    if (!survey) {
        const err = new Error('Encuesta no encontrada');
        err.statusCode = 404;
        throw err;
    }
    const total = survey.questions.length;
    if (Object.keys(answers).length !== total) {
        const err = new Error(`Por favor responde las ${total} preguntas`);
        err.statusCode = 400;
        throw err;
    }

    if (!isSupabaseConfigured()) {
        const newResponse = {
            id: memoryResponses.length + 1,
            surveyId,
            surveyTitle: survey.title,
            answers,
            respondentName: respondentName || 'Anónimo',
            date: new Date().toISOString(),
            timestamp: Date.now()
        };
        memoryResponses.push(newResponse);
        return newResponse;
    }

    const supabase = getSupabase();
    const dbRows = await loadDbQuestionsOrdered(surveyId);
    if (dbRows.length !== survey.questions.length) {
        const err = new Error(
            `Supabase: la encuesta ${surveyId} debe tener ${survey.questions.length} preguntas en la BD (ahora hay ${dbRows.length}). Ejecuta supabase/seed_five_surveys.sql o alinea tablas questions/options.`
        );
        err.statusCode = 400;
        throw err;
    }

    const submissionId = crypto.randomUUID();
    const insertRows = [];

    for (let i = 0; i < survey.questions.length; i++) {
        const seedQ = survey.questions[i];
        const raw = answers[seedQ.id];
        if (raw === undefined || raw === null || raw === '') {
            const err = new Error('Respuestas incompletas');
            err.statusCode = 400;
            throw err;
        }
        const dbQ = mapDbQuestion(dbRows[i]);
        const { option_id, text_value } = resolveAnswerForDb(dbQ, raw);
        if (dbQ.type !== 'text' && option_id == null) {
            const err = new Error('No se pudo mapear la respuesta a una opción');
            err.statusCode = 400;
            throw err;
        }
        if (dbQ.type === 'text' && (!text_value || !text_value.trim())) {
            const err = new Error('Respuesta de texto vacía');
            err.statusCode = 400;
            throw err;
        }
        const row = {
            question_id: dbRows[i].id,
            submission_id: submissionId
        };
        if (option_id != null) row.option_id = option_id;
        if (text_value != null) row.text_value = text_value;
        insertRows.push(row);
    }

    const { error } = await supabase.from('responses').insert(insertRows);
    if (error) {
        const err = new Error(error.message || 'Error al guardar en Supabase');
        err.statusCode = 500;
        err.details = error;
        throw err;
    }

    return {
        id: submissionId,
        surveyId,
        surveyTitle: survey.title,
        answers,
        respondentName: respondentName || 'Anónimo',
        date: new Date().toISOString()
    };
}

function buildMemoryDetailedStats() {
    const canonical = cloneCanonicalSurveys();
    const surveys = canonical.map((s) => {
        const subs = memoryResponses.filter((r) => r.surveyId === s.id);
        const questions = s.questions.map((seedQ) => {
            const vals = subs
                .map((r) => r.answers[seedQ.id])
                .filter((v) => v != null && v !== '');
            if (seedQ.type === 'text') {
                return {
                    text: seedQ.text,
                    type: seedQ.type,
                    responseCount: vals.length,
                    textSamples: vals.slice(0, 8)
                };
            }
            const distribution = {};
            for (const v of vals) {
                const k = String(v);
                distribution[k] = (distribution[k] || 0) + 1;
            }
            let average = null;
            if (seedQ.type === 'rating') {
                const nums = vals
                    .map((x) => parseInt(x, 10))
                    .filter((n) => !Number.isNaN(n));
                if (nums.length) {
                    average =
                        Math.round(
                            (nums.reduce((a, b) => a + b, 0) / nums.length) *
                                100
                        ) / 100;
                }
            }
            return {
                text: seedQ.text,
                type: seedQ.type,
                responseCount: vals.length,
                distribution,
                average
            };
        });
        return {
            id: s.id,
            title: s.title,
            icon: s.icon,
            totalQuestions: s.questions.length,
            responses: subs.length,
            questions
        };
    });

    return {
        source: 'memory',
        totalResponses: memoryResponses.length,
        surveys,
        recentResponses: memoryResponses.slice(-8).map((r) => ({
            surveyTitle: r.surveyTitle,
            respondentName: r.respondentName,
            date: r.date
        }))
    };
}

function groupRowsByQuestion(respRows) {
    const map = {};
    for (const r of respRows || []) {
        const qid = r.question_id;
        if (!map[qid]) map[qid] = [];
        map[qid].push(r);
    }
    return map;
}

async function buildSupabaseDetailedStats() {
    const canonical = cloneCanonicalSurveys();
    const supabase = getSupabase();

    const { data: respRows, error: errResp } = await supabase
        .from('responses')
        .select(
            `
      submission_id,
      question_id,
      option_id,
      text_value,
      created_at,
      questions (
        id,
        survey_id,
        text,
        question_type,
        options ( id, text )
      )
    `
        );
    if (errResp) throw errResp;

    const byQ = groupRowsByQuestion(respRows || []);

    const { data: allDbQuestions } = await supabase
        .from('questions')
        .select('id, survey_id, text, question_type, options ( id, text )')
        .in('survey_id', [1, 2, 3, 4, 5])
        .order('id');

    const dbBySurvey = {};
    for (const q of allDbQuestions || []) {
        if (!dbBySurvey[q.survey_id]) dbBySurvey[q.survey_id] = [];
        dbBySurvey[q.survey_id].push(q);
    }

    const totalSubmissions = new Set(
        (respRows || []).map((r) => r.submission_id).filter(Boolean)
    ).size;

    const surveys = canonical.map((s) => {
        const dbQs = (dbBySurvey[s.id] || []).slice().sort((a, b) => a.id - b.id);
        const subsForSurvey = new Set();
        for (const r of respRows || []) {
            if (!r.questions) continue;
            if (
                r.questions.survey_id === s.id &&
                r.submission_id
            ) {
                subsForSurvey.add(r.submission_id);
            }
        }
        const responsesCount = subsForSurvey.size;

        const questions = s.questions.map((seedQ, idx) => {
            const dbRow = dbQs[idx];
            if (!dbRow) {
                return {
                    text: seedQ.text,
                    type: seedQ.type,
                    responseCount: 0,
                    note: 'Sin fila en Supabase para esta posición',
                    distribution: {},
                    textSamples: [],
                    average: null
                };
            }
            const mapped = mapDbQuestion(dbRow);
            const rowsForQ = byQ[dbRow.id] || [];
            if (seedQ.type === 'text') {
                const samples = rowsForQ
                    .map((r) => r.text_value)
                    .filter(Boolean)
                    .slice(0, 8);
                return {
                    text: seedQ.text,
                    type: seedQ.type,
                    responseCount: samples.length,
                    textSamples: samples
                };
            }
            const distribution = {};
            for (const r of rowsForQ) {
                let label = '?';
                if (r.option_id != null && mapped.options) {
                    const opt = mapped.options.find((o) => o.id === r.option_id);
                    label = opt ? opt.text : `#${r.option_id}`;
                }
                distribution[label] = (distribution[label] || 0) + 1;
            }
            let average = null;
            if (seedQ.type === 'rating') {
                const nums = rowsForQ
                    .map((r) => {
                        const opt = mapped.options?.find((o) => o.id === r.option_id);
                        if (!opt) return null;
                        const n = parseInt(opt.text, 10);
                        return Number.isNaN(n) ? null : n;
                    })
                    .filter((n) => n != null);
                if (nums.length) {
                    average =
                        Math.round(
                            (nums.reduce((a, b) => a + b, 0) / nums.length) *
                                100
                        ) / 100;
                }
            }
            return {
                text: seedQ.text,
                type: seedQ.type,
                responseCount: rowsForQ.length,
                distribution,
                average
            };
        });

        return {
            id: s.id,
            title: s.title,
            icon: s.icon,
            totalQuestions: s.questions.length,
            responses: responsesCount,
            questions
        };
    });

    const recent = [];
    const seen = new Set();
    const sorted = (respRows || [])
        .filter((r) => r.created_at && r.submission_id && r.questions)
        .sort(
            (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
        );
    for (const r of sorted) {
        if (seen.has(r.submission_id)) continue;
        seen.add(r.submission_id);
        const sid = r.questions.survey_id;
        const title =
            canonical.find((x) => x.id === sid)?.title || `Encuesta ${sid}`;
        recent.push({
            surveyTitle: title,
            date: r.created_at,
            submissionId: r.submission_id
        });
        if (recent.length >= 8) break;
    }

    return {
        source: 'supabase',
        totalResponses: totalSubmissions,
        surveys,
        recentResponses: recent
    };
}

async function getStats() {
    if (!isSupabaseConfigured()) {
        return buildMemoryDetailedStats();
    }
    try {
        return await buildSupabaseDetailedStats();
    } catch (e) {
        console.error('Stats Supabase fallback memory:', e.message);
        return {
            ...buildMemoryDetailedStats(),
            warning: `No se pudo leer Supabase (${e.message}). Mostrando memoria local si hay datos.`
        };
    }
}

async function listMemoryResponses() {
    return memoryResponses;
}

async function clearMemoryResponses() {
    const count = memoryResponses.length;
    memoryResponses = [];
    return count;
}

async function getSurveyResponsesFromMemory(surveyId) {
    return memoryResponses.filter((r) => r.surveyId === surveyId);
}

module.exports = {
    listSurveys,
    getSurveyById,
    submitResponses,
    getStats,
    listMemoryResponses,
    clearMemoryResponses,
    getSurveyResponsesFromMemory,
    getMemoryResponses: () => memoryResponses,
    seedData
};
