import { useTheme } from '../contexts/ThemeContext';
import { FiSun, FiMoon, FiMonitor } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-full shadow-inner border border-gray-200 dark:border-gray-700">
      <button
        onClick={() => setTheme('light')}
        className={`relative flex items-center justify-center p-2 rounded-full transition-colors ${
          theme === 'light' ? 'text-amber-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        }`}
        title="Light Mode"
      >
        {theme === 'light' && (
          <motion.div
            layoutId="theme-bubble"
            className="absolute inset-0 bg-white dark:bg-gray-700 shadow-sm rounded-full"
            initial={false}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        )}
        <span className="relative z-10"><FiSun size={18} /></span>
      </button>

      <button
        onClick={() => setTheme('dark')}
        className={`relative flex items-center justify-center p-2 rounded-full transition-colors ${
          theme === 'dark' ? 'text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        }`}
        title="Dark Mode"
      >
        {theme === 'dark' && (
          <motion.div
            layoutId="theme-bubble"
            className="absolute inset-0 bg-white dark:bg-gray-700 shadow-sm rounded-full"
            initial={false}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        )}
        <span className="relative z-10"><FiMoon size={18} /></span>
      </button>

      <button
        onClick={() => setTheme('system')}
        className={`relative flex items-center justify-center p-2 rounded-full transition-colors ${
          theme === 'system' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        }`}
        title="System Default"
      >
        {theme === 'system' && (
          <motion.div
            layoutId="theme-bubble"
            className="absolute inset-0 bg-white dark:bg-gray-700 shadow-sm rounded-full"
            initial={false}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        )}
        <span className="relative z-10"><FiMonitor size={18} /></span>
      </button>
    </div>
  );
}

export default ThemeToggle;
