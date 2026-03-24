const ApiError = require("../utils/ApiError");
const deviceService = require("../services/Device.service");
const deviceModel = require("../models/device.model");

const createDevice = async (req, res, next) => {
    try {
        const { device_name, category, location} = req.body;
        if (!device_name || !category || !location) {
            throw new ApiError(400, 1001, "Thieu thong tin");
        }
        const result = await deviceService.createDevice(req.body)
        return res.success(result, "Them thiet bi thanh cong", 200);
        } catch (error) {
        next(error)
    }
}

const getAllDevices = async(req, res, next) => {
    try {
        const result = await deviceService.getAllDevices()
        return res.success(result, "Lay tat ca thiet bi thanh cong", 200);
    } catch (error) {
        next(error)
    }
}

const getDevicebyId = async (req, res, next) => {
    try {
        const _id = req.params.id;
        if (!_id){
            throw new ApiError(400, 1003, "Thieu thong tin");
        }
        const result = await deviceService.getDevicebyId(_id);
        return res.success(result, "Lay thiet bi thanh cong", 200);

    } catch (error) {
        next(error)
    }
}

const updateDevice = async (req, res, next) => {
    try {
        const _id = req.params.id;
        const updateData = req.body;
        if (!_id){
            throw new ApiError(400, 1005, "Thieu thong tin");
        }
        const allowedFields = [
            "device_name",
            "category",
            "location",
            "status",
            "purchase_date",
            "warranty_expiry",
            "manufacturer",
            "notes"
        ]
        const filteredData = {};

        allowedFields.map(field => {
            if(updateData[field])
                filteredData[field] = updateData[field]
        })
        if (Object.keys(filteredData).length == 0)
            throw new ApiError(400, 1006, "Khong co du lieu hop le de cap nhat")
        
        const result = await deviceService.updateDevice(_id,filteredData);
        return res.success(result, "Cap nhat thiet bi thanh cong", 200);
    } catch (error) {
        next(error)
    }
}

const softDeleteDevice = async (req, res, next) => {
    try {
        const _id = req.params.id;
        if(!_id)
            throw new ApiError(400, 1007, "Thieu du lieu");
        
        const result = await deviceService.softDeleteDevice(_id);

        return res.success(result, "Xoa mem thiet bi thanh cong",200);
    } catch (error) {
        next(error)
    }
}
module.exports = {createDevice, getAllDevices, getDevicebyId, updateDevice, softDeleteDevice}