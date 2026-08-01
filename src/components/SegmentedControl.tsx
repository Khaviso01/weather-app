interface Option<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
}

export default function SegmentedControl<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <div className="segmented-control">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`segmented-option ${value === opt.value ? "active" : ""}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
