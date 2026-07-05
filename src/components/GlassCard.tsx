import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
  delay?: number;
  variant?: 'default' | 'blue' | 'teal';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  hoverable = false,
  onClick,
  delay = 0,
  variant = 'default'
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'blue': return 'glow-card-blue';
      case 'teal': return 'glow-card-teal';
      default: return '';
    }
  };

  const baseClasses = `glass-panel rounded-2xl p-6 shadow-sm overflow-hidden shimmer-line ${getVariantClass()}`;
  
  if (hoverable || onClick) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: delay, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ 
          y: -4, 
          boxShadow: '0 25px 35px -5px rgba(0, 0, 0, 0.05), 0 12px 15px -5px rgba(0, 0, 0, 0.02)',
          backgroundColor: 'rgba(255, 255, 255, 0.75)'
        }}
        whileTap={onClick ? { scale: 0.985 } : undefined}
        onClick={onClick}
        className={`${baseClasses} cursor-pointer transition-all duration-300 ${className}`}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay, ease: [0.16, 1, 0.3, 1] }}
      className={`${baseClasses} ${className}`}
    >
      {children}
    </motion.div>
  );
};
