interface LessonCardProps {
  title: string;
  context: string;
  recommendations: string[];
  category: string;
}

export default function LessonCard({
  title,
  context,
  recommendations,
  category,
}: LessonCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <span className="inline-block rounded-full bg-ui-mid/10 px-2.5 py-0.5 text-xs font-medium text-ui-mid">
        {category}
      </span>
      <h3 className="mt-3 text-lg font-semibold text-ui-charcoal">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{context}</p>
      <ul className="mt-4 space-y-2">
        {recommendations.map((rec, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
            <svg
              className="mt-0.5 h-4 w-4 shrink-0 text-brand-black"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            {rec}
          </li>
        ))}
      </ul>
    </div>
  );
}
