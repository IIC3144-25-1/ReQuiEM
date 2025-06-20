import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { SurgeryForm } from '@/app/(protected)/admin/surgeries/surgeryForm';
import { createSurgery } from '@/actions/surgery/create';
import { updateSurgery } from '@/actions/surgery/update';

// Mock dependencies
jest.mock('next/navigation');
jest.mock('sonner');
jest.mock('@/actions/surgery/create');
jest.mock('@/actions/surgery/update');

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
};

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockToast = toast as jest.MockedFunction<typeof toast>;
const mockCreateSurgery = createSurgery as jest.MockedFunction<typeof createSurgery>;
const mockUpdateSurgery = updateSurgery as jest.MockedFunction<typeof updateSurgery>;

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

const mockSurgery = {
  _id: 'surgery-1',
  name: 'Apendicectomía Laparoscópica',
  description: 'Cirugía de apéndice por laparoscopia',
  area: 'area-1',
  steps: [
    'Preparación del campo quirúrgico',
    'Incisión y acceso laparoscópico',
    'Extracción del apéndice'
  ],
  osats: [
    {
      item: 'Técnica quirúrgica',
      scale: [
        { punctuation: 1, description: 'Deficiente' },
        { punctuation: 3, description: 'Competente' },
        { punctuation: 5, description: 'Excelente' }
      ]
    }
  ]
};

