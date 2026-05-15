const RepairPlan = require("../models/RepairPlan.model");
const Device = require("../models/Device.model");
const User = require("../models/User.model");
const WorkHistory = require("../models/WorkHistory.model");
const RepairPlanService = require("../services/RepairPlan.service");

jest.mock("../models/RepairPlan.model", () => {
  const RepairPlan = jest.fn();

  RepairPlan.findOne = jest.fn();
  RepairPlan.findById = jest.fn();
  RepairPlan.findByIdAndUpdate = jest.fn();

  return RepairPlan;
});

jest.mock("../models/Device.model", () => ({
  findOne: jest.fn(),
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

describe("RepairPlanService - Lab3 Unit Testing", () => {
  const deviceId = "665f10000000000000000002";
  const technicianId = "665f00000000000000000002";
  const creatorId = "665f00000000000000000001";

  const validDevice = {
    _id: deviceId,
    status: "broken",
    is_deleted: false,
  };

  const validCreator = {
    _id: creatorId,
    role: "admin",
    status: "active",
  };

  const validTechnician = {
    _id: technicianId,
    role: "technician",
    status: "active",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    RepairPlan.mockImplementation(function (planData) {
      Object.assign(this, planData);
      this._id = "new_repair_plan_id";
      this.save = jest.fn().mockResolvedValue(this);
    });
  });

  describe("createRepairPlan - match Lab2 REPAIR-CREATE", () => {
    test("UTCID01 - N - tạo yêu cầu sửa chữa thành công, mặc định status assigned", async () => {
      const input = {
        device_id: deviceId,
        title: "Sửa máy in",
        issue_description: "Máy in bị kẹt giấy",
        created_by: creatorId,
        assigned_technician_id: technicianId,
      };

      const populatedPlan = {
        _id: "new_repair_plan_id",
        ...input,
        status: "assigned",
      };

      Device.findOne.mockResolvedValue(validDevice);
      RepairPlan.findOne.mockResolvedValue(null);
      User.findById
        .mockResolvedValueOnce(validCreator)
        .mockResolvedValueOnce(validTechnician);
      RepairPlan.findById.mockReturnValue(mockPopulateChain(populatedPlan));

      const result = await RepairPlanService.createRepairPlan(input);

      expect(Device.findOne).toHaveBeenCalledWith({
        _id: deviceId,
        is_deleted: false,
      });

      expect(RepairPlan.findOne).toHaveBeenCalledWith({
        device_id: deviceId,
        is_deleted: false,
        status: { $ne: "completed" },
      });

      expect(RepairPlan).toHaveBeenCalledWith(
        expect.objectContaining({
          device_id: deviceId,
          title: "Sửa máy in",
          issue_description: "Máy in bị kẹt giấy",
          created_by: creatorId,
          assigned_technician_id: technicianId,
          status: "assigned",
          assigned_at: expect.any(Date),
        })
      );

      expect(result).toEqual(populatedPlan);
    });

    test("UTCID02 - A - không tìm thấy thiết bị", async () => {
      const input = {
        device_id: "665f10000000000000009999",
        title: "Sửa máy in",
        issue_description: "Máy in bị kẹt giấy",
        created_by: creatorId,
        assigned_technician_id: technicianId,
        status: "assigned",
      };

      Device.findOne.mockResolvedValue(null);

      await expect(RepairPlanService.createRepairPlan(input)).rejects.toThrow(
        "Không tìm thấy thiết bị"
      );

      expect(RepairPlan.findOne).not.toHaveBeenCalled();
      expect(User.findById).not.toHaveBeenCalled();
    });

    test("UTCID03 - A - thiết bị đang bảo trì, không thể tạo yêu cầu sửa chữa", async () => {
      const input = {
        device_id: "665f10000000000000000004",
        title: "Sửa máy in",
        issue_description: "Máy in bị kẹt giấy",
        created_by: creatorId,
        assigned_technician_id: technicianId,
        status: "assigned",
      };

      Device.findOne.mockResolvedValue({
        _id: "665f10000000000000000004",
        status: "under_maintenance",
        is_deleted: false,
      });

      await expect(RepairPlanService.createRepairPlan(input)).rejects.toThrow(
        "Thiết bị đang trong quá trình bảo trì, không thể tạo yêu cầu sửa chữa"
      );

      expect(RepairPlan.findOne).not.toHaveBeenCalled();
    });

    test("UTCID04 - B - thiết bị đã có yêu cầu sửa chữa chưa hoàn thành", async () => {
      const input = {
        device_id: deviceId,
        title: "Sửa máy in",
        issue_description: "Máy in bị kẹt giấy",
        created_by: creatorId,
        assigned_technician_id: technicianId,
        status: "assigned",
      };

      Device.findOne.mockResolvedValue(validDevice);
      RepairPlan.findOne.mockResolvedValue({
        _id: "existing_repair_id",
        device_id: deviceId,
        status: "assigned",
        is_deleted: false,
      });

      await expect(RepairPlanService.createRepairPlan(input)).rejects.toThrow(
        "Thiết bị đã có yêu cầu sửa chữa chưa hoàn thành"
      );

      expect(User.findById).not.toHaveBeenCalled();
    });

    test("UTCID07 - A - không tìm thấy kỹ thuật viên được phân công", async () => {
      const input = {
        device_id: deviceId,
        title: "Sửa máy in",
        issue_description: "Máy in bị kẹt giấy",
        created_by: creatorId,
        assigned_technician_id: "665f00000000000000009999",
        status: "assigned",
      };

      Device.findOne.mockResolvedValue(validDevice);
      RepairPlan.findOne.mockResolvedValue(null);
      User.findById
        .mockResolvedValueOnce(validCreator)
        .mockResolvedValueOnce(null);

      await expect(RepairPlanService.createRepairPlan(input)).rejects.toThrow(
        "Không tìm thấy kỹ thuật viên được phân công"
      );
    });
  });

  describe("updateRepairPlan - match Lab2 REPAIR-UPDATE", () => {
    test("UTCID01 - N - cập nhật yêu cầu sửa chữa thành công", async () => {
      const planId = "665f50000000000000000001";

      const oldPlan = {
        _id: planId,
        device_id: deviceId,
        title: "Sửa máy in",
        issue_description: "Máy in bị kẹt giấy",
        status: "new",
        assigned_technician_id: null,
        assigned_at: null,
        repair_result: null,
      };

      const planUpdateData = {
        status: "assigned",
        assigned_technician_id: technicianId,
      };

      const updatedPlan = {
        _id: planId,
        ...oldPlan,
        ...planUpdateData,
        assigned_at: new Date(),
      };

      RepairPlan.findOne.mockResolvedValue(oldPlan);
      Device.findOne.mockResolvedValue(validDevice);
      User.findById.mockResolvedValue(validTechnician);
      RepairPlan.findByIdAndUpdate.mockReturnValue(
        mockPopulateChain(updatedPlan)
      );

      const result = await RepairPlanService.updateRepairPlan(
        planId,
        planUpdateData,
        {}
      );

      expect(RepairPlan.findOne).toHaveBeenCalledWith({
        _id: planId,
        is_deleted: false,
      });

      expect(RepairPlan.findByIdAndUpdate).toHaveBeenCalledWith(
        planId,
        expect.objectContaining({
          status: "assigned",
          assigned_technician_id: technicianId,
          assigned_at: expect.any(Date),
        }),
        {
          new: true,
          runValidators: true,
        }
      );

      expect(WorkHistory.create).not.toHaveBeenCalled();
      expect(result).toEqual(updatedPlan);
    });

    test("UTCID02 - A - không tìm thấy yêu cầu sửa chữa", async () => {
      const planId = "665f50000000000000009999";

      RepairPlan.findOne.mockResolvedValue(null);

      await expect(
        RepairPlanService.updateRepairPlan(planId, {}, {})
      ).rejects.toThrow("Không tìm thấy yêu cầu sửa chữa");

      expect(Device.findOne).not.toHaveBeenCalled();
      expect(RepairPlan.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    test("UTCID03 - B - yêu cầu sửa chữa đã hoàn thành, không thể cập nhật thêm", async () => {
      const planId = "665f50000000000000000002";

      RepairPlan.findOne.mockResolvedValue({
        _id: planId,
        device_id: deviceId,
        status: "completed",
        assigned_technician_id: technicianId,
        repair_result: "Đã sửa",
      });

      await expect(
        RepairPlanService.updateRepairPlan(
          planId,
          {
            status: "completed",
            assigned_technician_id: technicianId,
            repair_result: "Đã sửa",
          },
          {
            cost: 350000,
            status_before: "broken",
            status_after: "active",
          }
        )
      ).rejects.toThrow(
        "Yêu cầu sửa chữa đã hoàn thành, không thể cập nhật thêm"
      );

      expect(Device.findOne).not.toHaveBeenCalled();
    });

    test("UTCID08 - A - cần có kết quả sửa chữa khi hoàn thành", async () => {
      const planId = "665f50000000000000000007";

      RepairPlan.findOne.mockResolvedValue({
        _id: planId,
        device_id: deviceId,
        title: "Sửa máy in",
        issue_description: "Máy in bị kẹt giấy",
        status: "in_progress",
        assigned_technician_id: technicianId,
        repair_result: null,
      });

      Device.findOne.mockResolvedValue(validDevice);
      User.findById.mockResolvedValue(validTechnician);

      await expect(
        RepairPlanService.updateRepairPlan(
          planId,
          {
            status: "completed",
            assigned_technician_id: technicianId,
          },
          {
            status_before: "broken",
            status_after: "active",
          }
        )
      ).rejects.toThrow("Cần có kết quả sửa chữa khi hoàn thành");

      expect(RepairPlan.findByIdAndUpdate).not.toHaveBeenCalled();
      expect(WorkHistory.create).not.toHaveBeenCalled();
    });

    test("UTCID09 - N - hoàn thành thành công và tạo WorkHistory repair", async () => {
      const planId = "665f50000000000000000008";

      const oldPlan = {
        _id: planId,
        device_id: deviceId,
        title: "Sửa máy in",
        issue_description: "Máy in bị kẹt giấy",
        status: "in_progress",
        assigned_technician_id: technicianId,
        repair_result: null,
        cost: 0,
      };

      const planUpdateData = {
        status: "completed",
        assigned_technician_id: technicianId,
        repair_result: "Đã thay cụm kéo giấy",
      };

      const updatedPlan = {
        _id: planId,
        ...oldPlan,
        ...planUpdateData,
        completed_at: new Date(),
        cost: 350000,
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

      RepairPlan.findOne.mockResolvedValue(oldPlan);
      Device.findOne.mockResolvedValue(validDevice);
      User.findById.mockResolvedValue(validTechnician);
      RepairPlan.findByIdAndUpdate.mockReturnValue(
        mockPopulateChain(updatedPlan)
      );
      WorkHistory.create.mockResolvedValue({
        _id: "repair_history_id",
      });

      const result = await RepairPlanService.updateRepairPlan(
        planId,
        planUpdateData,
        {
          cost: 350000,
          status_before: "broken",
          status_after: "active",
        }
      );

      expect(RepairPlan.findByIdAndUpdate).toHaveBeenCalledWith(
        planId,
        expect.objectContaining({
          status: "completed",
          assigned_technician_id: technicianId,
          repair_result: "Đã thay cụm kéo giấy",
          completed_at: expect.any(Date),
        }),
        {
          new: true,
          runValidators: true,
        }
      );

      expect(WorkHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({
          work_type: "repair",
          source_id: planId,
          device_id: deviceId,
          technician_id: technicianId,
          title: "Sửa máy in",
          description: "Máy in bị kẹt giấy",
          result: "Đã thay cụm kéo giấy",
          status_before: "broken",
          status_after: "active",
          cost: 350000,
        })
      );

      expect(result).toEqual(updatedPlan);
    });
  });
});