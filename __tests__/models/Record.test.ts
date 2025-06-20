import mongoose from "mongoose";
import { Record, IRecord } from "@/models/Record";
import { Area } from "@/models/Area";
import { User } from "@/models/User";
import { Resident } from "@/models/Resident";
import { Teacher } from "@/models/Teacher";
import { Surgery } from "@/models/Surgery";
import { setupTestDB, teardownTestDB, clearTestDB } from "../utils/db-utils";

describe("Record Model", () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  describe("Schema Validation", () => {
    let testArea: any;
    let testResident: any;
    let testTeacher: any;
    let testSurgery: any;
    let residentUser: any;
    let teacherUser: any;

    beforeEach(async () => {
      // Create test area
      testArea = await Area.create({
        name: "Cirugía General",
        description: "Test area",
      });

      // Create test users
      residentUser = await User.create({
        name: "Dr. Juan Pérez",
        email: "juan@hospital.cl",
        role: "resident",
        rut: "12.345.678-5",
      });

      teacherUser = await User.create({
        name: "Dr. María González",
        email: "maria@hospital.cl",
        role: "teacher",
        rut: "98.765.432-1",
      });

      // Create resident and teacher
      testResident = await Resident.create({
        user: residentUser._id,
        area: testArea._id,
      });

      testTeacher = await Teacher.create({
        user: teacherUser._id,
        area: testArea._id,
      });

      // Create test surgery
      testSurgery = await Surgery.create({
        name: "Apendicectomía Laparoscópica",
        description: "Test surgery",
        area: testArea._id,
        steps: [
          "Preparación del campo quirúrgico",
          "Incisión y acceso laparoscópico",
          "Extracción del apéndice",
        ],
        osats: [
          {
            item: "Técnica quirúrgica",
            scale: [
              { punctuation: "1", description: "Deficiente" },
              { punctuation: "3", description: "Competente" },
              { punctuation: "5", description: "Excelente" },
            ],
          },
        ],
      });
    });

    it("should create a valid record with all fields", async () => {
      const recordData = {
        resident: testResident._id,
        teacher: testTeacher._id,
        patientId: "12.345.678-9",
        date: new Date("2024-01-15"),
        surgery: testSurgery._id,
        status: "pending" as const,
        residentsYear: 3,
        steps: [
          {
            name: "Preparación del campo quirúrgico",
            residentDone: true,
            teacherDone: false,
            score: "a" as const,
          },
          {
            name: "Incisión y acceso laparoscópico",
            residentDone: false,
            teacherDone: false,
            score: "b" as const,
          },
        ],
        osats: [
          {
            item: "Técnica quirúrgica",
            scale: [
              { punctuation: 1, description: "Deficiente" },
              { punctuation: 5, description: "Excelente" },
            ],
            obtained: 3,
          },
        ],
        residentJudgment: 7,
        teacherJudgment: 8,
        summaryScale: "B" as const,
        residentComment: "Procedimiento completado satisfactoriamente",
        feedback: "Buen trabajo, mejorar en técnica de sutura",
      };

      const record = new Record(recordData);
      const savedRecord = await record.save();

      expect(savedRecord._id).toBeDefined();
      expect(savedRecord.resident.toString()).toBe(testResident._id.toString());
      expect(savedRecord.teacher.toString()).toBe(testTeacher._id.toString());
      expect(savedRecord.patientId).toBe(recordData.patientId);
      expect(savedRecord.date).toEqual(recordData.date);
      expect(savedRecord.surgery.toString()).toBe(testSurgery._id.toString());
      expect(savedRecord.status).toBe(recordData.status);
      expect(savedRecord.residentsYear).toBe(recordData.residentsYear);
      expect(savedRecord.steps).toHaveLength(2);
      expect(savedRecord.osats).toHaveLength(1);
      expect(savedRecord.residentJudgment).toBe(recordData.residentJudgment);
      expect(savedRecord.teacherJudgment).toBe(recordData.teacherJudgment);
      expect(savedRecord.summaryScale).toBe(recordData.summaryScale);
      expect(savedRecord.residentComment).toBe(recordData.residentComment);
      expect(savedRecord.feedback).toBe(recordData.feedback);
      expect(savedRecord.deleted).toBe(false);
      expect(savedRecord.createdAt).toBeDefined();
      expect(savedRecord.updatedAt).toBeDefined();
    });

    it("should create record with minimal required fields", async () => {
      const recordData = {
        resident: testResident._id,
        teacher: testTeacher._id,
        patientId: "98.765.432-1",
        date: new Date(),
        surgery: testSurgery._id,
        residentsYear: 1,
      };

      const record = new Record(recordData);
      const savedRecord = await record.save();

      expect(savedRecord.status).toBe("pending");
      expect(savedRecord.residentJudgment).toBe(0);
      expect(savedRecord.teacherJudgment).toBe(0);
      expect(savedRecord.summaryScale).toBe("A");
      expect(savedRecord.steps).toEqual([]);
      expect(savedRecord.osats).toEqual([]);
      expect(savedRecord.deleted).toBe(false);
    });

    it("should fail validation without required fields", async () => {
      const record = new Record({});
      await expect(record.save()).rejects.toThrow();
    });

    it("should fail validation without resident", async () => {
      const record = new Record({
        teacher: testTeacher._id,
        patientId: "12.345.678-9",
        date: new Date(),
        surgery: testSurgery._id,
        residentsYear: 1,
      });
      await expect(record.save()).rejects.toThrow();
    });

    it("should fail validation without teacher", async () => {
      const record = new Record({
        resident: testResident._id,
        patientId: "12.345.678-9",
        date: new Date(),
        surgery: testSurgery._id,
        residentsYear: 1,
      });
      await expect(record.save()).rejects.toThrow();
    });

    it("should fail validation without patientId", async () => {
      const record = new Record({
        resident: testResident._id,
        teacher: testTeacher._id,
        date: new Date(),
        surgery: testSurgery._id,
        residentsYear: 1,
      });
      await expect(record.save()).rejects.toThrow();
    });

    it("should trim whitespace from string fields", async () => {
      const recordData = {
        resident: testResident._id,
        teacher: testTeacher._id,
        patientId: "  12.345.678-9  ",
        date: new Date(),
        surgery: testSurgery._id,
        residentsYear: 1,
        residentComment: "  Test comment  ",
        feedback: "  Test feedback  ",
      };

      const record = new Record(recordData);
      const savedRecord = await record.save();

      expect(savedRecord.patientId).toBe("12.345.678-9");
      expect(savedRecord.residentComment).toBe("Test comment");
      expect(savedRecord.feedback).toBe("Test feedback");
    });
  });

  describe("Status Validation", () => {
    let testData: any;

    beforeEach(async () => {
      const area = await Area.create({ name: "Test Area" });
      const residentUser = await User.create({
        name: "Resident",
        email: "resident@test.com",
        role: "resident",
        rut: "12.345.678-5",
      });
      const teacherUser = await User.create({
        name: "Teacher",
        email: "teacher@test.com",
        role: "teacher",
        rut: "98.765.432-1",
      });
      const resident = await Resident.create({
        user: residentUser._id,
        area: area._id,
      });
      const teacher = await Teacher.create({
        user: teacherUser._id,
        area: area._id,
      });
      const surgery = await Surgery.create({
        name: "Test Surgery",
        area: area._id,
        steps: ["Step 1"],
        osats: [],
      });

      testData = {
        resident: resident._id,
        teacher: teacher._id,
        patientId: "12.345.678-9",
        date: new Date(),
        surgery: surgery._id,
        residentsYear: 1,
      };
    });

    it("should accept valid status values", async () => {
      const validStatuses = ["pending", "corrected", "reviewed", "canceled"];

      for (const status of validStatuses) {
        const record = new Record({ ...testData, status });
        const savedRecord = await record.save();
        expect(savedRecord.status).toBe(status);
      }
    });

    it("should reject invalid status values", async () => {
      const record = new Record({ ...testData, status: "invalid" as any });
      await expect(record.save()).rejects.toThrow();
    });

    it("should default to pending status", async () => {
      const record = new Record(testData);
      const savedRecord = await record.save();
      expect(savedRecord.status).toBe("pending");
    });
  });

  describe("Steps Validation", () => {
    let testData: any;

    beforeEach(async () => {
      const area = await Area.create({ name: "Test Area" });
      const residentUser = await User.create({
        name: "Resident",
        email: "resident@test.com",
        role: "resident",
        rut: "12.345.678-5",
      });
      const teacherUser = await User.create({
        name: "Teacher",
        email: "teacher@test.com",
        role: "teacher",
        rut: "98.765.432-1",
      });
      const resident = await Resident.create({
        user: residentUser._id,
        area: area._id,
      });
      const teacher = await Teacher.create({
        user: teacherUser._id,
        area: area._id,
      });
      const surgery = await Surgery.create({
        name: "Test Surgery",
        area: area._id,
        steps: ["Step 1"],
        osats: [],
      });

      testData = {
        resident: resident._id,
        teacher: teacher._id,
        patientId: "12.345.678-9",
        date: new Date(),
        surgery: surgery._id,
        residentsYear: 1,
      };
    });

    it("should validate step structure", async () => {
      const steps = [
        {
          name: "Preparación",
          residentDone: true,
          teacherDone: false,
          score: "a" as const,
        },
        {
          name: "Procedimiento",
          residentDone: false,
          teacherDone: true,
          score: "b" as const,
        },
      ];

      const record = new Record({ ...testData, steps });
      const savedRecord = await record.save();

      expect(savedRecord.steps).toHaveLength(2);
      expect(savedRecord.steps[0].name).toBe("Preparación");
      expect(savedRecord.steps[0].residentDone).toBe(true);
      expect(savedRecord.steps[0].teacherDone).toBe(false);
      expect(savedRecord.steps[0].score).toBe("a");
    });

    it("should accept valid score values", async () => {
      const validScores = ["a", "b", "c", "n/a"];

      for (const score of validScores) {
        const steps = [{ name: "Test Step", score: score as any }];
        const record = new Record({ ...testData, steps });
        const savedRecord = await record.save();
        expect(savedRecord.steps[0].score).toBe(score);
      }
    });

    it("should reject invalid score values", async () => {
      const steps = [{ name: "Test Step", score: "invalid" as any }];
      const record = new Record({ ...testData, steps });
      await expect(record.save()).rejects.toThrow();
    });

    it("should set default values for step fields", async () => {
      const steps = [{ name: "Test Step" }];
      const record = new Record({ ...testData, steps });
      const savedRecord = await record.save();

      expect(savedRecord.steps[0].residentDone).toBe(false);
      expect(savedRecord.steps[0].teacherDone).toBe(false);
      expect(savedRecord.steps[0].score).toBe("a");
    });
  });

  describe("OSAT Validation", () => {
    let testData: any;

    beforeEach(async () => {
      const area = await Area.create({ name: "Test Area" });
      const residentUser = await User.create({
        name: "Resident",
        email: "resident@test.com",
        role: "resident",
        rut: "12.345.678-5",
      });
      const teacherUser = await User.create({
        name: "Teacher",
        email: "teacher@test.com",
        role: "teacher",
        rut: "98.765.432-1",
      });
      const resident = await Resident.create({
        user: residentUser._id,
        area: area._id,
      });
      const teacher = await Teacher.create({
        user: teacherUser._id,
        area: area._id,
      });
      const surgery = await Surgery.create({
        name: "Test Surgery",
        area: area._id,
        steps: ["Step 1"],
        osats: [],
      });

      testData = {
        resident: resident._id,
        teacher: teacher._id,
        patientId: "12.345.678-9",
        date: new Date(),
        surgery: surgery._id,
        residentsYear: 1,
      };
    });

    it("should validate OSAT structure", async () => {
      const osats = [
        {
          item: "Técnica quirúrgica",
          scale: [
            { punctuation: 1, description: "Deficiente" },
            { punctuation: 5, description: "Excelente" },
          ],
          obtained: 3,
        },
      ];

      const record = new Record({ ...testData, osats });
      const savedRecord = await record.save();

      expect(savedRecord.osats).toHaveLength(1);
      expect(savedRecord.osats[0].item).toBe("Técnica quirúrgica");
      expect(savedRecord.osats[0].scale).toHaveLength(2);
      expect(savedRecord.osats[0].obtained).toBe(3);
    });

    it("should set default obtained value", async () => {
      const osats = [
        {
          item: "Test OSAT",
          scale: [{ punctuation: 1 }],
        },
      ];

      const record = new Record({ ...testData, osats });
      const savedRecord = await record.save();

      expect(savedRecord.osats[0].obtained).toBe(0);
    });

    it("should fail validation without OSAT item", async () => {
      const osats = [
        {
          scale: [{ punctuation: 1 }],
        },
      ];

      const record = new Record({ ...testData, osats });
      await expect(record.save()).rejects.toThrow();
    });

    it("should fail validation without scale punctuation", async () => {
      const osats = [
        {
          item: "Test OSAT",
          scale: [{ description: "Test" }],
        },
      ];

      const record = new Record({ ...testData, osats });
      await expect(record.save()).rejects.toThrow();
    });
  });

  describe("Summary Scale Validation", () => {
    let testData: any;

    beforeEach(async () => {
      const area = await Area.create({ name: "Test Area" });
      const residentUser = await User.create({
        name: "Resident",
        email: "resident@test.com",
        role: "resident",
        rut: "12.345.678-5",
      });
      const teacherUser = await User.create({
        name: "Teacher",
        email: "teacher@test.com",
        role: "teacher",
        rut: "98.765.432-1",
      });
      const resident = await Resident.create({
        user: residentUser._id,
        area: area._id,
      });
      const teacher = await Teacher.create({
        user: teacherUser._id,
        area: area._id,
      });
      const surgery = await Surgery.create({
        name: "Test Surgery",
        area: area._id,
        steps: ["Step 1"],
        osats: [],
      });

      testData = {
        resident: resident._id,
        teacher: teacher._id,
        patientId: "12.345.678-9",
        date: new Date(),
        surgery: surgery._id,
        residentsYear: 1,
      };
    });

    it("should accept valid summary scale values", async () => {
      const validScales = ["A", "B", "C", "D", "E"];

      for (const scale of validScales) {
        const record = new Record({ ...testData, summaryScale: scale as any });
        const savedRecord = await record.save();
        expect(savedRecord.summaryScale).toBe(scale);
      }
    });

    it("should reject invalid summary scale values", async () => {
      const record = new Record({ ...testData, summaryScale: "F" as any });
      await expect(record.save()).rejects.toThrow();
    });

    it("should default to A scale", async () => {
      const record = new Record(testData);
      const savedRecord = await record.save();
      expect(savedRecord.summaryScale).toBe("A");
    });
  });

  describe("Relationships", () => {
    let testArea: any;
    let testResident: any;
    let testTeacher: any;
    let testSurgery: any;
    let testRecord: any;

    beforeEach(async () => {
      testArea = await Area.create({ name: "Cirugía General" });

      const residentUser = await User.create({
        name: "Dr. Juan Pérez",
        email: "juan@hospital.cl",
        role: "resident",
        rut: "12.345.678-5",
      });

      const teacherUser = await User.create({
        name: "Dr. María González",
        email: "maria@hospital.cl",
        role: "teacher",
        rut: "98.765.432-1",
      });

      testResident = await Resident.create({
        user: residentUser._id,
        area: testArea._id,
      });

      testTeacher = await Teacher.create({
        user: teacherUser._id,
        area: testArea._id,
      });

      testSurgery = await Surgery.create({
        name: "Apendicectomía",
        area: testArea._id,
        steps: ["Step 1"],
        osats: [],
      });

      testRecord = await Record.create({
        resident: testResident._id,
        teacher: testTeacher._id,
        patientId: "12.345.678-9",
        date: new Date(),
        surgery: testSurgery._id,
        residentsYear: 3,
      });
    });

    it("should populate resident correctly", async () => {
      const populatedRecord = await Record.findById(testRecord._id).populate({
        path: "resident",
        populate: {
          path: "user",
          model: "User",
        },
      });

      expect(populatedRecord?.resident.user.name).toBe("Dr. Juan Pérez");
    });

    it("should populate teacher correctly", async () => {
      const populatedRecord = await Record.findById(testRecord._id).populate({
        path: "teacher",
        populate: {
          path: "user",
          model: "User",
        },
      });

      expect(populatedRecord?.teacher.user.name).toBe("Dr. María González");
    });

    it("should populate surgery correctly", async () => {
      const populatedRecord = await Record.findById(testRecord._id).populate(
        "surgery"
      );

      expect(populatedRecord?.surgery.name).toBe("Apendicectomía");
    });

    it("should populate all relationships", async () => {
      const populatedRecord = await Record.findById(testRecord._id)
        .populate({
          path: "resident",
          populate: { path: "user", model: "User" },
        })
        .populate({
          path: "teacher",
          populate: { path: "user", model: "User" },
        })
        .populate("surgery");

      expect(populatedRecord?.resident.user.name).toBe("Dr. Juan Pérez");
      expect(populatedRecord?.teacher.user.name).toBe("Dr. María González");
      expect(populatedRecord?.surgery.name).toBe("Apendicectomía");
    });
  });

  describe("Soft Delete", () => {
    let testRecord: any;

    beforeEach(async () => {
      const area = await Area.create({ name: "Test Area" });
      const residentUser = await User.create({
        name: "Resident",
        email: "resident@test.com",
        role: "resident",
        rut: "12.345.678-5",
      });
      const teacherUser = await User.create({
        name: "Teacher",
        email: "teacher@test.com",
        role: "teacher",
        rut: "98.765.432-1",
      });
      const resident = await Resident.create({
        user: residentUser._id,
        area: area._id,
      });
      const teacher = await Teacher.create({
        user: teacherUser._id,
        area: area._id,
      });
      const surgery = await Surgery.create({
        name: "Test Surgery",
        area: area._id,
        steps: ["Step 1"],
        osats: [],
      });

      testRecord = await Record.create({
        resident: resident._id,
        teacher: teacher._id,
        patientId: "12.345.678-9",
        date: new Date(),
        surgery: surgery._id,
        residentsYear: 1,
      });
    });

    it("should mark record as deleted", async () => {
      testRecord.deleted = true;
      await testRecord.save();

      const deletedRecord = await Record.findById(testRecord._id);
      expect(deletedRecord?.deleted).toBe(true);
    });

    it("should filter out deleted records", async () => {
      const area = await Area.create({ name: "Test Area 2" });
      const residentUser = await User.create({
        name: "Resident 2",
        email: "resident2@test.com",
        role: "resident",
        rut: "11.111.111-1",
      });
      const teacherUser = await User.create({
        name: "Teacher 2",
        email: "teacher2@test.com",
        role: "teacher",
        rut: "22.222.222-2",
      });
      const resident = await Resident.create({
        user: residentUser._id,
        area: area._id,
      });
      const teacher = await Teacher.create({
        user: teacherUser._id,
        area: area._id,
      });
      const surgery = await Surgery.create({
        name: "Test Surgery 2",
        area: area._id,
        steps: ["Step 1"],
        osats: [],
      });

      await Record.create([
        {
          resident: resident._id,
          teacher: teacher._id,
          patientId: "11.111.111-1",
          date: new Date(),
          surgery: surgery._id,
          residentsYear: 1,
        },
        {
          resident: resident._id,
          teacher: teacher._id,
          patientId: "22.222.222-2",
          date: new Date(),
          surgery: surgery._id,
          residentsYear: 1,
          deleted: true,
        },
      ]);

      const activeRecords = await Record.find({ deleted: { $ne: true } });
      expect(activeRecords).toHaveLength(2); // Original + new active record

      const allRecords = await Record.find({});
      expect(allRecords).toHaveLength(3); // All records including deleted
    });
  });
});
