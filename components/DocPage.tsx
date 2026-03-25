import Link from "next/link";

interface Breadcrumb {
  label: string;
  href?: string;
}

export function DocPage({
  title,
  subtitle,
  breadcrumbs,
  children,
}: {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-8">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 text-sm text-gray-500">
          {breadcrumbs.map((bc, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span className="text-gray-300">/</span>}
              {bc.href ? (
                <Link href={bc.href} className="hover:text-ui-charcoal transition-colors">
                  {bc.label}
                </Link>
              ) : (
                <span className="text-ui-charcoal font-medium">{bc.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-ui-charcoal">{title}</h1>
        {subtitle && <p className="mt-2 text-gray-600 max-w-3xl">{subtitle}</p>}
      </div>

      {/* Content */}
      <div className="prose prose-sm max-w-none prose-headings:text-ui-charcoal prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-base prose-h3:mt-6 prose-p:text-gray-600 prose-li:text-gray-600 prose-strong:text-ui-charcoal prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none prose-a:text-ui-gold-dark prose-a:no-underline hover:prose-a:underline">
        {children}
      </div>
    </div>
  );
}

export function DocCard({
  title,
  description,
  href,
  icon,
  badge,
}: {
  title: string;
  description: string;
  href: string;
  icon: string;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:border-ui-gold/50 hover:shadow-md transition-all"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-ui-charcoal group-hover:text-ui-gold-dark transition-colors">
              {title}
            </h3>
            {badge && (
              <span className="rounded-full bg-ui-gold/15 px-2 py-0.5 text-xs font-medium text-ui-gold-dark">
                {badge}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">{description}</p>
        </div>
        <svg className="h-4 w-4 text-gray-300 group-hover:text-ui-gold transition-colors mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}

export function InfoBox({
  type = "info",
  title,
  children,
}: {
  type?: "info" | "warning" | "tip" | "danger";
  title?: string;
  children: React.ReactNode;
}) {
  const styles = {
    info: "border-blue-200 bg-blue-50 text-blue-800",
    warning: "border-orange-200 bg-orange-50 text-orange-800",
    tip: "border-green-200 bg-green-50 text-green-800",
    danger: "border-red-200 bg-red-50 text-red-800",
  };
  const icons = {
    info: "ℹ️",
    warning: "⚠️",
    tip: "💡",
    danger: "🚨",
  };

  return (
    <div className={`not-prose rounded-xl border p-4 ${styles[type]}`}>
      <div className="flex items-start gap-2">
        <span className="text-sm">{icons[type]}</span>
        <div className="text-sm">
          {title && <p className="font-semibold mb-1">{title}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}
