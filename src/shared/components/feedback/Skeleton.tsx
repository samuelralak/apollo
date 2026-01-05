import {memo} from "react";

interface SkeletonProps {
    className?: string;
    /** Width variant or custom width class */
    width?: 'full' | '3/4' | '2/3' | '1/2' | '1/3' | '1/4' | string;
    /** Height in pixels or custom class */
    height?: number | string;
    /** Shape variant */
    variant?: 'text' | 'circular' | 'rounded' | 'pill';
}

/**
 * Base skeleton component for loading states.
 * Provides consistent styling for skeleton placeholders.
 */
const Skeleton = memo(({
    className = '',
    width = 'full',
    height = 16,
    variant = 'text'
}: SkeletonProps) => {
    const widthClass = width === 'full' ? 'w-full'
        : width === '3/4' ? 'w-3/4'
        : width === '2/3' ? 'w-2/3'
        : width === '1/2' ? 'w-1/2'
        : width === '1/3' ? 'w-1/3'
        : width === '1/4' ? 'w-1/4'
        : width;

    const heightStyle = typeof height === 'number' ? { height: `${height}px` } : undefined;
    const heightClass = typeof height === 'string' ? height : '';

    const variantClass = variant === 'circular' ? 'rounded-full'
        : variant === 'pill' ? 'rounded-full'
        : variant === 'rounded' ? 'rounded-lg'
        : 'rounded';

    const classes = [
        'bg-slate-200 dark:bg-slate-700 animate-pulse',
        widthClass,
        heightClass,
        variantClass,
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={classes} style={heightStyle} />
    );
});

Skeleton.displayName = 'Skeleton';

/** Container that applies animate-pulse to children */
export const SkeletonGroup = memo(({
    children,
    className = ''
}: {
    children: React.ReactNode;
    className?: string;
}) => (
    <div className={`animate-pulse ${className}`}>
        {children}
    </div>
));

SkeletonGroup.displayName = 'SkeletonGroup';

export default Skeleton;
