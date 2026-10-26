import { Link } from 'react-router-dom';
import type { ComponentProps, ReactNode } from 'react';
import { cn, externalLinkProps, isExternal } from '@/lib/utils';

type Variant = 'primary' | 'ghost' | 'outline' | 'quiet';
type Size = 'sm' | 'md' | 'lg';

const variants: Record<Variant, string> = {
  // The one filled button on the page. Light-on-dark, so it wins attention
  // without needing an accent colour.
  primary:
    'bg-ink text-surface font-medium hover:bg-white shadow-[0_8px_30px_-12px_rgba(94,231,255,0.45)]',
  outline:
    'border border-line text-ink hover:border-accent/45 hover:text-ink hover:bg-accent/[0.06]',
  ghost: 'text-ink-2 hover:text-ink hover:bg-ink/[0.05]',
  quiet: 'text-ink-2 hover:text-accent-ink',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-[0.8125rem] gap-1.5 rounded-lg',
  md: 'h-11 px-5 text-sm gap-2 rounded-xl',
  lg: 'h-13 px-6 text-[0.9375rem] gap-2.5 rounded-xl',
};

const shared =
  'inline-flex items-center justify-center whitespace-nowrap transition-[background-color,color,border-color,box-shadow,transform] duration-200 ease-out-expo active:translate-y-px disabled:pointer-events-none disabled:opacity-50';

function classesFor(variant: Variant, size: Size, className?: string) {
  return cn(shared, variants[variant], sizes[size], className);
}

type CommonProps = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
};

/**
 * `to` renders a router `<Link>` for internal paths and a hardened `<a>` for
 * external ones — so no call site has to remember `rel="noopener noreferrer"`.
 */
export function ButtonLink({
  to,
  children,
  variant = 'outline',
  size = 'md',
  className,
  ...rest
}: CommonProps & { to: string } & Omit<
    ComponentProps<'a'>,
    'href' | 'className' | 'children'
  >) {
  const classes = classesFor(variant, size, className);

  if (isExternal(to)) {
    const external = to.startsWith('http') ? externalLinkProps : {};
    return (
      <a href={to} className={classes} {...external} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <Link to={to} className={classes}>
      {children}
    </Link>
  );
}

export function Button({
  children,
  variant = 'outline',
  size = 'md',
  className,
  ...rest
}: CommonProps & Omit<ComponentProps<'button'>, 'className' | 'children'>) {
  return (
    <button type="button" className={classesFor(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}
