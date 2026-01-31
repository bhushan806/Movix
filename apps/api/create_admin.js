const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const DATABASE_URL = "mongodb://127.0.0.1:27017/trucknet?directConnection=true";

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, default: 'CUSTOMER' },
    isVerified: { type: Boolean, default: false },
    avatar: { type: String },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function main() {
    console.log('Creating Admin User (via Mongoose)...');
    try {
        await mongoose.connect(DATABASE_URL);
        console.log('Connected to MongoDB');

        const email = 'admin@trucknet.com';
        const password = 'admin123';
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if user exists
        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                email,
                phone: '9999999999',
                password: hashedPassword,
                name: 'Admin User',
                role: 'ADMIN'
            });
            console.log('Admin User Created:', user.email);
        } else {
            // Update password if user exists
            user.password = hashedPassword;
            await user.save();
            console.log('Admin User Updated with new password:', user.email);
        }

    } catch (e) {
        console.error('Error creating admin:', e);
    } finally {
        await mongoose.disconnect();
    }
}

main();
