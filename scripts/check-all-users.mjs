import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://Bolajon:mr.ozodbek2410@cluster0.dlopces.mongodb.net/bolajon-uz?retryWrites=true&w=majority&appName=Bolajon';

const UserSchema = new mongoose.Schema({
    name: String,
    phone: String,
    role: String,
    createdAt: Date
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function checkAllUsers() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB ga ulandi\n');

        const users = await User.find({}).sort({ createdAt: -1 }).limit(20);
        
        console.log(`📊 Oxirgi 20 ta foydalanuvchi:\n`);
        
        users.forEach((user, index) => {
            const date = new Date(user.createdAt);
            console.log(`${index + 1}. ${user.name}`);
            console.log(`   📱 ${user.phone}`);
            console.log(`   👤 ${user.role}`);
            console.log(`   📅 ${date.toLocaleString('uz-UZ', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })}`);
            console.log(`   🕐 UTC: ${user.createdAt.toISOString()}\n`);
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Xatolik:', error);
        await mongoose.disconnect();
    }
}

checkAllUsers();
