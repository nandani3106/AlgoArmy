export default function PageHeader({
    title,
    subtitle,
    action,
  }) {
    return (
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0D1B4C]">
            {title}
          </h1>
  
          {subtitle && (
            <p className="text-slate-500 mt-2">
              {subtitle}
            </p>
          )}
        </div>
  
        {action && action}
      </div>
    );
  }