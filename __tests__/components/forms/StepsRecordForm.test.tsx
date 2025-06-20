import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { StepsRecordForm } from '@/app/(protected)/resident/stepsForm';
import { completeRecord } from '@/actions/record/complete';

// Mock dependencies
jest.mock('next/navigation');
jest.mock('sonner');
jest.mock('@/actions/record/complete');

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
};

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockToast = toast as jest.MockedFunction<typeof toast>;
const mockCompleteRecord = completeRecord as jest.MockedFunction<typeof completeRecord>;

// Mock record data
const mockRecord = {
  _id: 'record-1',
  resident: 'resident-1',
  teacher: 'teacher-1',
  patientId: '12.345.678-9',
  date: new Date('2024-01-15'),
  surgery: {
    _id: 'surgery-1',
    name: 'Apendicectomía Laparoscópica',
    description: 'Cirugía de apéndice',
    area: 'surgery-area-1',
    steps: [
      'Preparación del campo quirúrgico',
      'Incisión y acceso laparoscópico',
      'Identificación y disección del apéndice',
      'Extracción del apéndice',
      'Cierre y sutura'
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
  },
  residentsYear: 3,
  status: 'pending',
  residentJudgment: null,
  residentComment: null,
  steps: [],
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15')
};

describe('StepsRecordForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue(mockRouter);
    mockToast.success = jest.fn();
    mockToast.error = jest.fn();
  });

  const renderStepsForm = () => {
    return render(<StepsRecordForm record={mockRecord} />);
  };

  describe('Rendering', () => {
    it('should render all surgery steps as checkboxes', () => {
      renderStepsForm();

      mockRecord.surgery.steps.forEach(step => {
        expect(screen.getByText(step)).toBeInTheDocument();
        expect(screen.getByRole('checkbox', { name: step })).toBeInTheDocument();
      });
    });

    it('should render resident judgment slider', () => {
      renderStepsForm();

      const slider = screen.getByRole('slider');
      expect(slider).toBeInTheDocument();
      expect(slider).toHaveAttribute('min', '1');
      expect(slider).toHaveAttribute('max', '10');
    });

    it('should render comment textarea', () => {
      renderStepsForm();

      const textarea = screen.getByLabelText(/comentario/i);
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveAttribute('placeholder', expect.stringContaining('comentario'));
    });

    it('should render submit button', () => {
      renderStepsForm();

      const submitButton = screen.getByRole('button', { name: /completar registro/i });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute('type', 'submit');
    });
  });

  describe('Form Interaction', () => {
    it('should allow checking and unchecking steps', async () => {
      const user = userEvent.setup();
      renderStepsForm();

      const firstStepCheckbox = screen.getByRole('checkbox', { 
        name: mockRecord.surgery.steps[0] 
      });

      // Initially unchecked
      expect(firstStepCheckbox).not.toBeChecked();

      // Check the step
      await user.click(firstStepCheckbox);
      expect(firstStepCheckbox).toBeChecked();

      // Uncheck the step
      await user.click(firstStepCheckbox);
      expect(firstStepCheckbox).not.toBeChecked();
    });

    it('should allow adjusting resident judgment slider', async () => {
      const user = userEvent.setup();
      renderStepsForm();

      const slider = screen.getByRole('slider');
      
      // Default value should be 5
      expect(slider).toHaveValue('5');

      // Change slider value
      fireEvent.change(slider, { target: { value: '8' } });
      expect(slider).toHaveValue('8');
    });

    it('should allow typing in comment textarea', async () => {
      const user = userEvent.setup();
      renderStepsForm();

      const textarea = screen.getByLabelText(/comentario/i);
      const testComment = 'Procedimiento completado exitosamente';

      await user.type(textarea, testComment);
      expect(textarea).toHaveValue(testComment);
    });
  });

  describe('Form Validation', () => {
    it('should require at least one step to be completed', async () => {
      const user = userEvent.setup();
      renderStepsForm();

      // Try to submit without checking any steps
      const submitButton = screen.getByRole('button', { name: /completar registro/i });
      await user.click(submitButton);

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText(/al menos un paso debe estar completado/i)).toBeInTheDocument();
      });
    });

    it('should require comment when judgment is low', async () => {
      const user = userEvent.setup();
      renderStepsForm();

      // Check one step
      const firstStepCheckbox = screen.getByRole('checkbox', { 
        name: mockRecord.surgery.steps[0] 
      });
      await user.click(firstStepCheckbox);

      // Set low judgment score
      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '3' } });

      // Try to submit without comment
      const submitButton = screen.getByRole('button', { name: /completar registro/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/comentario es requerido/i)).toBeInTheDocument();
      });
    });

    it('should validate minimum comment length', async () => {
      const user = userEvent.setup();
      renderStepsForm();

      // Check one step
      const firstStepCheckbox = screen.getByRole('checkbox', { 
        name: mockRecord.surgery.steps[0] 
      });
      await user.click(firstStepCheckbox);

      // Add very short comment
      const textarea = screen.getByLabelText(/comentario/i);
      await user.type(textarea, 'abc');

      const submitButton = screen.getByRole('button', { name: /completar registro/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/mínimo.*caracteres/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      const user = userEvent.setup();
      mockCompleteRecord.mockResolvedValue({ success: true });
      
      renderStepsForm();

      // Check multiple steps
      const firstStepCheckbox = screen.getByRole('checkbox', { 
        name: mockRecord.surgery.steps[0] 
      });
      const secondStepCheckbox = screen.getByRole('checkbox', { 
        name: mockRecord.surgery.steps[1] 
      });
      
      await user.click(firstStepCheckbox);
      await user.click(secondStepCheckbox);

      // Set judgment
      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '8' } });

      // Add comment
      const textarea = screen.getByLabelText(/comentario/i);
      await user.type(textarea, 'Procedimiento completado exitosamente. Buena técnica aplicada.');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /completar registro/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCompleteRecord).toHaveBeenCalledWith(expect.any(FormData));
        expect(mockToast.success).toHaveBeenCalledWith('Registro completado correctamente');
        expect(mockRouter.push).toHaveBeenCalledWith('/resident/records');
      });
    });

    it('should handle submission errors', async () => {
      const user = userEvent.setup();
      mockCompleteRecord.mockRejectedValue(new Error('Server error'));
      
      renderStepsForm();

      // Fill form with valid data
      const firstStepCheckbox = screen.getByRole('checkbox', { 
        name: mockRecord.surgery.steps[0] 
      });
      await user.click(firstStepCheckbox);

      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '8' } });

      const textarea = screen.getByLabelText(/comentario/i);
      await user.type(textarea, 'Test comment');

      const submitButton = screen.getByRole('button', { name: /completar registro/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Error completando el registro');
      });
    });
  });

  describe('Default Values', () => {
    it('should set default judgment value to 5', () => {
      renderStepsForm();

      const slider = screen.getByRole('slider');
      expect(slider).toHaveValue('5');
    });

    it('should have all steps unchecked by default', () => {
      renderStepsForm();

      mockRecord.surgery.steps.forEach(step => {
        const checkbox = screen.getByRole('checkbox', { name: step });
        expect(checkbox).not.toBeChecked();
      });
    });

    it('should have empty comment by default', () => {
      renderStepsForm();

      const textarea = screen.getByLabelText(/comentario/i);
      expect(textarea).toHaveValue('');
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for all form elements', () => {
      renderStepsForm();

      // Check that all steps have proper labels
      mockRecord.surgery.steps.forEach(step => {
        expect(screen.getByLabelText(step)).toBeInTheDocument();
      });

      // Check slider has label
      expect(screen.getByLabelText(/autoevaluación/i)).toBeInTheDocument();

      // Check textarea has label
      expect(screen.getByLabelText(/comentario/i)).toBeInTheDocument();
    });

    it('should have proper form structure', () => {
      renderStepsForm();

      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();
    });

    it('should display current slider value', () => {
      renderStepsForm();

      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '7' } });

      // Should display the current value somewhere
      expect(screen.getByText('7')).toBeInTheDocument();
    });
  });
});
