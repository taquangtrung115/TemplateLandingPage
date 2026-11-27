import React, { useId } from "react";
import { UiverseInput } from "@oneportal/uiverse-ui";
export default function Field({ label, hint, ...props }) {
  const id = useId(),
    hintId = id + "-hint";
  return (
    <div className="field-label">
      <UiverseInput
        label={label}
        id={id}
        className="portal-field"
        aria-describedby={hint ? hintId : undefined}
        {...props}
      />
      {hint && (
        <span className="field-hint" id={hintId}>
          {hint}
        </span>
      )}
    </div>
  );
}
