const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/trucknet?directConnection=true')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

const rideSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'DriverProfile' },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    source: { type: String, required: true },
    destination: { type: String, required: true },
    distance: { type: Number, required: true },
    price: { type: Number, required: true },
    status: { type: String, default: 'PENDING' },
    pickupLat: { type: Number, required: true },
    pickupLng: { type: Number, required: true },
    dropLat: { type: Number, required: true },
    dropLng: { type: Number, required: true },
    vehicleType: { type: String, default: 'Truck' },
    startTime: Date,
    endTime: Date
}, { timestamps: true });

const RideModel = mongoose.model('Ride', rideSchema);

async function seedRides() {
    try {
        // Create a dummy customer ID (random ObjectId)
        const customerId = new mongoose.Types.ObjectId();

        const rides = [
            {
                customerId: customerId,
                source: 'Mumbai',
                destination: 'Pune',
                distance: 150,
                price: 5000,
                status: 'PENDING',
                pickupLat: 19.0760,
                pickupLng: 72.8777,
                dropLat: 18.5204,
                dropLng: 73.8567,
                vehicleType: 'Truck'
            },
            {
                customerId: customerId,
                source: 'Delhi',
                destination: 'Jaipur',
                distance: 280,
                price: 8500,
                status: 'PENDING',
                pickupLat: 28.7041,
                pickupLng: 77.1025,
                dropLat: 26.9124,
                dropLng: 75.7873,
                vehicleType: 'Container'
            },
            {
                customerId: customerId,
                source: 'Bangalore',
                destination: 'Chennai',
                distance: 350,
                price: 12000,
                status: 'PENDING',
                pickupLat: 12.9716,
                pickupLng: 77.5946,
                dropLat: 13.0827,
                dropLng: 80.2707,
                vehicleType: 'Trailer'
            }
        ];

        await RideModel.insertMany(rides);
        console.log('Successfully seeded 3 pending rides');
    } catch (error) {
        console.error('Error seeding rides:', error);
    } finally {
        mongoose.disconnect();
    }
}

seedRides();
