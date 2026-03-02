import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting seed...')

    // Create demo tenant
    const tenant = await prisma.tenant.upsert({
        where: { slug: 'sharma-coaching' },
        update: {},
        create: {
            name: 'Sharma Coaching Classes',
            slug: 'sharma-coaching',
            themeColor: '#6366f1',
            address: '123, Coaching Lane, New Delhi - 110001',
            phone: '9876500001',
            email: 'admin@sharmacoaching.com',
        },
    })

    console.log('✅ Tenant created:', tenant.name)

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10)
    const admin = await prisma.user.upsert({
        where: { tenantId_email: { tenantId: tenant.id, email: 'admin@coaching.com' } },
        update: {},
        create: {
            tenantId: tenant.id,
            email: 'admin@coaching.com',
            password: hashedPassword,
            name: 'Sharma Admin',
            role: 'COACHING_ADMIN',
            phone: '9876500001',
        },
    })

    console.log('✅ Admin user created:', admin.email)

    // Create teacher user
    const teacherPassword = await bcrypt.hash('teacher123', 10)
    await prisma.user.upsert({
        where: { tenantId_email: { tenantId: tenant.id, email: 'teacher@coaching.com' } },
        update: {},
        create: {
            tenantId: tenant.id,
            email: 'teacher@coaching.com',
            password: teacherPassword,
            name: 'Rajesh Sir',
            role: 'TEACHER',
            phone: '9876500010',
        },
    })

    console.log('✅ Teacher user created')

    // Create courses
    const jee = await prisma.course.create({
        data: {
            tenantId: tenant.id,
            name: 'JEE Foundation',
            description: 'IIT-JEE Foundation course for class 11-12',
            duration: '2 Years',
            fees: 45000,
            subjects: ['Physics', 'Chemistry', 'Maths'],
        },
    })

    const neet = await prisma.course.create({
        data: {
            tenantId: tenant.id,
            name: 'NEET Preparation',
            description: 'Complete NEET preparation course',
            duration: '1 Year',
            fees: 35000,
            subjects: ['Physics', 'Chemistry', 'Biology'],
        },
    })

    console.log('✅ Courses created')

    // Create batches
    const jeeMorning = await prisma.batch.create({
        data: {
            tenantId: tenant.id,
            courseId: jee.id,
            name: 'JEE Morning Batch',
            startTime: '08:00',
            endTime: '11:00',
            capacity: 30,
        },
    })

    const neetMorning = await prisma.batch.create({
        data: {
            tenantId: tenant.id,
            courseId: neet.id,
            name: 'NEET Morning Batch',
            startTime: '08:00',
            endTime: '11:00',
            capacity: 25,
        },
    })

    console.log('✅ Batches created')

    // Create students
    const students = [
        { fullName: 'Arjun Sharma', phone: '9876501001', fatherName: 'Ramesh Sharma', parentPhone: '9876501002', courseId: jee.id, batchId: jeeMorning.id, totalFee: 45000, paidFee: 22500, studentId: 'STU001' },
        { fullName: 'Priya Verma', phone: '9876502001', fatherName: 'Suresh Verma', parentPhone: '9876502002', courseId: neet.id, batchId: neetMorning.id, totalFee: 35000, paidFee: 35000, studentId: 'STU002' },
        { fullName: 'Rahul Gupta', phone: '9876503001', fatherName: 'Vijay Gupta', parentPhone: '9876503002', courseId: jee.id, batchId: jeeMorning.id, totalFee: 45000, paidFee: 15000, studentId: 'STU003' },
        { fullName: 'Sneha Patel', phone: '9876504001', fatherName: 'Anil Patel', parentPhone: '9876504002', courseId: neet.id, batchId: neetMorning.id, totalFee: 35000, paidFee: 35000, studentId: 'STU004' },
        { fullName: 'Amit Kumar', phone: '9876505001', fatherName: 'Ravi Kumar', parentPhone: '9876505002', courseId: jee.id, batchId: jeeMorning.id, totalFee: 45000, paidFee: 20000, studentId: 'STU005' },
        { fullName: 'Kavya Singh', phone: '9876506001', fatherName: 'Deepak Singh', parentPhone: '9876506002', courseId: neet.id, batchId: neetMorning.id, totalFee: 35000, paidFee: 31000, studentId: 'STU006' },
    ]

    for (const s of students) {
        await prisma.student.create({
            data: { tenantId: tenant.id, ...s, gender: 'MALE' },
        })
    }

    console.log('✅ Students created:', students.length)

    // Create teachers
    await prisma.teacher.create({
        data: { tenantId: tenant.id, name: 'Dr. Rajesh Kumar', email: 'rajesh@coaching.com', phone: '9876510001', subject: ['Physics', 'Maths'], salary: 35000 },
    })
    await prisma.teacher.create({
        data: { tenantId: tenant.id, name: 'Priya Sharma', email: 'priya.s@coaching.com', phone: '9876510002', subject: ['Chemistry'], salary: 28000 },
    })
    await prisma.teacher.create({
        data: { tenantId: tenant.id, name: 'Amit Verma', email: 'amit.v@coaching.com', phone: '9876510003', subject: ['Biology', 'Chemistry'], salary: 30000 },
    })

    console.log('✅ Teachers created')

    // Create subscription
    await prisma.subscription.create({
        data: {
            tenantId: tenant.id,
            plan: 'PRO',
            status: 'ACTIVE',
            amount: 2999,
            trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
    })

    console.log('✅ Subscription created')

    // Create some leads
    const leads = [
        { name: 'Rohit Mehra', phone: '9876520001', course: 'JEE Foundation', source: 'WhatsApp', status: 'NEW' as const },
        { name: 'Anita Desai', phone: '9876520002', course: 'NEET Preparation', source: 'Website', status: 'CONTACTED' as const },
        { name: 'Vikash Rao', phone: '9876520003', course: 'JEE Foundation', source: 'Referral', status: 'INTERESTED' as const },
        { name: 'Pooja Jain', phone: '9876520004', course: 'NEET Preparation', source: 'Instagram', status: 'CONVERTED' as const },
    ]

    for (const l of leads) {
        await prisma.lead.create({ data: { tenantId: tenant.id, ...l } })
    }

    console.log('✅ Leads created:', leads.length)

    // Create expenses
    const expenses = [
        { category: 'Rent', amount: 25000, description: 'Monthly office rent' },
        { category: 'Salary', amount: 93000, description: 'Teacher salaries' },
        { category: 'Electricity', amount: 5000, description: 'Monthly electricity bill' },
        { category: 'Marketing', amount: 15000, description: 'Social media ads' },
        { category: 'Internet', amount: 2000, description: 'WiFi connection' },
        { category: 'Office Supplies', amount: 5000, description: 'Stationery and supplies' },
        { category: 'Maintenance', amount: 8000, description: 'AC servicing and cleaning' },
        { category: 'Misc', amount: 7000, description: 'Miscellaneous expenses' },
    ]

    for (const e of expenses) {
        await prisma.expense.create({
            data: { tenantId: tenant.id, ...e, date: new Date() },
        })
    }

    console.log('✅ Expenses created:', expenses.length)

    // Create mock tests
    await prisma.mockTest.create({
        data: {
            tenantId: tenant.id,
            batchId: jeeMorning.id,
            title: 'Physics Chapter 1 Test',
            subject: 'Physics',
            type: 'MCQ',
            duration: 60,
            totalMarks: 100,
            passingMarks: 40,
            negativeMarks: 0.25,
            isPublished: true,
        },
    })
    await prisma.mockTest.create({
        data: {
            tenantId: tenant.id,
            batchId: neetMorning.id,
            title: 'Biology Mock Test',
            subject: 'Biology',
            type: 'MCQ',
            duration: 90,
            totalMarks: 180,
            passingMarks: 90,
            negativeMarks: 1,
            isPublished: true,
        },
    })

    console.log('✅ Mock tests created')
    console.log('')
    console.log('🎉 Seed completed successfully!')
    console.log('')
    console.log('📋 Demo login credentials:')
    console.log('   Admin:   admin@coaching.com / admin123')
    console.log('   Teacher: teacher@coaching.com / teacher123')
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
