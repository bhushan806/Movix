const mongoose = require('mongoose');

const DATABASE_URL = "mongodb://127.0.0.1:27017/trucknet?directConnection=true";

const userSchema = new mongoose.Schema({ email: String });
const User = mongoose.model('User', userSchema);

const ownerProfileSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    companyName: String
});
const OwnerProfile = mongoose.model('OwnerProfile', ownerProfileSchema);

const vehicleSchema = new mongoose.Schema({
    number: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    capacity: { type: Number, required: true },
    status: { type: String, default: 'AVAILABLE' },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'OwnerProfile', required: true },
    currentLat: Number,
    currentLng: Number
}, { timestamps: true });
const Vehicle = mongoose.model('Vehicle', vehicleSchema);

async function main() {
    console.log('--- Add Test Vehicle ---');
    try {
        await mongoose.connect(DATABASE_URL);

        const email = 'pbhushanpatil8@gmail.com';
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found');
            return;
        }
        console.log('User found:', user._id);

        const owner = await OwnerProfile.findOne({ userId: user._id });
        if (!owner) {
            console.log('Owner profile not found');
            return;
        }
        console.log('Owner profile found:', owner._id);

        const vehicleNumber = 'MH-TEST-' + Math.floor(Math.random() * 1000);

        const vehicle = await Vehicle.create({
            number: vehicleNumber,
            type: 'Truck',
            capacity: 10,
            ownerId: owner._id,
            status: 'AVAILABLE',
            currentLat: 18.5204,
            currentLng: 73.8567
        });

        console.log('✅ Test Vehicle Created:', vehicle.number);

    } catch (e) {
        console.error('❌ Error:', e);
    } finally {
        await mongoose.disconnect();
    }
}

main();
