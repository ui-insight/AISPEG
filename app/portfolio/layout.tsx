import ProjectsSubNav from "@/components/ProjectsSubNav";

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-10 border-b border-hairline">
        <ProjectsSubNav />
      </div>
      {children}
    </div>
  );
}
