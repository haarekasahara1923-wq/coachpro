import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireFeature, checkPlanLimit } from '@/app/api/middleware'

// Mock AI question generation - Replace with actual OpenAI/Gemini API calls
function generateMockQuestions(subject: string, topic: string, count: number, difficulty: string, type: string) {
    const templates = {
        Physics: [
            { q: `What is the SI unit of ${topic || 'force'}?`, options: ['Newton', 'Joule', 'Watt', 'Pascal'], answer: 'A' },
            { q: `Which law states that every action has an equal and opposite reaction?`, options: ["Newton's First Law", "Newton's Second Law", "Newton's Third Law", "Law of Gravitation"], answer: 'C' },
            { q: `The velocity of light in vacuum is approximately:`, options: ['3 × 10⁸ m/s', '3 × 10⁶ m/s', '3 × 10¹⁰ m/s', '3 × 10⁴ m/s'], answer: 'A' },
        ],
        Chemistry: [
            { q: `The atomic number of Carbon is:`, options: ['6', '12', '8', '14'], answer: 'A' },
            { q: `What is the chemical formula of water?`, options: ['H₂O', 'CO₂', 'NaCl', 'H₂SO₄'], answer: 'A' },
            { q: `Which gas is responsible for the greenhouse effect?`, options: ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Argon'], answer: 'C' },
        ],
        Maths: [
            { q: `What is the value of π (pi) approximately?`, options: ['3.14', '2.71', '1.41', '1.73'], answer: 'A' },
            { q: `The sum of angles of a triangle is:`, options: ['90°', '180°', '270°', '360°'], answer: 'B' },
            { q: `What is the derivative of sin(x)?`, options: ['cos(x)', '-cos(x)', 'tan(x)', '-sin(x)'], answer: 'A' },
        ],
        Biology: [
            { q: `The powerhouse of the cell is:`, options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Chloroplast'], answer: 'B' },
            { q: `DNA stands for:`, options: ['Deoxyribonucleic Acid', 'Dinitrogen Acid', 'Deoxyribose Nucleic Acid', 'None of these'], answer: 'A' },
            { q: `Photosynthesis occurs in:`, options: ['Mitochondria', 'Nucleus', 'Chloroplast', 'Cytoplasm'], answer: 'C' },
        ],
    }

    const subjectTemplates = templates[subject as keyof typeof templates] || templates.Physics
    const questions = []

    for (let i = 0; i < count; i++) {
        const template = subjectTemplates[i % subjectTemplates.length]
        questions.push({
            subject,
            topic: topic || subject,
            questionText: template.q,
            type: type || 'MCQ',
            options: type === 'DESCRIPTIVE' ? [] : template.options,
            correctAnswer: type === 'DESCRIPTIVE' ? '' : template.answer,
            marks: difficulty === 'HARD' ? 4 : difficulty === 'EASY' ? 1 : 2,
            difficulty: difficulty || 'MEDIUM',
            explanation: `This is a ${difficulty || 'medium'} level question on ${topic || subject}.`,
        })
    }

    return questions
}

export async function POST(req: NextRequest) {
    const { error, user } = requireAuth(req)
    if (error) return error

    // Feature gate check: User needs Pro/Elite plan for AI tools
    const featureCheck = requireFeature(req, 'aiTools')
    if (featureCheck.error) return featureCheck.error

    const body = await req.json()
    const { subject, topic, count = 5, difficulty = 'MEDIUM', type = 'MCQ' } = body

    if (!subject) {
        return NextResponse.json({ error: 'Subject is required' }, { status: 400 })
    }

    // You could track generated questions here for billing/limits
    // const limitCheck = checkPlanLimit(user!.tenantId, 'maxAIQuestions', currentCount + parseInt(count))

    // In production, call OpenAI or Gemini here
    const questions = generateMockQuestions(subject, topic, parseInt(count), difficulty, type)

    return NextResponse.json({
        success: true,
        data: questions,
        message: `Generated ${questions.length} ${type} questions for ${subject}`,
    })
}
