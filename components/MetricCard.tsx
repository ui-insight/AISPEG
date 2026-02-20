interface MetricCardProps {
  value: string | number;
  label: string;
  sublabel?: string;
}

export default function MetricCard({ value, label, sublabel }: MetricCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-3xl font-bold text-ui-charcoal">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      <p className="mt-1 text-sm font-medium text-gray-600">{label}</p>
      {sublabel && <p className="mt-0.5 text-xs text-gray-400">{sublabel}</p>}
    </div>
  );
}
