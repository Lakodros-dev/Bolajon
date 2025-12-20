/**
 * Settings Model
 * Stores app-wide settings like payment info
 */
import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    }
}, {
    timestamps: true
});

// Static method to get a setting
SettingsSchema.statics.get = async function (key, defaultValue = null) {
    const setting = await this.findOne({ key });
    return setting ? setting.value : defaultValue;
};

// Static method to set a setting
SettingsSchema.statics.set = async function (key, value) {
    return await this.findOneAndUpdate(
        { key },
        { key, value },
        { upsert: true, new: true }
    );
};

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
