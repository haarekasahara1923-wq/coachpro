import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/app/api/middleware'
import { store, generateId } from '@/lib/store'

export async function GET(req: NextRequest) {
    const { error, user } = requireAuth(req)
    if (error) return error

    const students = store.students.filter(s => s.tenantId === user!.tenantId)
    const courses = store.courses.filter(c => c.tenantId === user!.tenantId)
    const batches = store.batches.filter(b => b.tenantId === user!.tenantId)

    const enriched = students.map(s => ({
        ...s,
        courseName: courses.find(c => c.id === s.courseId)?.name || 'N/A',
        batchName: batches.find(b => b.id === s.batchId)?.name || 'N/A',
    }))

    const { search, course, batch, status } = Object.fromEntries(
        new URL(req.url).searchParams.entries()
    )

    let filtered = enriched
    if (search) {
        const q = search.toLowerCase()
        filtered = filtered.filter(s =>
            s.fullName.toLowerCase().includes(q) ||
            s.phone.includes(q) ||
            s.studentId?.toLowerCase().includes(q) ||
            s.email?.toLowerCase().includes(q)
        )
    }
    if (course) filtered = filtered.filter(s => s.courseId === course)
    if (batch) filtered = filtered.filter(s => s.batchId === batch)
    if (status) filtered = filtered.filter(s => s.status === status)

    return NextResponse.json({ success: true, data: filtered, total: filtered.length })
}

export async function POST(req: NextRequest) {
    const { error, user } = requireAuth(req)
    if (error) return error

    const body = await req.json()
    const { fullName, phone, courseId, batchId, fatherName, motherName, parentPhone, email, address, gender, dob, admissionDate, feePlan, totalFee, notes } = body

    if (!fullName || !phone || !courseId || !batchId) {
        return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
    }

    const studentCount = store.students.filter(s => s.tenantId === user!.tenantId).length + 1
    const newStudent = {
        id: generateId(),
        tenantId: user!.tenantId,
        courseId,
        batchId,
        studentId: `STU${String(studentCount).padStart(3, '0')}`,
        fullName,
        fatherName: fatherName || '',
        motherName: motherName || '',
        phone,
        parentPhone: parentPhone || '',
        email: email || '',
        address: address || '',
        gender: gender || 'MALE',
        dob: dob || '',
        admissionDate: admissionDate || new Date().toISOString().split('T')[0],
        feePlan: feePlan || '',
        totalFee: parseFloat(totalFee) || 0,
        paidFee: 0,
        status: 'ACTIVE',
        notes: notes || '',
        createdAt: new Date(),
    }

    store.students.push(newStudent)

    return NextResponse.json({ success: true, data: newStudent }, { status: 201 })
}
