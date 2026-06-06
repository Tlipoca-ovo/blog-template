"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import styles from "./AdminModal.module.css";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export function AdminModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
}: AdminModalProps) {
  // ESC 键关闭
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={`${styles.modal} ${styles[size]}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* 头部 */}
        <div className={styles.header}>
          <h2 id="modal-title" className={styles.title}>
            {title}
          </h2>
          <button onClick={onClose} className={styles.closeButton} aria-label="关闭">
            <X size={20} />
          </button>
        </div>

        {/* 内容 */}
        <div className={styles.content}>{children}</div>

        {/* 底部 */}
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  );
}