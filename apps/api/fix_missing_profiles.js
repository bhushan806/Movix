const mongoose = require('mongoose');

const DATABASE_URL = "mongodb://127.0.0.1:27017/trucknet?directConnection=true";

// Define Schemas
const userSchema = new mongoose.Schema({
    email: String,
    name: String,
    role: String
}, { timestamps: true });
const User = mongoose.model('User', userSchema);

const ownerProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    companyName: { type: String }
}, { timestamps: true });
const OwnerProfile = mongoose.model('OwnerProfile', ownerProfileSchema);

async function main() {
    console.log('--- Fix Missing Profiles ---');

    try {
        await mongoose.connect(DATABASE_URL);
        console.log('Mongoose connected.');

        const users = await User.find({ role: { $in: ['OWNER', 'ADMIN'] } });
        console.log(`Found ${users.length} OWNER/ADMIN users.`);

        for (const user of users) {
            const profile = await OwnerProfile.findOne({ userId: user._id });
            if (!profile) {
                console.log(`Creating missing profile for: ${user.email} (${user.role})`);
                await OwnerProfile.create({
                    userId: user._id,
                    companyName: `${user.name}'s Transport`
                });
                console.log('✅ Profile created.');
            } else {
                console.log(`Profile exists for: ${user.email}`);
            }
        }

    } catch (e) {
        console.error('❌ Error:', e);
    } finally {
        await mongoose.disconnect();
    }
}

main();
