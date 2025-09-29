
import React from 'react';

interface PanelProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

const Panel: React.FC<PanelProps> = ({ title, children, className = '', actions }) => {
  return (
    <div className={`bg-card-light dark:bg-card-dark rounded-xl shadow-lg p-4 flex flex-col ${className}`}>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-text-light dark:text-text-dark">{title}</h2>
            {actions && <div>{actions}</div>}
        </div>
        <div className="flex-grow">
            {children}
        </div>
    </div>
  );
};

export default Panel;
