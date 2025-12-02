// Utility function to apply consistent colors
export const getThemeClasses = (type: 'card' | 'button' | 'badge' | 'text', variant: string = 'default') => {
  const classes = {
    card: {
      default: 'bg-gray-900/80 border border-emerald-800/30 rounded-xl shadow-xl',
      success: 'bg-emerald-900/20 border border-emerald-700/50 rounded-xl',
      warning: 'bg-yellow-900/20 border border-yellow-700/50 rounded-xl',
      danger: 'bg-red-900/20 border border-red-700/50 rounded-xl',
    },
    button: {
      primary: 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg',
      secondary: 'bg-gray-800/50 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-700/50',
      outline: 'border border-emerald-700/50 text-emerald-400 hover:bg-emerald-900/30 hover:text-emerald-300',
      success: 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white',
      warning: 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white',
      danger: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white',
    },
    badge: {
      default: 'bg-emerald-900/30 text-emerald-400 border border-emerald-800/50',
      success: 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/50',
      warning: 'bg-yellow-900/40 text-yellow-300 border border-yellow-700/50',
      danger: 'bg-red-900/40 text-red-300 border border-red-700/50',
      info: 'bg-cyan-900/40 text-cyan-300 border border-cyan-700/50',
    },
    text: {
      primary: 'text-white',
      secondary: 'text-gray-300',
      muted: 'text-gray-400',
      accent: 'text-emerald-400',
      success: 'text-emerald-400',
      warning: 'text-yellow-400',
      danger: 'text-red-400',
    }
  };
  
  const typeClasses = classes[type] as Record<string, string>;
  return typeClasses[variant] || typeClasses['default'] || Object.values(typeClasses)[0];
};
