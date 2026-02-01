/**
 * Knowledge Draft Preview Component
 * Shows extracted knowledge for user review and approval
 */

import type { KnowledgeDraft } from '../lib/conversation-modes';
import styles from './KnowledgeDraft.module.css';

interface KnowledgeDraftProps {
    draft: KnowledgeDraft;
    onApprove: () => void;
    onEdit: () => void;
    onReject: () => void;
    isLoading?: boolean;
}

export default function KnowledgeDraftPreview({
    draft,
    onApprove,
    onEdit,
    onReject,
    isLoading = false,
}: KnowledgeDraftProps) {
    const confidencePercent = Math.round(draft.metadata.confidence * 100);

    return (
        <div className={styles.draftContainer}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <span className={styles.icon}>📝</span>
                    <h3 className={styles.title}>Knowledge Draft Ready for Review</h3>
                </div>
                {draft.metadata.needsReview && (
                    <span className={styles.reviewBadge}>Needs Review</span>
                )}
            </div>

            <div className={styles.content}>
                <div className={styles.section}>
                    <h4 className={styles.draftTitle}>{draft.title}</h4>
                    <p className={styles.summary}>{draft.summary}</p>
                </div>

                <div className={styles.section}>
                    <h5 className={styles.sectionTitle}>Full Content</h5>
                    <div className={styles.markdownContent}>
                        <pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit' }}>{draft.content}</pre>
                    </div>
                </div>

                <div className={styles.metadata}>
                    <div className={styles.metaRow}>
                        <span className={styles.metaLabel}>Domain:</span>
                        <span className={`${styles.domainBadge} ${styles[draft.metadata.domain]}`}>
                            {draft.metadata.domain}
                        </span>
                    </div>

                    <div className={styles.metaRow}>
                        <span className={styles.metaLabel}>Geographic Scope:</span>
                        <span className={styles.metaValue}>
                            {draft.metadata.geographic.scope}
                            {draft.metadata.geographic.country && ` (${draft.metadata.geographic.country})`}
                            {draft.metadata.geographic.state && `, ${draft.metadata.geographic.state}`}
                        </span>
                    </div>

                    {draft.metadata.tags.length > 0 && (
                        <div className={styles.metaRow}>
                            <span className={styles.metaLabel}>Tags:</span>
                            <div className={styles.tags}>
                                {draft.metadata.tags.map((tag, i) => (
                                    <span key={i} className={styles.tag}>{tag}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {draft.metadata.sources.length > 0 && (
                        <div className={styles.metaRow}>
                            <span className={styles.metaLabel}>Sources:</span>
                            <div className={styles.sources}>
                                {draft.metadata.sources.map((source, i) => (
                                    <a
                                        key={i}
                                        href={source}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.sourceLink}
                                    >
                                        {new URL(source).hostname}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className={styles.metaRow}>
                        <span className={styles.metaLabel}>Confidence:</span>
                        <span className={styles.metaValue}>{confidencePercent}%</span>
                    </div>
                </div>
            </div>

            <div className={styles.actions}>
                <button
                    className={`${styles.button} ${styles.approve}`}
                    onClick={onApprove}
                    disabled={isLoading}
                >
                    <span className={styles.buttonIcon}>✓</span>
                    Approve & Save to Knowledge Base
                </button>

                <button
                    className={`${styles.button} ${styles.edit}`}
                    onClick={onEdit}
                    disabled={isLoading}
                >
                    <span className={styles.buttonIcon}>✎</span>
                    Edit Draft
                </button>

                <button
                    className={`${styles.button} ${styles.reject}`}
                    onClick={onReject}
                    disabled={isLoading}
                >
                    <span className={styles.buttonIcon}>✗</span>
                    Reject
                </button>
            </div>

            {isLoading && (
                <div className={styles.loadingOverlay}>
                    <div className={styles.spinner} />
                    <span>Saving to knowledge base...</span>
                </div>
            )}
        </div>
    );
}
