import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import RecordForm from "@/app/(protected)/resident/recordForm";
import { createRecord } from "@/actions/record/create";

// Mock dependencies
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("@/actions/record/create", () => ({
  createRecord: jest.fn(),
}));

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
};

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockToast = toast as any;
const mockCreateRecord = createRecord as jest.MockedFunction<
  typeof createRecord
>;

// Mock data
const mockSurgeries = [
  {
    _id: "1",
    name: "Apendicectomía Laparoscópica",
    description: "Cirugía de apéndice",
    area: "surgery-area-1",
    steps: ["Preparación", "Incisión", "Extracción", "Cierre"],
    osats: [
      {
        item: "Técnica quirúrgica",
        scale: [
          { punctuation: 1, description: "Deficiente" },
          { punctuation: 5, description: "Excelente" },
        ],
      },
    ],
  },
  {
    _id: "2",
    name: "Colecistectomía",
    description: "Cirugía de vesícula",
    area: "surgery-area-1",
    steps: ["Preparación", "Acceso", "Extracción"],
    osats: [],
  },
];

const mockTeachers = [
  {
    _id: "teacher-1",
    user: {
      _id: "user-1",
      name: "Dr. María González",
      email: "maria@hospital.cl",
    },
    area: "surgery-area-1",
  },
  {
    _id: "teacher-2",
    user: {
      _id: "user-2",
      name: "Dr. Carlos Mendoza",
      email: "carlos@hospital.cl",
    },
    area: "surgery-area-1",
  },
];

const mockResident = {
  _id: "resident-1",
  user: {
    _id: "user-3",
    name: "Dr. Juan Pérez",
    email: "juan@hospital.cl",
  },
  area: "surgery-area-1",
};

