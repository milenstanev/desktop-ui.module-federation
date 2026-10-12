import React, { useId } from 'react';
import { useTheme } from '~/core/contexts/ThemeContext';
import { LOADER_STRINGS } from '~/shared/constants';
import styles from './Loader.module.css';

const Loader: React.FC = () => {
  const { theme } = useTheme();
  const isFancy = theme === 'gradient';
  const gradientId = useId();

  return (
    <div className={styles.loaderContainer} role="status" aria-live="polite">
      <span className={styles.srOnly}>{LOADER_STRINGS.LOADING_TEXT}</span>
      <svg
        className={isFancy ? styles.loaderFancy : styles.loader}
        width="48"
        height="48"
        viewBox="0 0 48 48"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {isFancy ? (
          <>
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="31.4 31.4"
            />
            <defs>
              <linearGradient
                id={gradientId}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#fb923c" />
              </linearGradient>
            </defs>
          </>
        ) : (
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="31.4 31.4"
          />
        )}
      </svg>
    </div>
  );
};

export default Loader;
