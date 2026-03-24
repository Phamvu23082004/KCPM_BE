const Device = require("../models/device.model")
const ApiError = require("../utils/ApiError")

const createDevice = async (deviceData) => {
    try {
        const newDevice = new Device(deviceData);
        await newDevice.save();
        return newDevice;
    } catch (error) {
        throw new ApiError(500, 1002, "Tạo thiết bị thất bại");
    }
}

const getAllDevices = async () => {
    const devices = await Device.find({is_deleted : false})
    return devices;
}

const getDevicebyId = async (deviceId) => {
    try {
        const devices = await Device.findOne({_id : deviceId, is_deleted : false});
        if(!devices){
            throw new ApiError(404,1004,"Khong tim thay thiet bi")
        }
        return devices;
        
    } catch (error) {
        throw error;
    }
}

const updateDevice = async (devicedId, filteredData) => {
    try {
        const updateDevice = await Device.findByIdAndUpdate(
            devicedId,
            filteredData,
            {
                new: true,
                runValidators: true,
            }
        );
        if (updateDevice === null)
            throw new ApiError(404, 1004, "Khong tim thay thiet bi");
        return updateDevice;
    } catch (error) {
        throw error;
    }
}

const softDeleteDevice = async (deviceId) => {
    try {
        const deleteDevice = await Device.findOneAndUpdate(
        {
            _id : deviceId,
            is_deleted : false,
        },
        {
            is_deleted :true,
        },
        {
            new : true,
            runValidators : true,
        },
    )
        if (!deleteDevice)
            throw new ApiError(404, 1007, "Khong tim thay thiet bi");

        return deleteDevice;
    } catch (error) {
        throw (error)
    }
    

}
module.exports = {createDevice, getAllDevices, getDevicebyId, updateDevice, softDeleteDevice};