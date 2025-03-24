import mongoose from "mongoose";

const packageSchema = new mongoose.Schema({
    UserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    name: {
        type: String,
        required: true, 
    },
    images: {
      type: Number,
      min: 0,
      default: 50  
    },
    price: {
        type: Number,
        required: true, 
    },
}, {
    timestamps: true,
});

const Package = mongoose.models.Package || mongoose.model("Package", packageSchema);

export default Package;