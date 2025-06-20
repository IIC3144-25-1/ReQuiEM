import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ResidentForm } from '@/app/(protected)/admin/resident/residentForm';
import { createResident } from '@/actions/resident/create';
import { updateResident } from '@/actions/resident/update';
import { getResidentByID } from '@/actions/resident/getByID';

// Mock dependencies
jest.mock('next/navigation');
jest.mock('sonner');
jest.mock('@/actions/resident/create');
jest.mock('@/actions/resident/update');
jest.mock('@/actions/resident/getByID');

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
};

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockToast = toast as jest.MockedFunction<typeof toast>;
const mockCreateResident = createResident as jest.MockedFunction<typeof createResident>;
const mockUpdateResident = updateResident as jest.MockedFunction<typeof updateResident>;
const mockGetResidentByID = getResidentByID as jest.MockedFunction<typeof getResidentByID>;

// Mock data
const mockAreas = [
  {
    _id: 'area-1',
    name: 'Cirugía General',
    description: 'Área de cirugía general'
  },
  {
    _id: 'area-2',
    name: 'Cardiología',
    description: 'Área de cardiología'
  }
];

const mockResident = {
  _id: 'resident-1',
  user: {
    _id: 'user-1',
    name: 'Dr. Juan Pérez',
    email: 'juan.perez@hospital.cl',
    rut: '12.345.678-9',
    phone: '+56912345678'
  },
  area: 'area-1'
};

