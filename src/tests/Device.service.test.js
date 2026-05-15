const Device = require("../models/Device.model");
const DeviceService = require("../services/Device.service");

jest.mock("../models/Device.model", () => {
  const Device = jest.fn();

  Device.findOneAndUpdate = jest.fn();

  return Device;
});

describe("DeviceService - Lab3 Unit Testing", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    Device.mockImplementation(function (deviceData) {
      Object.assign(this, deviceData);
      this._id = "new_device_id";
      this.save = jest.fn().mockResolvedValue(this);
    });
  });

  describe("createDevice - match Lab2 DEVICE-CREATE", () => {
    test("UTCID01 - N - tạo thiết bị thành công", async () => {
      const input = {
        device_name: "Máy in Canon LBP 2900",
        category: "Printer",
        status: "active",
        warranty_expiry: "2027-12-31",
      };

      const result = await DeviceService.createDevice(input);

      expect(Device).toHaveBeenCalledWith(input);
      expect(result.device_name).toBe("Máy in Canon LBP 2900");
      expect(result.category).toBe("Printer");
      expect(result.status).toBe("active");
      expect(result.warranty_expiry).toBe("2027-12-31");
    });

    test("UTCID02 - A - dữ liệu thiết bị không hợp lệ", async () => {
      const input = {
        device_name: "N/A",
        category: "Printer",
        status: "active",
        warranty_expiry: "2027-12-31",
      };

      const validationError = new Error("Validation error");
      validationError.name = "ValidationError";

      Device.mockImplementationOnce(function (deviceData) {
        Object.assign(this, deviceData);
        this.save = jest.fn().mockRejectedValue(validationError);
      });

      await expect(DeviceService.createDevice(input)).rejects.toThrow(
        "Dữ liệu thiết bị không hợp lệ"
      );
    });
  });

  describe("updateDevice - match Lab2 DEVICE-UPDATE", () => {
    test("UTCID01 - N - cập nhật thiết bị thành công", async () => {
      const deviceId = "665f10000000000000000001";
      const filteredData = {
        status: "inactive",
      };

      const updatedDevice = {
        _id: deviceId,
        device_name: "Máy in Canon LBP 2900",
        status: "inactive",
        is_deleted: false,
      };

      Device.findOneAndUpdate.mockResolvedValue(updatedDevice);

      const result = await DeviceService.updateDevice(deviceId, filteredData);

      expect(Device.findOneAndUpdate).toHaveBeenCalledWith(
        {
          _id: deviceId,
          is_deleted: false,
        },
        filteredData,
        {
          new: true,
          runValidators: true,
        }
      );

      expect(result).toEqual(updatedDevice);
      expect(result.status).toBe("inactive");
    });

    test("UTCID02 - A - không tìm thấy thiết bị", async () => {
      const deviceId = "665f10000000000000009999";
      const filteredData = {
        status: "active",
      };

      Device.findOneAndUpdate.mockResolvedValue(null);

      await expect(
        DeviceService.updateDevice(deviceId, filteredData)
      ).rejects.toThrow("Không tìm thấy thiết bị");
    });

    test("UTCID03 - A - mã thiết bị không hợp lệ", async () => {
      const deviceId = "as123";
      const filteredData = {
        status: "active",
      };

      const castError = new Error("Cast error");
      castError.name = "CastError";

      Device.findOneAndUpdate.mockRejectedValue(castError);

      await expect(
        DeviceService.updateDevice(deviceId, filteredData)
      ).rejects.toThrow("Mã thiết bị không hợp lệ");
    });

    test("UTCID04 - B - dữ liệu cập nhật không hợp lệ", async () => {
      const deviceId = "665f10000000000000000001";
      const filteredData = {
        status: "unknown",
      };

      const validationError = new Error("Validation error");
      validationError.name = "ValidationError";

      Device.findOneAndUpdate.mockRejectedValue(validationError);

      await expect(
        DeviceService.updateDevice(deviceId, filteredData)
      ).rejects.toThrow("Dữ liệu cập nhật không hợp lệ");
    });
  });
});