describe("RecordForm Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue(mockRouter);
    mockToast.success = jest.fn();
    mockToast.error = jest.fn();
  });

  const renderRecordForm = () => {
    return render(
      <RecordForm
        surgeries={mockSurgeries}
        teachers={mockTeachers}
        resident={mockResident}
      />
    );
  };

  describe("Rendering", () => {
    it("should render all form fields", () => {
      renderRecordForm();

      expect(screen.getByLabelText(/cirugía/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/profesor/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/rut.*paciente/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/fecha/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/año.*residencia/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /crear registro/i })
      ).toBeInTheDocument();
    });

    it("should populate surgery options", () => {
      renderRecordForm();

      const surgerySelect = screen.getByLabelText(/cirugía/i);
      fireEvent.click(surgerySelect);

      expect(
        screen.getByText("Apendicectomía Laparoscópica")
      ).toBeInTheDocument();
      expect(screen.getByText("Colecistectomía")).toBeInTheDocument();
    });

    it("should populate teacher options", () => {
      renderRecordForm();

      const teacherSelect = screen.getByLabelText(/profesor/i);
      fireEvent.click(teacherSelect);

      expect(screen.getByText("Dr. María González")).toBeInTheDocument();
      expect(screen.getByText("Dr. Carlos Mendoza")).toBeInTheDocument();
    });

    it("should set default values correctly", () => {
      renderRecordForm();

      const residentYearSelect = screen.getByLabelText(/año.*residencia/i);
      expect(residentYearSelect).toHaveValue("1");

      const dateInput = screen.getByLabelText(/fecha/i);
      expect(dateInput).toHaveValue(new Date().toISOString().split("T")[0]);
    });
  });

  describe("Form Validation", () => {
    it("should show validation errors for empty required fields", async () => {
      const user = userEvent.setup();
      renderRecordForm();

      const submitButton = screen.getByRole("button", {
        name: /crear registro/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/seleccione una cirugia/i)).toBeInTheDocument();
        expect(screen.getByText(/seleccione un profesor/i)).toBeInTheDocument();
        expect(
          screen.getByText(/se requiere rut del paciente/i)
        ).toBeInTheDocument();
      });
    });

    it("should validate RUT format", async () => {
      const user = userEvent.setup();
      renderRecordForm();

      const rutInput = screen.getByLabelText(/rut.*paciente/i);
      await user.type(rutInput, "invalid-rut");

      const submitButton = screen.getByRole("button", {
        name: /crear registro/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/el rut ingresado no es válido/i)
        ).toBeInTheDocument();
      });
    });

    it("should validate future date restriction", async () => {
      const user = userEvent.setup();
      renderRecordForm();

      const dateInput = screen.getByLabelText(/fecha/i);
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      await user.clear(dateInput);
      await user.type(dateInput, futureDate.toISOString().split("T")[0]);

      const submitButton = screen.getByRole("button", {
        name: /crear registro/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/la fecha seleccionada aún no ha pasado/i)
        ).toBeInTheDocument();
      });
    });

    it("should accept valid RUT format", async () => {
      const user = userEvent.setup();
      renderRecordForm();

      const rutInput = screen.getByLabelText(/rut.*paciente/i);
      await user.type(rutInput, "12.345.678-9");

      // Should not show validation error
      expect(
        screen.queryByText(/el rut ingresado no es válido/i)
      ).not.toBeInTheDocument();
    });
  });

  describe("Form Submission", () => {
    it("should submit form with valid data", async () => {
      const user = userEvent.setup();
      mockCreateRecord.mockResolvedValue({
        success: true,
        recordId: "new-record-id",
      });

      renderRecordForm();

      // Fill form with valid data
      const surgerySelect = screen.getByLabelText(/cirugía/i);
      await user.click(surgerySelect);
      await user.click(screen.getByText("Apendicectomía Laparoscópica"));

      const teacherSelect = screen.getByLabelText(/profesor/i);
      await user.click(teacherSelect);
      await user.click(screen.getByText("Dr. María González"));

      const rutInput = screen.getByLabelText(/rut.*paciente/i);
      await user.type(rutInput, "12.345.678-9");

      const yearSelect = screen.getByLabelText(/año.*residencia/i);
      await user.selectOptions(yearSelect, "3");

      const submitButton = screen.getByRole("button", {
        name: /crear registro/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCreateRecord).toHaveBeenCalledWith(expect.any(FormData));
        expect(mockRouter.push).toHaveBeenCalledWith(
          "/resident/complete-record/new-record-id"
        );
      });
    });

    it("should handle submission errors", async () => {
      const user = userEvent.setup();
      mockCreateRecord.mockRejectedValue(new Error("Server error"));

      renderRecordForm();

      // Fill form with valid data
      const surgerySelect = screen.getByLabelText(/cirugía/i);
      await user.click(surgerySelect);
      await user.click(screen.getByText("Apendicectomía Laparoscópica"));

      const teacherSelect = screen.getByLabelText(/profesor/i);
      await user.click(teacherSelect);
      await user.click(screen.getByText("Dr. María González"));

      const rutInput = screen.getByLabelText(/rut.*paciente/i);
      await user.type(rutInput, "12.345.678-9");

      const submitButton = screen.getByRole("button", {
        name: /crear registro/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          "Error creando el registro"
        );
      });
    });
  });

  describe("Time Selection", () => {
    it("should set default time to current rounded time", () => {
      renderRecordForm();

      const now = new Date();
      const expectedHour = now.getHours().toString().padStart(2, "0");
      const expectedMinute = (Math.floor(now.getMinutes() / 5) * 5)
        .toString()
        .padStart(2, "0");

      // Check if time selects have reasonable default values
      const hourSelect = screen.getByDisplayValue(expectedHour);
      const minuteSelect = screen.getByDisplayValue(expectedMinute);

      expect(hourSelect).toBeInTheDocument();
      expect(minuteSelect).toBeInTheDocument();
    });

    it("should allow time selection", async () => {
      const user = userEvent.setup();
      renderRecordForm();

      const hourSelect = screen.getByLabelText(/hora/i);
      const minuteSelect = screen.getByLabelText(/minuto/i);

      await user.selectOptions(hourSelect, "14");
      await user.selectOptions(minuteSelect, "30");

      expect(hourSelect).toHaveValue("14");
      expect(minuteSelect).toHaveValue("30");
    });
  });

  describe("Accessibility", () => {
    it("should have proper form labels", () => {
      renderRecordForm();

      expect(screen.getByLabelText(/cirugía/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/profesor/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/rut.*paciente/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/fecha/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/año.*residencia/i)).toBeInTheDocument();
    });

    it("should have proper form structure", () => {
      renderRecordForm();

      const form = screen.getByRole("form");
      expect(form).toBeInTheDocument();

      const submitButton = screen.getByRole("button", {
        name: /crear registro/i,
      });
      expect(submitButton).toHaveAttribute("type", "submit");
    });
  });
});
