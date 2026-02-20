import LessonCard from "@/components/LessonCard";
import { lessons } from "@/lib/data";

export default function LessonsPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-ui-charcoal">Lessons Learned</h1>
        <p className="mt-2 text-gray-600">
          Insights from repo-scale multi-agent collaboration and real-world
          agentic AI development.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {lessons.map((lesson) => (
          <LessonCard
            key={lesson.id}
            title={lesson.title}
            context={lesson.context}
            recommendations={lesson.recommendations}
            category={lesson.category}
          />
        ))}
      </div>

      <div className="rounded-xl border border-dashed border-gray-300 bg-white/50 p-8 text-center">
        <p className="text-sm text-gray-500">
          Team members can contribute new lessons by adding MDX files to{" "}
          <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">
            /content/lessons/
          </code>
        </p>
      </div>
    </div>
  );
}
