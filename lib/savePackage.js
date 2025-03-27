import Package from "@/models/package";
import connectDB from "./mongodb";


export const savePackage = async (packageData) => {
    try {
        await connectDB();
        const newPackage = new Package(packageData);
        await newPackage.save();
        console.log('Package saved successfully:', newPackage);
    } catch (error) {
        console.error('Error saving package:', error);
    }
};
