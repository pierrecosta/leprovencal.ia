import { useState, useMemo, useCallback } from 'react';

/**
 * Generic hook for edit-in-place pattern
 * Manages view/form states, editing mode, validation, and image file handling
 */
export interface UseEditInPlaceOptions<T> {
  /** Initial data to display */
  initialData: T;
  /** Validation function that returns error message or null if valid */
  validate?: (data: T, imageFile: File | null) => string | null;
  /** Function called when save is successful */
  onSave?: (data: T) => Promise<T>;
  /** Function called after successful save (optional, for parent updates) */
  onSaveSuccess?: (savedData: T) => void;
}

export interface UseEditInPlaceReturn<T> {
  // State
  view: T;
  form: T;
  isEditing: boolean;
  loading: boolean;
  errorMsg: string | null;
  fieldErrors: Record<string, string>;
  imageFile: File | null;
  imageRev: number;
  hasChanges: boolean;

  // Actions
  startEdit: () => void;
  cancelEdit: () => void;
  handleChange: (field: keyof T, value: unknown) => void;
  handleSave: () => Promise<void>;
  setImageFile: (file: File | null) => void;
  setFieldErrors: (errors: Record<string, string>) => void;
  setErrorMsg: (msg: string | null) => void;
  incrementImageRev: () => void;
}

export function useEditInPlace<T extends Record<string, any>>({
  initialData,
  validate,
  onSave,
  onSaveSuccess,
}: UseEditInPlaceOptions<T>): UseEditInPlaceReturn<T> {
  const [view, setView] = useState<T>(initialData);
  const [form, setForm] = useState<T>(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageRev, setImageRev] = useState(0);

  const hasChanges = useMemo(() => {
    const formKeys = Object.keys(form) as (keyof T)[];
    return formKeys.some((key) => form[key] !== view[key]) || Boolean(imageFile);
  }, [form, view, imageFile]);

  const startEdit = useCallback(() => {
    setErrorMsg(null);
    setFieldErrors({});
    setForm({ ...view });
    setImageFile(null);
    setIsEditing(true);
  }, [view]);

  const cancelEdit = useCallback(() => {
    setErrorMsg(null);
    setFieldErrors({});
    setForm({ ...view });
    setImageFile(null);
    setIsEditing(false);
  }, [view]);

  const handleChange = useCallback((field: keyof T, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    setErrorMsg(null);
    setFieldErrors({});

    // Validation
    if (validate) {
      const validationError = validate(form, imageFile);
      if (validationError) {
        setErrorMsg(validationError);
        return;
      }
    }

    if (!hasChanges) {
      setIsEditing(false);
      return;
    }

    setLoading(true);
    try {
      if (onSave) {
        const savedData = await onSave(form);
        setView(savedData);
        setForm(savedData);
        setIsEditing(false);
        setImageFile(null);
        if (onSaveSuccess) onSaveSuccess(savedData);
      } else {
        // If no onSave provided, just update view with form data
        setView(form);
        setIsEditing(false);
        setImageFile(null);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Une erreur est survenue lors de la sauvegarde.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }, [form, imageFile, hasChanges, validate, onSave, onSaveSuccess]);

  const incrementImageRev = useCallback(() => {
    setImageRev((n) => n + 1);
  }, []);

  return {
    view,
    form,
    isEditing,
    loading,
    errorMsg,
    fieldErrors,
    imageFile,
    imageRev,
    hasChanges,
    startEdit,
    cancelEdit,
    handleChange,
    handleSave,
    setImageFile,
    setFieldErrors,
    setErrorMsg,
    incrementImageRev,
  };
}
