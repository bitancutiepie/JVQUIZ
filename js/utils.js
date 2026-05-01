function generateShortId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function parseContent(raw) {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    try {
        const parsed = JSON.parse(trimmed);
        let qArray = [];
        if (parsed.questions && Array.isArray(parsed.questions)) {
            qArray = parsed.questions;
        } else if (Array.isArray(parsed)) {
            qArray = parsed;
        }
        return qArray
            .filter(q => (q.question || (q.assertion && q.reason)) && q.answer)
            .map(q => {
                const type = q.type || 'mcq';
                let choices = Array.isArray(q.choices) ? q.choices.map(c => String(c).trim()) : [];
                let question = String(q.question || '').trim();

                if (type === 'assertion-reason') {
                    question = `Assertion (A): ${q.assertion}\nReason (R): ${q.reason}`;
                    choices = [
                        "A: Both A and R are true and R correctly explains A",
                        "B: Both A and R are true but R does not explain A",
                        "C: A is true but R is false",
                        "D: A is false but R is true"
                    ];
                }

                return {
                    type,
                    question,
                    choices,
                    answer: String(q.answer).trim(),
                    assertion: q.assertion,
                    reason: q.reason
                };
            });
    } catch (e) {
        console.error("Parse error", e);
    }
    return [];
}

function getSelectedChar() {
    const rads = document.getElementsByName('char');
    for (let r of rads) {
        if (r.checked) return r.value;
    }
    return 'ladybug';
}