describe('SurgeryForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue(mockRouter);
    mockToast.success = jest.fn();
    mockToast.error = jest.fn();
  });

  describe('Create Mode', () => {
    const renderCreateForm = () => {
      return render(<SurgeryForm areas={mockAreas} />);
    };

    it('should render all form fields for creation', () => {
      renderCreateForm();

      expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/área/i)).toBeInTheDocument();
      expect(screen.getByText(/pasos de la cirugía/i)).toBeInTheDocument();
      expect(screen.getByText(/evaluaciones osat/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /crear cirugía/i })).toBeInTheDocument();
    });

    it('should have default empty step and OSAT fields', () => {
      renderCreateForm();

      // Should have one empty step field
      const stepInputs = screen.getAllByPlaceholderText(/nombre del paso/i);
      expect(stepInputs).toHaveLength(1);
      expect(stepInputs[0]).toHaveValue('');

      // Should have one empty OSAT field
      const osatInputs = screen.getAllByPlaceholderText(/nombre de la evaluación/i);
      expect(osatInputs).toHaveLength(1);
      expect(osatInputs[0]).toHaveValue('');
    });

    it('should allow adding and removing steps', async () => {
      const user = userEvent.setup();
      renderCreateForm();

      // Add a step
      const addStepButton = screen.getByRole('button', { name: /agregar paso/i });
      await user.click(addStepButton);

      const stepInputs = screen.getAllByPlaceholderText(/nombre del paso/i);
      expect(stepInputs).toHaveLength(2);

      // Remove a step
      const removeButtons = screen.getAllByRole('button', { name: /eliminar paso/i });
      await user.click(removeButtons[0]);

      const updatedStepInputs = screen.getAllByPlaceholderText(/nombre del paso/i);
      expect(updatedStepInputs).toHaveLength(1);
    });

    it('should allow adding and removing OSAT evaluations', async () => {
      const user = userEvent.setup();
      renderCreateForm();

      // Add an OSAT
      const addOsatButton = screen.getByRole('button', { name: /agregar evaluación osat/i });
      await user.click(addOsatButton);

      const osatInputs = screen.getAllByPlaceholderText(/nombre de la evaluación/i);
      expect(osatInputs).toHaveLength(2);

      // Remove an OSAT
      const removeButtons = screen.getAllByRole('button', { name: /eliminar evaluación/i });
      await user.click(removeButtons[0]);

      const updatedOsatInputs = screen.getAllByPlaceholderText(/nombre de la evaluación/i);
      expect(updatedOsatInputs).toHaveLength(1);
    });
  });

  describe('Edit Mode', () => {
    const renderEditForm = () => {
      return render(<SurgeryForm surgery={mockSurgery} areas={mockAreas} />);
    };

    it('should populate form with existing surgery data', () => {
      renderEditForm();

      expect(screen.getByDisplayValue(mockSurgery.name)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockSurgery.description)).toBeInTheDocument();
      
      // Check steps are populated
      mockSurgery.steps.forEach(step => {
        expect(screen.getByDisplayValue(step)).toBeInTheDocument();
      });

      // Check OSAT is populated
      expect(screen.getByDisplayValue(mockSurgery.osats[0].item)).toBeInTheDocument();
    });

    it('should show update button in edit mode', () => {
      renderEditForm();

      expect(screen.getByRole('button', { name: /actualizar cirugía/i })).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show validation errors for empty required fields', async () => {
      const user = userEvent.setup();
      render(<SurgeryForm areas={mockAreas} />);

      const submitButton = screen.getByRole('button', { name: /crear cirugía/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/el nombre de la cirugía es requerido/i)).toBeInTheDocument();
        expect(screen.getByText(/el área es requerida/i)).toBeInTheDocument();
      });
    });

    it('should validate minimum steps requirement', async () => {
      const user = userEvent.setup();
      render(<SurgeryForm areas={mockAreas} />);

      // Fill required fields but leave steps empty
      const nameInput = screen.getByLabelText(/nombre/i);
      await user.type(nameInput, 'Test Surgery');

      const areaSelect = screen.getByLabelText(/área/i);
      await user.click(areaSelect);
      await user.click(screen.getByText('Cirugía General'));

      // Clear the default step
      const stepInput = screen.getByPlaceholderText(/nombre del paso/i);
      await user.clear(stepInput);

      const submitButton = screen.getByRole('button', { name: /crear cirugía/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/por lo menos un paso es requerido/i)).toBeInTheDocument();
      });
    });

    it('should validate minimum OSAT requirement', async () => {
      const user = userEvent.setup();
      render(<SurgeryForm areas={mockAreas} />);

      // Fill required fields
      const nameInput = screen.getByLabelText(/nombre/i);
      await user.type(nameInput, 'Test Surgery');

      const areaSelect = screen.getByLabelText(/área/i);
      await user.click(areaSelect);
      await user.click(screen.getByText('Cirugía General'));

      const stepInput = screen.getByPlaceholderText(/nombre del paso/i);
      await user.type(stepInput, 'Test Step');

      // Clear the default OSAT
      const osatInput = screen.getByPlaceholderText(/nombre de la evaluación/i);
      await user.clear(osatInput);

      const submitButton = screen.getByRole('button', { name: /crear cirugía/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/por lo menos un paso osat es requerido/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should create surgery with valid data', async () => {
      const user = userEvent.setup();
      mockCreateSurgery.mockResolvedValue({ success: true });
      
      render(<SurgeryForm areas={mockAreas} />);

      // Fill form
      const nameInput = screen.getByLabelText(/nombre/i);
      await user.type(nameInput, 'Test Surgery');

      const descriptionInput = screen.getByLabelText(/descripción/i);
      await user.type(descriptionInput, 'Test description');

      const areaSelect = screen.getByLabelText(/área/i);
      await user.click(areaSelect);
      await user.click(screen.getByText('Cirugía General'));

      const stepInput = screen.getByPlaceholderText(/nombre del paso/i);
      await user.type(stepInput, 'Test Step');

      const osatInput = screen.getByPlaceholderText(/nombre de la evaluación/i);
      await user.type(osatInput, 'Test OSAT');

      const osatScaleInput = screen.getByPlaceholderText(/puntuación/i);
      await user.type(osatScaleInput, '5');

      const submitButton = screen.getByRole('button', { name: /crear cirugía/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCreateSurgery).toHaveBeenCalledWith(expect.any(FormData));
        expect(mockToast.success).toHaveBeenCalledWith('Cirugía creada correctamente');
        expect(mockRouter.push).toHaveBeenCalledWith('/admin/surgeries');
      });
    });

    it('should update surgery with valid data', async () => {
      const user = userEvent.setup();
      mockUpdateSurgery.mockResolvedValue({ success: true });
      
      render(<SurgeryForm surgery={mockSurgery} areas={mockAreas} />);

      // Modify name
      const nameInput = screen.getByDisplayValue(mockSurgery.name);
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Surgery Name');

      const submitButton = screen.getByRole('button', { name: /actualizar cirugía/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateSurgery).toHaveBeenCalledWith(expect.any(FormData));
        expect(mockToast.success).toHaveBeenCalledWith('Cirugía actualizada correctamente');
        expect(mockRouter.push).toHaveBeenCalledWith('/admin/surgeries');
      });
    });

    it('should handle submission errors', async () => {
      const user = userEvent.setup();
      mockCreateSurgery.mockRejectedValue(new Error('Server error'));
      
      render(<SurgeryForm areas={mockAreas} />);

      // Fill form with valid data
      const nameInput = screen.getByLabelText(/nombre/i);
      await user.type(nameInput, 'Test Surgery');

      const areaSelect = screen.getByLabelText(/área/i);
      await user.click(areaSelect);
      await user.click(screen.getByText('Cirugía General'));

      const stepInput = screen.getByPlaceholderText(/nombre del paso/i);
      await user.type(stepInput, 'Test Step');

      const osatInput = screen.getByPlaceholderText(/nombre de la evaluación/i);
      await user.type(osatInput, 'Test OSAT');

      const submitButton = screen.getByRole('button', { name: /crear cirugía/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Error creando/editando la cirugía');
      });
    });
  });

  describe('OSAT Scale Management', () => {
    it('should allow adding and removing OSAT scales', async () => {
      const user = userEvent.setup();
      render(<SurgeryForm areas={mockAreas} />);

      // Add scale to first OSAT
      const addScaleButton = screen.getByRole('button', { name: /agregar escala/i });
      await user.click(addScaleButton);

      const scaleInputs = screen.getAllByPlaceholderText(/puntuación/i);
      expect(scaleInputs).toHaveLength(2);

      // Remove scale
      const removeScaleButtons = screen.getAllByRole('button', { name: /eliminar escala/i });
      await user.click(removeScaleButtons[0]);

      const updatedScaleInputs = screen.getAllByPlaceholderText(/puntuación/i);
      expect(updatedScaleInputs).toHaveLength(1);
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      render(<SurgeryForm areas={mockAreas} />);

      expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/área/i)).toBeInTheDocument();
    });

    it('should have proper form structure', () => {
      render(<SurgeryForm areas={mockAreas} />);

      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();
    });
  });
});
