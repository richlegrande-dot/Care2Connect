'use client';

import { useState, useEffect } from 'react';
import type { IntakeModule, FieldSchema } from '../types';

interface WizardModuleProps {
  module: IntakeModule;
  label: string;
  savedData?: Record<string, unknown>;
  isFirst: boolean;
  isLast: boolean;
  isSubmitting: boolean;
  onNext: (data: Record<string, unknown>) => void;
  onBack: () => void;
  onSkip?: () => void;
}

export function WizardModule({
  module,
  label,
  savedData,
  isFirst,
  isLast,
  isSubmitting,
  onNext,
  onBack,
  onSkip,
}: WizardModuleProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>(savedData || {});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when module changes
  useEffect(() => {
    setFormData(savedData || {});
    setErrors({});
  }, [module.id, savedData]);

  const handleChange = (fieldName: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    // Clear error for this field
    if (errors[fieldName]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const newErrors: Record<string, string> = {};
    if (module.schema.required) {
      for (const field of module.schema.required) {
        const val = formData[field];
        if (val === undefined || val === null || val === '' || val === false) {
          newErrors[field] = 'This field is required';
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onNext(formData);
  };

  const shouldShow = (fieldSchema: FieldSchema): boolean => {
    const showIf = fieldSchema['x-show-if'];
    if (!showIf) return true;

    return Object.entries(showIf).every(([key, expectedValue]) => {
      return formData[key] === expectedValue;
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg p-6 mt-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-1">{label}</h2>
      {!module.required && (
        <p className="text-sm text-gray-500 mb-4">This section is optional — you can skip it.</p>
      )}

      <div className="space-y-4 mt-4">
        {Object.entries(module.schema.properties).map(([fieldName, fieldSchema]) => {
          if (!shouldShow(fieldSchema as FieldSchema)) return null;

          return (
            <FieldRenderer
              key={fieldName}
              fieldName={fieldName}
              schema={fieldSchema as FieldSchema}
              value={formData[fieldName]}
              error={errors[fieldName]}
              onChange={(value) => handleChange(fieldName, value)}
              required={module.schema.required?.includes(fieldName) || false}
            />
          );
        })}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between mt-8 pt-4 border-t border-gray-200">
        <div>
          {!isFirst && (
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              ← Back
            </button>
          )}
        </div>
        <div className="flex gap-3">
          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 transition"
            >
              Skip
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 rounded-lg font-medium text-white transition ${
              isSubmitting
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? 'Submitting...' : isLast ? 'Complete Intake' : 'Next →'}
          </button>
        </div>
      </div>
    </form>
  );
}

// ── Field Renderer ─────────────────────────────────────────────

interface FieldRendererProps {
  fieldName: string;
  schema: FieldSchema;
  value: unknown;
  error?: string;
  onChange: (value: unknown) => void;
  required: boolean;
}

function FieldRenderer({ fieldName, schema, value, error, onChange, required }: FieldRendererProps) {
  const label = schema.title || fieldName.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const id = `field-${fieldName}`;

  // Boolean fields → checkbox
  if (schema.type === 'boolean') {
    return (
      <div className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
        />
        <label htmlFor={id} className="text-sm text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }

  // Enum fields → select dropdown
  if (schema.enum) {
    return (
      <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <select
          id={id}
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value || undefined)}
          className={`w-full rounded-lg border ${error ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
        >
          <option value="">Select...</option>
          {schema.enum.map((opt) => (
            <option key={opt} value={opt}>
              {opt.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </option>
          ))}
        </select>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }

  // Array of enums → multi-select checkboxes
  if (schema.type === 'array' && schema.items?.enum) {
    const selected = (value as string[]) || [];
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
          {schema.maxItems && <span className="text-gray-400 ml-2">(max {schema.maxItems})</span>}
        </label>
        <div className="grid grid-cols-2 gap-2">
          {schema.items.enum.map((opt) => (
            <label key={opt} className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={(e) => {
                  if (e.target.checked) {
                    if (schema.maxItems && selected.length >= schema.maxItems) return;
                    onChange([...selected, opt]);
                  } else {
                    onChange(selected.filter(s => s !== opt));
                  }
                }}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              {opt.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </label>
          ))}
        </div>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }

  // Integer fields → number input
  if (schema.type === 'integer' || schema.type === 'number') {
    return (
      <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          id={id}
          type="number"
          value={value !== undefined ? String(value) : ''}
          min={schema.minimum}
          max={schema.maximum}
          onChange={(e) => {
            const val = e.target.value;
            onChange(val === '' ? undefined : Number(val));
          }}
          className={`w-full rounded-lg border ${error ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }

  // Date fields
  if (schema.format === 'date') {
    return (
      <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          id={id}
          type="date"
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value || undefined)}
          className={`w-full rounded-lg border ${error ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }

  // Default: text input (or textarea for long fields)
  const isTextArea = (schema.maxLength ?? 0) > 500;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {isTextArea ? (
        <textarea
          id={id}
          value={(value as string) || ''}
          maxLength={schema.maxLength}
          rows={4}
          onChange={(e) => onChange(e.target.value || undefined)}
          className={`w-full rounded-lg border ${error ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
        />
      ) : (
        <input
          id={id}
          type={schema.format === 'email' ? 'email' : 'text'}
          value={(value as string) || ''}
          maxLength={schema.maxLength}
          onChange={(e) => onChange(e.target.value || undefined)}
          className={`w-full rounded-lg border ${error ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
        />
      )}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
