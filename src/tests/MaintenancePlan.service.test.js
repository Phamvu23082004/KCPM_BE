const MaintenancePlan = require("../models/MaintenancePlan.model");
const Device = require("../models/Device.model");
const User = require("../models/User.model");
const WorkHistory = require("../models/WorkHistory.model");
const MaintenancePlanService = require("../services/MaintenancePlan.service");

jest.mock("../models/MaintenancePlan.model", () => {
  const MaintenancePlan = jest.fn();

  MaintenancePlan.findOne = jest.fn();
  MaintenancePlan.findById = jest.fn();
  MaintenancePlan.findByIdAndUpdate = jest.fn();

  return MaintenancePlan;
});

jest.mock("../models/Device.model", () => ({
  findOne: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

jest.mock("../models/User.model", () => ({
  findById: jest.fn(),
}));

jest.mock("../models/WorkHistory.model", () => ({
  create: jest.fn(),
}));

const mockPopulateChain = (result) => {
  const chain = {
    populate: jest.fn(() => chain),
    then: (resolve) => resolve(result),
  };

  return chain;
};

describe("MaintenancePlanService - Lab3 Unit Testing", () => {
  const deviceId = "665f10000000000000000001";
  const technicianId = "665f00000000000000000002";
  const creatorId = "665f00000000000000000001";

  const validDevice = {
    _id: deviceId,
    status: "active",
    warranty_expiry: "2099-12-31",
    is_deleted: false,
  };

  const validTechnician = {
    _id: technicianId,
    role: "technician",
    status: "active",
  };

  const validCreator = {
    _id: creatorId,
    role: "admin",
    status: "active",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    MaintenancePlan.mockImplementation(function (planData) {
      Object.assign(this, planData);
      this._id = "new_maintenance_plan_id";
      this.save = jest.fn().mockResolvedValue(this);
    });
  });

  describe("createMaintenancePlan - match Lab2 MAINT-CREATE", () => {
    test("UTCID01 - N - tạo kế hoạch bảo trì thành công", async () => {
      const input = {
        device_id: deviceId,
        title: "Bảo trì định kỳ",
        scheduled_date: "2026-06-01",
        assigned_technician_id: technicianId,
        created_by: creatorId,
      };

      const populatedPlan = {
        _id: "new_maintenance_plan_id",
        ...input,
      };

      Device.findOne.mockResolvedValue(validDevice);
      User.findById
        .mockResolvedValueOnce(validTechnician)
        .mockResolvedValueOnce(validCreator);
      MaintenancePlan.findOne.mockResolvedValue(null);
      MaintenancePlan.findById.mockReturnValue(mockPopulateChain(populatedPlan));

      const result = await MaintenancePlanService.createMaintenancePlan(input);

      expect(Device.findOne).toHaveBeenCalledWith({
        _id: deviceId,
        is_deleted: false,
      });

      expect(User.findById).toHaveBeenCalledWith(technicianId);
      expect(User.findById).toHaveBeenCalledWith(creatorId);
      expect(MaintenancePlan.findOne).toHaveBeenCalledWith({
        device_id: deviceId,
        is_deleted: false,
        status: { $ne: "completed" },
      });

      expect(result).toEqual(populatedPlan);
    });

    test("UTCID02 - A - không tìm thấy thiết bị", async () => {
      const input = {
        device_id: "665f10000000000000009999",
        title: "Bảo trì định kỳ",
        scheduled_date: "2026-06-01",
        assigned_technician_id: technicianId,
        created_by: creatorId,
      };

      Device.findOne.mockResolvedValue(null);

      await expect(
        MaintenancePlanService.createMaintenancePlan(input)
      ).rejects.toThrow("Không tìm thấy thiết bị");

      expect(User.findById).not.toHaveBeenCalled();
      expect(MaintenancePlan.findOne).not.toHaveBeenCalled();
    });

    test("UTCID03 - A - không tìm thấy kỹ thuật viên được phân công", async () => {
      const input = {
        device_id: deviceId,
        title: "Bảo trì định kỳ",
        scheduled_date: "2026-06-01",
        assigned_technician_id: "665f00000000000000009999",
        created_by: creatorId,
      };

      Device.findOne.mockResolvedValue(validDevice);
      User.findById.mockResolvedValueOnce(null);

      await expect(
        MaintenancePlanService.createMaintenancePlan(input)
      ).rejects.toThrow("Không tìm thấy kỹ thuật viên được phân công");

      expect(MaintenancePlan.findOne).not.toHaveBeenCalled();
    });

    test("UTCID04 - A - người được phân công không phải kỹ thuật viên", async () => {
      const input = {
        device_id: deviceId,
        title: "Bảo trì định kỳ",
        scheduled_date: "2026-06-01",
        assigned_technician_id: "665f00000000000000000001",
        created_by: creatorId,
      };

      Device.findOne.mockResolvedValue(validDevice);
      User.findById.mockResolvedValueOnce({
        _id: "665f00000000000000000001",
        role: "admin",
        status: "active",
      });

      await expect(
        MaintenancePlanService.createMaintenancePlan(input)
      ).rejects.toThrow("Người được phân công không phải là kỹ thuật viên");

      expect(MaintenancePlan.findOne).not.toHaveBeenCalled();
    });

    test("UTCID08 - B - thiết bị đã hết bảo hành", async () => {
      const input = {
        device_id: "665f10000000000000000003",
        title: "Bảo trì định kỳ",
        scheduled_date: "2026-06-01",
        assigned_technician_id: technicianId,
        created_by: creatorId,
      };

      Device.findOne.mockResolvedValue({
        _id: "665f10000000000000000003",
        status: "active",
        warranty_expiry: "2000-01-01",
        is_deleted: false,
      });

      User.findById
        .mockResolvedValueOnce(validTechnician)
        .mockResolvedValueOnce(validCreator);

      await expect(
        MaintenancePlanService.createMaintenancePlan(input)
      ).rejects.toThrow(
        "Thiết bị đã hết bảo hành, không thể tạo kế hoạch bảo trì, hãy chuyển sang sửa chữa"
      );

      expect(MaintenancePlan.findOne).not.toHaveBeenCalled();
    });
  });

  describe("updateMaintenancePlan - match Lab2 MAINT-UPDATE", () => {
    test("UTCID01 - N - chuyển pending sang in_progress thành công", async () => {
      const planId = "665f30000000000000000001";

      const oldPlan = {
        _id: planId,
        device_id: deviceId,
        status: "pending",
        assigned_technician_id: technicianId,
        result: null,
        is_deleted: false,
      };

      const planUpdateData = {
        status: "in_progress",
        assigned_technician_id: technicianId,
      };

      const updatedPlan = {
        _id: planId,
        ...oldPlan,
        ...planUpdateData,
      };

      MaintenancePlan.findOne.mockResolvedValue(oldPlan);
      Device.findOne.mockResolvedValue(validDevice);
      User.findById.mockResolvedValue(validTechnician);
      MaintenancePlan.findByIdAndUpdate.mockReturnValue(
        mockPopulateChain(updatedPlan)
      );
      Device.findByIdAndUpdate.mockResolvedValue({
        ...validDevice,
        status: "under_maintenance",
      });

      const result = await MaintenancePlanService.updateMaintenancePlan(
        planId,
        planUpdateData,
        {}
      );

      expect(MaintenancePlan.findOne).toHaveBeenCalledWith({
        _id: planId,
        is_deleted: false,
      });

      expect(Device.findByIdAndUpdate).toHaveBeenCalledWith(deviceId, {
        status: "under_maintenance",
      });

      expect(WorkHistory.create).not.toHaveBeenCalled();
      expect(result).toEqual(updatedPlan);
    });

    test("UTCID02 - B - kế hoạch đã hoàn thành, không thể cập nhật thêm", async () => {
      const planId = "665f30000000000000000002";

      MaintenancePlan.findOne.mockResolvedValue({
        _id: planId,
        device_id: deviceId,
        status: "completed",
        assigned_technician_id: technicianId,
        result: "Đã xong",
      });

      await expect(
        MaintenancePlanService.updateMaintenancePlan(
          planId,
          {
            status: "completed",
            assigned_technician_id: technicianId,
            result: "Đã xong",
          },
          {
            status_after: "active",
          }
        )
      ).rejects.toThrow(
        "Kế hoạch bảo trì đã hoàn thành, không thể cập nhật thêm"
      );

      expect(Device.findOne).not.toHaveBeenCalled();
    });

    test("UTCID03 - A - không thể chuyển trực tiếp từ pending sang completed", async () => {
      const planId = "665f30000000000000000003";

      MaintenancePlan.findOne.mockResolvedValue({
        _id: planId,
        device_id: deviceId,
        status: "pending",
        assigned_technician_id: technicianId,
        result: null,
      });

      Device.findOne.mockResolvedValue(validDevice);
      User.findById.mockResolvedValue(validTechnician);

      await expect(
        MaintenancePlanService.updateMaintenancePlan(
          planId,
          {
            status: "completed",
            assigned_technician_id: technicianId,
            result: "Đã vệ sinh",
          },
          {
            status_after: "active",
          }
        )
      ).rejects.toThrow(
        "Không thể chuyển trực tiếp từ chờ thực hiện sang hoàn thành"
      );

      expect(MaintenancePlan.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    test("UTCID08 - A - cần có kết quả bảo trì khi hoàn thành", async () => {
      const planId = "665f30000000000000000008";

      MaintenancePlan.findOne.mockResolvedValue({
        _id: planId,
        device_id: deviceId,
        status: "in_progress",
        assigned_technician_id: technicianId,
        result: null,
      });

      Device.findOne.mockResolvedValue(validDevice);
      User.findById.mockResolvedValue(validTechnician);

      await expect(
        MaintenancePlanService.updateMaintenancePlan(
          planId,
          {
            status: "completed",
            assigned_technician_id: technicianId,
          },
          {
            status_after: "active",
          }
        )
      ).rejects.toThrow("Cần có kết quả bảo trì khi hoàn thành");

      expect(MaintenancePlan.findByIdAndUpdate).not.toHaveBeenCalled();
      expect(WorkHistory.create).not.toHaveBeenCalled();
    });

    test("UTCID09 - N - hoàn thành thành công và tạo WorkHistory", async () => {
      const planId = "665f30000000000000000009";

      const oldPlan = {
        _id: planId,
        device_id: deviceId,
        title: "Bảo trì định kỳ",
        description: "Kiểm tra thiết bị",
        status: "in_progress",
        assigned_technician_id: technicianId,
        result: null,
      };

      const planUpdateData = {
        status: "completed",
        assigned_technician_id: technicianId,
        result: "Thiết bị hoạt động ổn định",
      };

      const updatedPlan = {
        _id: planId,
        ...oldPlan,
        ...planUpdateData,
        completed_at: new Date(),
        device_id: {
          _id: deviceId,
          device_name: "Máy in Canon",
        },
        assigned_technician_id: {
          _id: technicianId,
          username: "tech01",
          full_name: "Kỹ thuật viên 01",
        },
      };

      MaintenancePlan.findOne.mockResolvedValue(oldPlan);
      Device.findOne.mockResolvedValue(validDevice);
      User.findById.mockResolvedValue(validTechnician);
      MaintenancePlan.findByIdAndUpdate.mockReturnValue(
        mockPopulateChain(updatedPlan)
      );
      Device.findByIdAndUpdate.mockResolvedValue({
        ...validDevice,
        status: "active",
      });
      WorkHistory.create.mockResolvedValue({
        _id: "history01",
      });

      const result = await MaintenancePlanService.updateMaintenancePlan(
        planId,
        planUpdateData,
        {
          status_after: "active",
          cost: 0,
        }
      );

      expect(Device.findByIdAndUpdate).toHaveBeenCalledWith(deviceId, {
        status: "active",
      });

      expect(WorkHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({
          work_type: "maintenance",
          source_id: planId,
          device_id: deviceId,
          technician_id: technicianId,
          title: "Bảo trì định kỳ",
          result: "Thiết bị hoạt động ổn định",
          status_after: "active",
          cost: 0,
        })
      );

      expect(result).toEqual(updatedPlan);
    });
  });
});