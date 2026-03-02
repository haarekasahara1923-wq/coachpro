import 'dotenv/config'
import bcrypt from 'bcryptjs'
import pg from 'pg'

const { Pool } = pg

async function main() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    })

    console.log('🌱 Starting seed...')

    // Create demo tenant
    const tenantResult = await pool.query(`
        INSERT INTO "Tenant" (id, name, slug, "themeColor", address, phone, email, "isActive", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW(), NOW())
        ON CONFLICT (slug) DO UPDATE SET name = $2
        RETURNING id
    `, [
        'tenant_demo',
        'Sharma Coaching Classes',
        'sharma-coaching',
        '#6366f1',
        'C-45, Lajpat Nagar, New Delhi - 110024',
        '9876543210',
        'info@sharmacoaching.in',
    ])
    const tenantId = tenantResult.rows[0].id
    console.log('✅ Tenant created')

    // Create Admin user
    const adminPass = await bcrypt.hash('admin123', 10)
    await pool.query(`
        INSERT INTO "User" (id, "tenantId", email, phone, password, name, role, "isActive", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW(), NOW())
        ON CONFLICT ("tenantId", email) DO NOTHING
    `, ['user_admin', tenantId, 'admin@coaching.com', '9876543210', adminPass, 'Rajesh Sharma', 'COACHING_ADMIN'])
    console.log('✅ Admin user created: admin@coaching.com / admin123')

    // Create Teacher user
    const teacherPass = await bcrypt.hash('teacher123', 10)
    await pool.query(`
        INSERT INTO "User" (id, "tenantId", email, phone, password, name, role, "isActive", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW(), NOW())
        ON CONFLICT ("tenantId", email) DO NOTHING
    `, ['user_teacher', tenantId, 'teacher@coaching.com', '9876543211', teacherPass, 'Priya Singh', 'TEACHER'])
    console.log('✅ Teacher user created: teacher@coaching.com / teacher123')

    // Create Super Admin user
    const superPass = await bcrypt.hash('super123', 10)
    await pool.query(`
        INSERT INTO "User" (id, "tenantId", email, phone, password, name, role, "isActive", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW(), NOW())
        ON CONFLICT ("tenantId", email) DO NOTHING
    `, ['user_superadmin', tenantId, 'superadmin@coachpro.in', '9999999999', superPass, 'Super Admin', 'SUPER_ADMIN'])
    console.log('✅ Super Admin created: superadmin@coachpro.in / super123')

    // Create Courses
    await pool.query(`INSERT INTO "Course" (id, "tenantId", name, description, duration, fees, subjects, "isActive", "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,true,NOW(),NOW()) ON CONFLICT DO NOTHING`, ['course_1', tenantId, 'JEE Foundation', 'IIT-JEE preparation', '2 Years', 45000, '{Physics,Chemistry,Maths}'])
    await pool.query(`INSERT INTO "Course" (id, "tenantId", name, description, duration, fees, subjects, "isActive", "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,true,NOW(),NOW()) ON CONFLICT DO NOTHING`, ['course_2', tenantId, 'NEET Preparation', 'NEET-UG preparation', '2 Years', 48000, '{Physics,Chemistry,Biology}'])
    console.log('✅ Courses created')

    // Create Batches
    await pool.query(`INSERT INTO "Batch" (id, "tenantId", "courseId", name, "startTime", "endTime", capacity, "isActive", "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,true,NOW(),NOW()) ON CONFLICT DO NOTHING`, ['batch_1', tenantId, 'course_1', 'JEE Morning Batch', '07:00', '10:00', 35])
    await pool.query(`INSERT INTO "Batch" (id, "tenantId", "courseId", name, "startTime", "endTime", capacity, "isActive", "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,true,NOW(),NOW()) ON CONFLICT DO NOTHING`, ['batch_2', tenantId, 'course_2', 'NEET Morning Batch', '07:00', '10:30', 40])
    console.log('✅ Batches created')

    // Create Students
    const students = [
        ['stu_1', 'Arjun Sharma', '9876501001', 'Ramesh Sharma', 'course_1', 'batch_1', 45000, 22500, 'STU001'],
        ['stu_2', 'Priya Verma', '9876502001', 'Suresh Verma', 'course_2', 'batch_2', 48000, 48000, 'STU002'],
        ['stu_3', 'Rahul Gupta', '9876503001', 'Mahesh Gupta', 'course_1', 'batch_1', 45000, 15000, 'STU003'],
        ['stu_4', 'Sneha Patel', '9876504001', 'Kamlesh Patel', 'course_2', 'batch_2', 25000, 25000, 'STU004'],
        ['stu_5', 'Vikram Singh', '9876505001', 'Brijesh Singh', 'course_1', 'batch_1', 48000, 24000, 'STU005'],
        ['stu_6', 'Anjali Mishra', '9876506001', 'Dinesh Mishra', 'course_2', 'batch_2', 30000, 10000, 'STU006'],
    ]
    for (const s of students) {
        await pool.query(`INSERT INTO "Student" (id, "tenantId", "courseId", "batchId", "studentId", "fullName", "fatherName", phone, gender, "totalFee", "paidFee", status, "admissionDate", "createdAt", "updatedAt") VALUES ($1,$2,$5,$6,$9,$3,$4,$3,'MALE',$7,$8,'ACTIVE',NOW(),NOW(),NOW()) ON CONFLICT DO NOTHING`, [s[0], tenantId, s[1], s[3], s[4], s[5], s[6], s[7], s[8]])
    }
    console.log('✅ Students created:', students.length)

    // Create Teachers
    await pool.query(`INSERT INTO "Teacher" (id, "tenantId", name, email, phone, subject, salary, "isActive", "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,true,NOW(),NOW()) ON CONFLICT DO NOTHING`, ['teacher_1', tenantId, 'Dr. Rajesh Kumar', 'rajesh@coaching.com', '9876511001', '{Physics,Maths}', 45000])
    await pool.query(`INSERT INTO "Teacher" (id, "tenantId", name, email, phone, subject, salary, "isActive", "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,true,NOW(),NOW()) ON CONFLICT DO NOTHING`, ['teacher_2', tenantId, 'Priya Singh', 'priya.t@coaching.com', '9876511002', '{Chemistry,Biology}', 40000])
    await pool.query(`INSERT INTO "Teacher" (id, "tenantId", name, email, phone, subject, salary, "isActive", "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,true,NOW(),NOW()) ON CONFLICT DO NOTHING`, ['teacher_3', tenantId, 'Amit Jain', 'amit@coaching.com', '9876511003', '{Maths,Accounts}', 38000])
    console.log('✅ Teachers created')

    // Create Subscription
    await pool.query(`INSERT INTO "Subscription" (id, "tenantId", plan, status, amount, "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,NOW(),NOW()) ON CONFLICT ("tenantId") DO NOTHING`, ['sub_1', tenantId, 'PRO', 'ACTIVE', 2999])
    console.log('✅ Subscription created')

    // Create Leads
    const leads = [
        ['lead_1', 'Rohan Agarwal', '9876520001', 'JEE Foundation', 'Website', 'NEW'],
        ['lead_2', 'Kavya Nair', '9876520002', 'NEET Preparation', 'WhatsApp', 'CONTACTED'],
        ['lead_3', 'Aditya Mehta', '9876520003', 'Class 10 Board', 'Referral', 'INTERESTED'],
        ['lead_4', 'Simran Kaur', '9876520004', 'JEE Foundation', 'Instagram', 'CONVERTED'],
    ]
    for (const l of leads) {
        await pool.query(`INSERT INTO "Lead" (id, "tenantId", name, phone, course, source, status, "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),NOW()) ON CONFLICT DO NOTHING`, [l[0], tenantId, l[1], l[2], l[3], l[4], l[5]])
    }
    console.log('✅ Leads created:', leads.length)

    // Create Expenses
    const expenses = [
        ['exp_1', 'Rent', 25000, 'Monthly office rent'],
        ['exp_2', 'Salary', 123000, 'Teacher salaries'],
        ['exp_3', 'Electricity', 8500, 'Electricity bill'],
        ['exp_4', 'Marketing', 15000, 'Digital marketing'],
        ['exp_5', 'Misc', 3500, 'Stationery & supplies'],
    ]
    for (const e of expenses) {
        await pool.query(`INSERT INTO "Expense" (id, "tenantId", category, amount, date, description, "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,NOW(),$5,NOW(),NOW()) ON CONFLICT DO NOTHING`, [e[0], tenantId, e[1], e[2], e[3]])
    }
    console.log('✅ Expenses created')

    // Create Mock Tests
    await pool.query(`INSERT INTO "MockTest" (id, "tenantId", "batchId", title, subject, type, duration, "totalMarks", "passingMarks", "negativeMarks", "isPublished", "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,true,NOW(),NOW()) ON CONFLICT DO NOTHING`, ['test_1', tenantId, 'batch_1', 'Physics Chapter 1 Test', 'Physics', 'MCQ', 60, 100, 40, 0.25])
    await pool.query(`INSERT INTO "MockTest" (id, "tenantId", "batchId", title, subject, type, duration, "totalMarks", "passingMarks", "negativeMarks", "isPublished", "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,true,NOW(),NOW()) ON CONFLICT DO NOTHING`, ['test_2', tenantId, 'batch_2', 'Biology Mock Test', 'Biology', 'MCQ', 90, 180, 72, 1])
    console.log('✅ Mock Tests created')

    console.log('')
    console.log('🎉 Seed completed successfully!')
    console.log('')
    console.log('📋 Demo login credentials:')
    console.log('   Admin:       admin@coaching.com / admin123')
    console.log('   Teacher:     teacher@coaching.com / teacher123')
    console.log('   Super Admin: superadmin@coachpro.in / super123')

    await pool.end()
}

main().catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
})
