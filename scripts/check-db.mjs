/**
 * Check Database Contents
 * Run with: node scripts/check-db.mjs
 */
import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://Lakodros:Lakodros01@thebase.bx3mew2.mongodb.net/bolajon-uz?retryWrites=true&w=majority&appName=TheBase';

async function checkDatabase() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const db = mongoose.connection.db;

        // Get all collections
        const collections = await db.listCollections().toArray();
        console.log('📦 Collections in database:');
        console.log('─────────────────────────────');
        collections.forEach(col => {
            console.log(`  • ${col.name}`);
        });
        console.log('');

        // Check Users
        console.log('👥 USERS:');
        console.log('─────────────────────────────');
        const users = await db.collection('users').find({}).toArray();
        if (users.length === 0) {
            console.log('  ❌ No users found!');
        } else {
            users.forEach(user => {
                console.log(`  • ${user.name}`);
                console.log(`    Phone: ${user.phone}`);
                console.log(`    Role: ${user.role}`);
                console.log(`    Active: ${user.isActive}`);
                console.log(`    Subscription: ${user.subscriptionStatus || 'N/A'}`);
                console.log('');
            });
        }

        // Check Students
        console.log('👦 STUDENTS:');
        console.log('─────────────────────────────');
        const students = await db.collection('students').find({}).toArray();
        if (students.length === 0) {
            console.log('  ℹ️  No students yet');
        } else {
            console.log(`  Total: ${students.length} students`);
            students.forEach(student => {
                console.log(`  • ${student.name} (${student.age} yosh) - ${student.stars} yulduz`);
            });
        }
        console.log('');

        // Check Lessons
        console.log('📚 LESSONS:');
        console.log('─────────────────────────────');
        const lessons = await db.collection('lessons').find({}).toArray();
        if (lessons.length === 0) {
            console.log('  ❌ No lessons found!');
        } else {
            console.log(`  Total: ${lessons.length} lessons`);
            const byLevel = {};
            lessons.forEach(lesson => {
                if (!byLevel[lesson.level]) byLevel[lesson.level] = [];
                byLevel[lesson.level].push(lesson);
            });
            Object.keys(byLevel).sort().forEach(level => {
                console.log(`  Level ${level}:`);
                byLevel[level].forEach(lesson => {
                    console.log(`    • ${lesson.title} (${lesson.duration} min)`);
                });
            });
        }
        console.log('');

        // Check Rewards
        console.log('🎁 REWARDS:');
        console.log('─────────────────────────────');
        const rewards = await db.collection('rewards').find({}).toArray();
        if (rewards.length === 0) {
            console.log('  ❌ No rewards found!');
        } else {
            console.log(`  Total: ${rewards.length} rewards`);
            rewards.forEach(reward => {
                console.log(`  • ${reward.title} - ${reward.cost} yulduz (${reward.category})`);
            });
        }
        console.log('');

        // Check Progress
        console.log('📊 PROGRESS:');
        console.log('─────────────────────────────');
        const progress = await db.collection('progresses').find({}).toArray();
        if (progress.length === 0) {
            console.log('  ℹ️  No progress records yet');
        } else {
            console.log(`  Total: ${progress.length} completed lessons`);
        }
        console.log('');

        // Check Redemptions
        console.log('🎉 REDEMPTIONS:');
        console.log('─────────────────────────────');
        const redemptions = await db.collection('redemptions').find({}).toArray();
        if (redemptions.length === 0) {
            console.log('  ℹ️  No redemptions yet');
        } else {
            console.log(`  Total: ${redemptions.length} rewards redeemed`);
        }
        console.log('');

        // Summary
        console.log('📈 SUMMARY:');
        console.log('─────────────────────────────');
        console.log(`  Users: ${users.length}`);
        console.log(`  Students: ${students.length}`);
        console.log(`  Lessons: ${lessons.length}`);
        console.log(`  Rewards: ${rewards.length}`);
        console.log(`  Progress: ${progress.length}`);
        console.log(`  Redemptions: ${redemptions.length}`);
        console.log('');

        // Check if seed is needed
        if (users.length === 0 || lessons.length === 0 || rewards.length === 0) {
            console.log('⚠️  WARNING: Database is incomplete!');
            console.log('   Run: node scripts/seed.mjs');
        } else {
            console.log('✅ Database looks good!');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkDatabase();
