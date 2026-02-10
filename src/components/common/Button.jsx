import Link from 'next/link';

export default function Button({ 
  children, 
  href, 
  variant = 'primary', 
  size = 'md',
  className = '',
  onClick,
  type = 'button',
  ...props 
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-amber-900 text-white hover:bg-amber-800 focus:ring-amber-900',
    secondary: 'bg-white text-amber-900 border-2 border-amber-900 hover:bg-amber-50 focus:ring-amber-900',
    outline: 'bg-transparent text-amber-900 border-2 border-amber-900 hover:bg-amber-900 hover:text-white focus:ring-amber-900',
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-md',
    md: 'px-6 py-3 text-base rounded-lg',
    lg: 'px-8 py-4 text-lg rounded-lg',
  };

  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes} {...props}>
      {children}
    </button>
  );
}

