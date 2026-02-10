export default function SectionHeading({ 
  title, 
  subtitle, 
  align = 'center',
  className = '' 
}) {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div className={`${alignClasses[align]} ${className}`}>
      {subtitle && (
        <p className="text-amber-900 font-semibold text-sm uppercase tracking-wider mb-2">
          {subtitle}
        </p>
      )}
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-gray-900">
        {title}
      </h2>
    </div>
  );
}

