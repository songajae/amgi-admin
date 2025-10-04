// ==============================
// File: src/components/modals/FormModal.jsx
// Role: 동적으로 필드를 구성하는 입력용 모달 폼 컴포넌트
// ==============================

import { useMemo, useState } from "react";
import PropTypes from "prop-types";

import ModalShell from "./ModalShell";
import { STRINGS } from "../../constants/strings";

export default function FormModal({
  title,
  description,
  submitLabel,
  fields,
  initialValues = {},
  onSubmit,
  onCancel,
}) {
  const defaultValues = useMemo(() => {
    const entries = fields.map((field) => [field.name, initialValues[field.name] ?? ""]);
    return Object.fromEntries(entries);
  }, [fields, initialValues]);

  const [values, setValues] = useState(defaultValues);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);
      const result = await onSubmit?.(values);
      if (result !== false) {
        onCancel?.();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalShell
      title={title}
      description={description}
      onClose={onCancel}
      footer={
        <>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-300"
          >
            {STRINGS.common.buttons.cancel}
          </button>
          <button
            type="submit"
            form="entity-form-modal"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            disabled={submitting}
          >
            {submitting ? "..." : submitLabel}
          </button>
        </>
      }
    >
      <form id="entity-form-modal" className="space-y-4" onSubmit={handleSubmit}>
                {fields.map((field) => {
          const isTextarea = field.type === "textarea";
          const InputComponent = isTextarea ? "textarea" : "input";
          const commonProps = {
            value: values[field.name] ?? "",
            onChange: (event) => handleChange(field.name, event.target.value),
            placeholder: field.placeholder,
            required: field.required,
            disabled: field.disabled,
            readOnly: field.readOnly,
            className:
              "w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
          };

          const inputProps = isTextarea
            ? { ...commonProps, rows: field.rows || 3 }
            : { ...commonProps, type: field.type || "text" };

          return (
            <label key={field.name} className="block text-sm">
              <span className="mb-1 block font-semibold text-slate-700">
                {field.label}
                {field.required && <span className="text-red-500"> *</span>}
              </span>
              <InputComponent {...inputProps} />
            </label>
          );
        })}
      </form>
    </ModalShell>
  );
}

FormModal.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  submitLabel: PropTypes.string.isRequired,
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      placeholder: PropTypes.string,
      required: PropTypes.bool,
      type: PropTypes.string,
      disabled: PropTypes.bool,
      readOnly: PropTypes.bool,
      rows: PropTypes.number,
    })
  ).isRequired,
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
};