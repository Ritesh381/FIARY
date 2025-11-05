export const GlassCard = ({ children, className = "" }) => (
  <div
    className={`bg-gray-800/50 border border-gray-700/90 rounded-2xl shadow-lg ${className}`}
  >
    {children}
  </div>
);
