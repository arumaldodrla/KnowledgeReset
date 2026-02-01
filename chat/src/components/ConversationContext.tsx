/**
 * Conversation Context Display
 * Shows current topic, domain, and geographic scope during knowledge capture
 */

import type { ConversationContext } from '../lib/conversation-modes';
import styles from './ConversationContext.module.css';

interface ConversationContextProps {
    context: ConversationContext;
}

export default function ConversationContextDisplay({ context }: ConversationContextProps) {
    if (context.mode !== 'knowledge_capture' || !context.topic) {
        return null;
    }

    const confidencePercent = Math.round(context.confidence * 100);
    const confidenceColor =
        context.confidence >= 0.8 ? 'high' :
            context.confidence >= 0.5 ? 'medium' : 'low';

    return (
        <div className={styles.contextCard}>
            <div className={styles.header}>
                <span className={styles.icon}>🎯</span>
                <span className={styles.title}>Knowledge Capture in Progress</span>
            </div>

            <div className={styles.details}>
                <div className={styles.row}>
                    <span className={styles.label}>Topic:</span>
                    <span className={styles.value}>{context.topic}</span>
                </div>

                {context.domain && (
                    <div className={styles.row}>
                        <span className={styles.label}>Domain:</span>
                        <span className={`${styles.badge} ${styles[context.domain]}`}>
                            {context.domain}
                        </span>
                    </div>
                )}

                {context.geographic && (
                    <div className={styles.row}>
                        <span className={styles.label}>Scope:</span>
                        <span className={styles.value}>
                            {context.geographic.scope}
                            {context.geographic.country && ` (${context.geographic.country})`}
                            {context.geographic.state && `, ${context.geographic.state}`}
                        </span>
                    </div>
                )}

                {context.missingInfo.length > 0 && (
                    <div className={styles.row}>
                        <span className={styles.label}>Still need:</span>
                        <span className={styles.value}>{context.missingInfo.length} items</span>
                    </div>
                )}

                <div className={styles.row}>
                    <span className={styles.label}>Confidence:</span>
                    <div className={styles.confidenceBar}>
                        <div
                            className={`${styles.confidenceFill} ${styles[confidenceColor]}`}
                            style={{ width: `${confidencePercent}%` }}
                        />
                        <span className={styles.confidenceText}>{confidencePercent}%</span>
                    </div>
                </div>

                {context.readyToDraft && (
                    <div className={styles.readyBadge}>
                        ✓ Ready to draft knowledge
                    </div>
                )}
            </div>
        </div>
    );
}
