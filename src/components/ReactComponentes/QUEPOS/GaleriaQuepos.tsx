import * as React from 'react';
import {
  motion,
  type Variants,
  useInView,
  useMotionValue,
  useTransform,
  useSpring,
} from 'framer-motion';
import { cn } from '@/lib/utils';

export interface GaleriaItem {
  id: number;
  src: string;
  alt: string;
}

interface MasonryGridProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  gap?: string;
  staggerDelay?: number;
}

const GridItem = ({ children }: { children: React.ReactNode }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });
  const rotateX = useTransform(
    mouseYSpring,
    [-0.5, 0.5],
    ['10deg', '-10deg']
  );
  const rotateY = useTransform(
    mouseXSpring,
    [-0.5, 0.5],
    ['-10deg', '10deg']
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const mouseX = e.clientX - left;
    const mouseY = e.clientY - top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
      className="relative"
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        whileTap={{ scale: 0.95 }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

const MasonryGrid = <T,>({
  items,
  renderItem,
  className,
  gap = '1rem',
  staggerDelay = 0.05,
}: MasonryGridProps<T>) => {
  const containerRef = React.useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.2 });

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  return (
    <motion.div
      ref={containerRef}
      className={cn('columns-1 sm:columns-2 lg:columns-3 xl:columns-4', className)}
      style={{ columnGap: gap }}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={containerVariants}
      role="list"
    >
      {items.map((item, index) => (
        <motion.div
          key={index}
          className="mb-4 break-inside-avoid"
          variants={itemVariants}
          role="listitem"
        >
          <GridItem>{renderItem(item, index)}</GridItem>
        </motion.div>
      ))}
    </motion.div>
  );
};

const GaleriaQuepos = ({ items, className }: { items: GaleriaItem[]; className?: string }) => (
  <MasonryGrid
    items={items}
    className={className}
    gap="1rem"
    renderItem={(item, index) => (
      <div className="overflow-hidden rounded-lg bg-card shadow-md transition-shadow duration-300 ease-in-out hover:shadow-xl">
        <img
          src={item.src}
          alt={item.alt}
          className="h-auto w-full object-cover"
          loading={index < 3 ? 'eager' : 'lazy'}
        />
      </div>
    )}
  />
);

export default GaleriaQuepos;