describe('ResidentForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue(mockRouter);
    mockToast.success = jest.fn();
    mockToast.error = jest.fn();
  });

  describe('Create Mode', () => {
    const renderCreateForm = () => {
      return render(<ResidentForm id="new" areas={mockAreas} />);
    };

    it('should render all form fields for creation', async () => {
      renderCreateForm();

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/área/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /crear residente/i })).toBeInTheDocument();
      });
    });

    it('should show loading skeleton initially', () => {
      renderCreateForm();

      // Should show skeleton while loading
      expect(screen.getByTestId('skeleton')).toBeInTheDocument();
    });

    it('should populate area options', async () => {
      renderCreateForm();

      await waitFor(() => {
        const areaSelect = screen.getByLabelText(/área/i);
        fireEvent.click(areaSelect);

        expect(screen.getByText('Cirugía General')).toBeInTheDocument();
        expect(screen.getByText('Cardiología')).toBeInTheDocument();
      });
    });
  });

  describe('Edit Mode', () => {
    const renderEditForm = () => {
      mockGetResidentByID.mockResolvedValue(mockResident);
      return render(<ResidentForm id="resident-1" areas={mockAreas} />);
    };

    it('should load and populate existing resident data', async () => {
      renderEditForm();

      await waitFor(() => {
        expect(mockGetResidentByID).toHaveBeenCalledWith('resident-1');
        expect(screen.getByDisplayValue(mockResident.user.email)).toBeInTheDocument();
      });
    });

    it('should show update button in edit mode', async () => {
      renderEditForm();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /actualizar residente/i })).toBeInTheDocument();
      });
    });

    it('should handle loading errors', async () => {
      mockGetResidentByID.mockRejectedValue(new Error('Not found'));
      renderEditForm();

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Error al cargar datos');
      });
    });
  });

  describe('Form Validation', () => {
    it('should show validation errors for invalid email', async () => {
      const user = userEvent.setup();
      render(<ResidentForm id="new" areas={mockAreas} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      });

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'invalid-email');

      const submitButton = screen.getByRole('button', { name: /crear residente/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/debe ser un email válido/i)).toBeInTheDocument();
      });
    });

    it('should show validation errors for empty required fields', async () => {
      const user = userEvent.setup();
      render(<ResidentForm id="new" areas={mockAreas} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /crear residente/i })).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: /crear residente/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/debe ser un email válido/i)).toBeInTheDocument();
      });
    });

    it('should accept valid email format', async () => {
      const user = userEvent.setup();
      render(<ResidentForm id="new" areas={mockAreas} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      });

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'valid@hospital.cl');

      // Should not show validation error
      expect(screen.queryByText(/debe ser un email válido/i)).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should create resident with valid data', async () => {
      const user = userEvent.setup();
      mockCreateResident.mockResolvedValue({ success: true });
      
      render(<ResidentForm id="new" areas={mockAreas} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      });

      // Fill form
      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'test@hospital.cl');

      const areaSelect = screen.getByLabelText(/área/i);
      await user.click(areaSelect);
      await user.click(screen.getByText('Cirugía General'));

      const submitButton = screen.getByRole('button', { name: /crear residente/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCreateResident).toHaveBeenCalledWith(expect.any(FormData));
        expect(mockToast.success).toHaveBeenCalledWith('Residente creado correctamente');
        expect(mockRouter.push).toHaveBeenCalledWith('/admin/resident');
      });
    });

    it('should update resident with valid data', async () => {
      const user = userEvent.setup();
      mockGetResidentByID.mockResolvedValue(mockResident);
      mockUpdateResident.mockResolvedValue({ success: true });
      
      render(<ResidentForm id="resident-1" areas={mockAreas} />);

      await waitFor(() => {
        expect(screen.getByDisplayValue(mockResident.user.email)).toBeInTheDocument();
      });

      // Modify email
      const emailInput = screen.getByDisplayValue(mockResident.user.email);
      await user.clear(emailInput);
      await user.type(emailInput, 'updated@hospital.cl');

      const submitButton = screen.getByRole('button', { name: /actualizar residente/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateResident).toHaveBeenCalledWith(expect.any(FormData));
        expect(mockToast.success).toHaveBeenCalledWith('Residente actualizado correctamente');
        expect(mockRouter.push).toHaveBeenCalledWith('/admin/resident');
      });
    });

    it('should handle submission errors', async () => {
      const user = userEvent.setup();
      mockCreateResident.mockRejectedValue(new Error('Server error'));
      
      render(<ResidentForm id="new" areas={mockAreas} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      });

      // Fill form with valid data
      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'test@hospital.cl');

      const areaSelect = screen.getByLabelText(/área/i);
      await user.click(areaSelect);
      await user.click(screen.getByText('Cirugía General'));

      const submitButton = screen.getByRole('button', { name: /crear residente/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Error creando/editando el residente');
      });
    });
  });

  describe('Form Reset', () => {
    it('should reset form when reset button is clicked', async () => {
      const user = userEvent.setup();
      render(<ResidentForm id="new" areas={mockAreas} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      });

      // Fill form
      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'test@hospital.cl');

      // Reset form
      const resetButton = screen.getByRole('button', { name: /limpiar/i });
      await user.click(resetButton);

      // Form should be cleared
      expect(emailInput).toHaveValue('');
    });
  });

  describe('Loading States', () => {
    it('should show loading skeleton while fetching data', () => {
      mockGetResidentByID.mockImplementation(() => new Promise(() => {})); // Never resolves
      render(<ResidentForm id="resident-1" areas={mockAreas} />);

      expect(screen.getByTestId('skeleton')).toBeInTheDocument();
    });

    it('should hide loading skeleton after data loads', async () => {
      mockGetResidentByID.mockResolvedValue(mockResident);
      render(<ResidentForm id="resident-1" areas={mockAreas} />);

      await waitFor(() => {
        expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels', async () => {
      render(<ResidentForm id="new" areas={mockAreas} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/área/i)).toBeInTheDocument();
      });
    });

    it('should have proper form structure', async () => {
      render(<ResidentForm id="new" areas={mockAreas} />);

      await waitFor(() => {
        const form = screen.getByRole('form');
        expect(form).toBeInTheDocument();
      });
    });

    it('should have proper button types', async () => {
      render(<ResidentForm id="new" areas={mockAreas} />);

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /crear residente/i });
        expect(submitButton).toHaveAttribute('type', 'submit');

        const resetButton = screen.getByRole('button', { name: /limpiar/i });
        expect(resetButton).toHaveAttribute('type', 'button');
      });
    });
  });
});
