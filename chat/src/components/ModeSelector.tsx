/**
 * Mode Selector Component
 * Allows users to switch between Query and Knowledge Capture modes
 */

import styles from './ModeSelector.module.css';

export type ChatMode = 'query' | 'knowledge_capture';

interface ModeSelectorProps {
    currentMode: ChatMode;
    onModeChange: (mode: ChatMode) => void;
}

export default function ModeSelector({ currentMode, onModeChange }: ModeSelectorProps) {
    return (
        <div className={styles.modeSelector}>
            <button
                className={`${styles.modeButton} ${currentMode === 'query' ? styles.active : ''}`}
                onClick={() => onModeChange('query')}
                aria-label="Ask Questions Mode"
            >
                <span className={styles.icon}>💬</span>
                <span className={styles.label}>Ask Questions</span>
            </button>

            <button
                className={`${styles.modeButton} ${currentMode === 'knowledge_capture' ? styles.active : ''}`}
                onClick={() => onModeChange('knowledge_capture')}
                aria-label="Add Knowledge Mode"
            >
                <span className={styles.icon}>📚</span>
                <span className={styles.label}>Add Knowledge</span>
            </button>
        </div>
    );
}
