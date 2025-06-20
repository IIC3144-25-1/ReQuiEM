import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserForm } from "@/components/forms/UserForm";

// Mock the form actions
const mockCreateUser = jest.fn();
const mockUpdateUser = jest.fn();

jest.mock("@/actions/user/create", () => ({
  createUser: (...args: any[]) => mockCreateUser(...args),
}));

jest.mock("@/actions/user/update", () => ({
  updateUser: (...args: any[]) => mockUpdateUser(...args),
}));

// Mock react-hook-form
jest.mock("react-hook-form", () => ({
  useForm: () => ({
    register: jest.fn((name) => ({ name })),
    handleSubmit: jest.fn((fn) => (e) => {
      e.preventDefault();
      fn({
        name: "Test User",
        email: "test@example.com",
        role: "resident",
        rut: "12.345.678-5",
      });
    }),
    formState: { errors: {}, isSubmitting: false },
    reset: jest.fn(),
    setValue: jest.fn(),
    watch: jest.fn(),
  }),
  Controller: ({ render }: any) => render({ field: { onChange: jest.fn(), value: "" } }),
}));

// Mock UI components
jest.mock("@/components/ui/form", () => ({
  Form: ({ children }: { children: React.ReactNode }) => <form>{children}</form>,
  FormControl: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  FormField: ({ render }: any) => render({ field: { onChange: jest.fn(), value: "" } }),
  FormItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  FormLabel: ({ children }: { children: React.ReactNode }) => <label>{children}</label>,
  FormMessage: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

jest.mock("@/components/ui/input", () => ({
  Input: (props: any) => <input {...props} />,
}));

jest.mock("@/components/ui/select", () => ({
  Select: ({ children, onValueChange }: any) => (
    <select onChange={(e) => onValueChange?.(e.target.value)}>{children}</select>
  ),
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, type, disabled }: any) => (
    <button type={type} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

describe("UserForm Component", () => {
  const defaultProps = {
    onSuccess: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render create form correctly", () => {
      render(<UserForm {...defaultProps} />);

      expect(screen.getByText("Crear Usuario")).toBeInTheDocument();
      expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/rol/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/rut/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /crear/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /cancelar/i })).toBeInTheDocument();
    });

    it("should render edit form correctly", () => {
      const user = {
        _id: "123",
        name: "John Doe",
        email: "john@example.com",
        role: "resident" as const,
        rut: "12.345.678-5",
        isActive: true,
      };

      render(<UserForm {...defaultProps} user={user} />);

      expect(screen.getByText("Editar Usuario")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /actualizar/i })).toBeInTheDocument();
    });

    it("should render all role options", () => {
      render(<UserForm {...defaultProps} />);

      const roleSelect = screen.getByLabelText(/rol/i);
      expect(roleSelect).toBeInTheDocument();

      // Check if role options are available
      expect(screen.getByText("Administrador")).toBeInTheDocument();
      expect(screen.getByText("Docente")).toBeInTheDocument();
      expect(screen.getByText("Residente")).toBeInTheDocument();
    });

    it("should show loading state when submitting", () => {
      const { rerender } = render(<UserForm {...defaultProps} />);

      // Mock submitting state
      jest.mocked(require("react-hook-form").useForm).mockReturnValue({
        register: jest.fn((name) => ({ name })),
        handleSubmit: jest.fn((fn) => (e) => {
          e.preventDefault();
          fn({});
        }),
        formState: { errors: {}, isSubmitting: true },
        reset: jest.fn(),
        setValue: jest.fn(),
        watch: jest.fn(),
      });

      rerender(<UserForm {...defaultProps} />);

      const submitButton = screen.getByRole("button", { name: /crear/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe("Form Validation", () => {
    it("should show validation errors", () => {
      // Mock form with errors
      jest.mocked(require("react-hook-form").useForm).mockReturnValue({
        register: jest.fn((name) => ({ name })),
        handleSubmit: jest.fn((fn) => (e) => {
          e.preventDefault();
          fn({});
        }),
        formState: {
          errors: {
            name: { message: "El nombre es requerido" },
            email: { message: "El email es requerido" },
            role: { message: "El rol es requerido" },
            rut: { message: "El RUT es requerido" },
          },
          isSubmitting: false,
        },
        reset: jest.fn(),
        setValue: jest.fn(),
        watch: jest.fn(),
      });

      render(<UserForm {...defaultProps} />);

      expect(screen.getByText("El nombre es requerido")).toBeInTheDocument();
      expect(screen.getByText("El email es requerido")).toBeInTheDocument();
      expect(screen.getByText("El rol es requerido")).toBeInTheDocument();
      expect(screen.getByText("El RUT es requerido")).toBeInTheDocument();
    });

    it("should validate email format", async () => {
      const user = userEvent.setup();
      render(<UserForm {...defaultProps} />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, "invalid-email");

      // Trigger validation
      const submitButton = screen.getByRole("button", { name: /crear/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/formato de email inválido/i)).toBeInTheDocument();
      });
    });

    it("should validate RUT format", async () => {
      const user = userEvent.setup();
      render(<UserForm {...defaultProps} />);

      const rutInput = screen.getByLabelText(/rut/i);
      await user.type(rutInput, "invalid-rut");

      const submitButton = screen.getByRole("button", { name: /crear/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/formato de RUT inválido/i)).toBeInTheDocument();
      });
    });
  });

  describe("Form Submission", () => {
    it("should call createUser on form submission for new user", async () => {
      mockCreateUser.mockResolvedValue({ success: true, data: { _id: "123" } });

      const user = userEvent.setup();
      render(<UserForm {...defaultProps} />);

      // Fill form
      await user.type(screen.getByLabelText(/nombre/i), "Test User");
      await user.type(screen.getByLabelText(/email/i), "test@example.com");
      await user.selectOptions(screen.getByLabelText(/rol/i), "resident");
      await user.type(screen.getByLabelText(/rut/i), "12.345.678-5");

      // Submit form
      const submitButton = screen.getByRole("button", { name: /crear/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCreateUser).toHaveBeenCalledWith({
          name: "Test User",
          email: "test@example.com",
          role: "resident",
          rut: "12.345.678-5",
        });
      });
    });

    it("should call updateUser on form submission for existing user", async () => {
      const existingUser = {
        _id: "123",
        name: "John Doe",
        email: "john@example.com",
        role: "resident" as const,
        rut: "12.345.678-5",
        isActive: true,
      };

      mockUpdateUser.mockResolvedValue({ success: true, data: existingUser });

      const user = userEvent.setup();
      render(<UserForm {...defaultProps} user={existingUser} />);

      const submitButton = screen.getByRole("button", { name: /actualizar/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateUser).toHaveBeenCalledWith("123", expect.any(Object));
      });
    });

    it("should call onSuccess callback on successful submission", async () => {
      mockCreateUser.mockResolvedValue({ success: true, data: { _id: "123" } });

      const user = userEvent.setup();
      render(<UserForm {...defaultProps} />);

      const submitButton = screen.getByRole("button", { name: /crear/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(defaultProps.onSuccess).toHaveBeenCalled();
      });
    });

    it("should handle submission errors", async () => {
      mockCreateUser.mockResolvedValue({ 
        success: false, 
        error: "El usuario ya existe" 
      });

      const user = userEvent.setup();
      render(<UserForm {...defaultProps} />);

      const submitButton = screen.getByRole("button", { name: /crear/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("El usuario ya existe")).toBeInTheDocument();
      });
    });

    it("should handle network errors", async () => {
      mockCreateUser.mockRejectedValue(new Error("Network error"));

      const user = userEvent.setup();
      render(<UserForm {...defaultProps} />);

      const submitButton = screen.getByRole("button", { name: /crear/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/error inesperado/i)).toBeInTheDocument();
      });
    });
  });

  describe("User Interactions", () => {
    it("should call onCancel when cancel button is clicked", async () => {
      const user = userEvent.setup();
      render(<UserForm {...defaultProps} />);

      const cancelButton = screen.getByRole("button", { name: /cancelar/i });
      await user.click(cancelButton);

      expect(defaultProps.onCancel).toHaveBeenCalled();
    });

    it("should reset form when reset is called", () => {
      const mockReset = jest.fn();
      jest.mocked(require("react-hook-form").useForm).mockReturnValue({
        register: jest.fn((name) => ({ name })),
        handleSubmit: jest.fn(),
        formState: { errors: {}, isSubmitting: false },
        reset: mockReset,
        setValue: jest.fn(),
        watch: jest.fn(),
      });

      render(<UserForm {...defaultProps} />);

      // Simulate reset action (this would typically be triggered by a prop change or internal logic)
      expect(mockReset).toHaveBeenCalled();
    });

    it("should populate form fields when editing existing user", () => {
      const existingUser = {
        _id: "123",
        name: "John Doe",
        email: "john@example.com",
        role: "resident" as const,
        rut: "12.345.678-5",
        isActive: true,
      };

      const mockSetValue = jest.fn();
      jest.mocked(require("react-hook-form").useForm).mockReturnValue({
        register: jest.fn((name) => ({ name })),
        handleSubmit: jest.fn(),
        formState: { errors: {}, isSubmitting: false },
        reset: jest.fn(),
        setValue: mockSetValue,
        watch: jest.fn(),
      });

      render(<UserForm {...defaultProps} user={existingUser} />);

      expect(mockSetValue).toHaveBeenCalledWith("name", "John Doe");
      expect(mockSetValue).toHaveBeenCalledWith("email", "john@example.com");
      expect(mockSetValue).toHaveBeenCalledWith("role", "resident");
      expect(mockSetValue).toHaveBeenCalledWith("rut", "12.345.678-5");
    });
  });

  describe("Accessibility", () => {
    it("should have proper form labels", () => {
      render(<UserForm {...defaultProps} />);

      expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/rol/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/rut/i)).toBeInTheDocument();
    });

    it("should have proper button roles", () => {
      render(<UserForm {...defaultProps} />);

      expect(screen.getByRole("button", { name: /crear/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /cancelar/i })).toBeInTheDocument();
    });

    it("should have proper form structure", () => {
      render(<UserForm {...defaultProps} />);

      const form = screen.getByRole("form");
      expect(form).toBeInTheDocument();
    });
  });
});
