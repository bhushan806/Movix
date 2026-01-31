import mongoose from 'mongoose';

const loadSchema = new mongoose.Schema({
    source: { type: String, required: true },
    destination: { type: String, required: true },
    weight: { type: Number, required: true },
    goodsType: { type: String, required: true },
    price: { type: Number, required: true },
    status: { type: String, default: 'PENDING' },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'OwnerProfile', required: true }
}, { timestamps: true });

export const LoadModel = mongoose.model('Load', loadSchema);
