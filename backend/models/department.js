import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
    {
        departmentid:{
            type: String,
            required:[true, 'Department ID is required'],
            unique: true,
            trim:true,
            uppercase:true

        },
        departmentname: {
            type: String,
            required: [true, 'Department name is required'],
            trim: true,
        },
        students: {
            type: Number,
            default: 0
        },
    },
    {
        timestamps: true
    }
    
);

export const Department = mongoose.model('Department', departmentSchema )

