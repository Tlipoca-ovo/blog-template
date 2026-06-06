"use client";

import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <span className={styles.code}>404</span>
        <h1 className={styles.title}>页面未找到</h1>
        <p className={styles.description}>
          抱歉，您访问的页面不存在或已被移除
        </p>
        <div className={styles.actions}>
          <Link href="/" className={styles.primaryButton}>
            <Home size={18} />
            返回首页
          </Link>
          <button onClick={() => history.back()} className={styles.secondaryButton}>
            <ArrowLeft size={18} />
            返回上页
          </button>
        </div>
      </div>
    </div>
  );
}