import { useTheme } from "../../context/ThemeContext";

export default function PageHeader({ title, subtitle, action }) {
  const { isDark } = useTheme();

  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-[#0D1B4C]'}`}>
          {title}
        </h1>

        {subtitle && (
          <p className={`mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {subtitle}
          </p>
        )}
      </div>

      {action && action}
    </div>
  );
}