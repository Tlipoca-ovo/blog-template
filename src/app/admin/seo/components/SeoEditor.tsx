"use client";

import { useState } from "react";
import { Save, Share2, Search } from "lucide-react";
import styles from "./SeoEditor.module.css";

interface SeoEditorProps {
  initialTitle: string;
  initialDescription: string;
  initialKeywords: string;
  initialOgImage: string;
  initialTwitterCard: string;
  initialCanonical: string;
  initialRobots: string;
}

export function SeoEditor({ ...props }: SeoEditorProps) {
  const [values, setValues] = useState({
    title: props.initialTitle,
    description: props.initialDescription,
    keywords: props.initialKeywords,
    ogImage: props.initialOgImage,
    twitterCard: props.initialTwitterCard,
    canonical: props.initialCanonical,
    robots: props.initialRobots,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (values.description.length > 160) {
      setError("描述建议控制在 160 字以内");
      return;
    }
    setError("");
    setSaving(true);
    setSaved(false);
    try {
      const results = await Promise.all(
        Object.entries(values).map(([key, value]) => {
          const configKey = `seo_${key.replace(/([A-Z])/g, (_, c) => `_${c.toLowerCase()}`)}`;
          return fetch("/api/config", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ key: configKey, value }),
          });
        })
      );
      const failed = results.filter((r) => !r.ok);
      if (failed.length > 0) {
        setError("保存失败，请稍后重试");
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      setError("网络错误，请检查网络连接");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitleRow}>
            <Search size={18} />
            <h2 className={styles.cardTitle}>搜索引擎优化</h2>
          </div>
        </div>
        <div className={styles.fields}>
          <label className={styles.field}>
            <span>SEO 标题</span>
            <input
              type="text"
              value={values.title}
              onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
              placeholder="网页标题"
              className={styles.input}
            />
            <span className={styles.hint}>建议 60 字以内</span>
          </label>
          <label className={styles.field}>
            <span>Meta 描述</span>
            <textarea
              value={values.description}
              onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
              placeholder="网页描述"
              rows={3}
              className={styles.textarea}
            />
            <span className={styles.hint}>建议 160 字以内，当前 {values.description.length} 字</span>
          </label>
          <label className={styles.field}>
            <span>关键词</span>
            <input
              type="text"
              value={values.keywords}
              onChange={(e) => setValues((v) => ({ ...v, keywords: e.target.value }))}
              placeholder="关键词1, 关键词2, 关键词3"
              className={styles.input}
            />
            <span className={styles.hint}>用英文逗号分隔</span>
          </label>
          <label className={styles.field}>
            <span>robots 协议</span>
            <select
              value={values.robots}
              onChange={(e) => setValues((v) => ({ ...v, robots: e.target.value }))}
              className={styles.select}
            >
              <option value="index,follow">允许索引，允许跟踪</option>
              <option value="index,nofollow">允许索引，禁止跟踪</option>
              <option value="noindex,follow">禁止索引，允许跟踪</option>
              <option value="noindex,nofollow">禁止索引，禁止跟踪</option>
            </select>
          </label>
          <label className={styles.field}>
            <span>规范链接</span>
            <input
              type="text"
              value={values.canonical}
              onChange={(e) => setValues((v) => ({ ...v, canonical: e.target.value }))}
              placeholder="https://example.com"
              className={styles.input}
            />
            <span className={styles.hint}>留空则自动生成</span>
          </label>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitleRow}>
            <Share2 size={18} />
            <h2 className={styles.cardTitle}>社交分享</h2>
          </div>
        </div>
        <div className={styles.fields}>
          <label className={styles.field}>
            <span>分享图片 (OG Image)</span>
            <input
              type="text"
              value={values.ogImage}
              onChange={(e) => setValues((v) => ({ ...v, ogImage: e.target.value }))}
              placeholder="https://example.com/og-image.jpg"
              className={styles.input}
            />
            <span className={styles.hint}>建议尺寸 1200×630 像素</span>
          </label>
          <label className={styles.field}>
            <span>Twitter Card 类型</span>
            <select
              value={values.twitterCard}
              onChange={(e) => setValues((v) => ({ ...v, twitterCard: e.target.value }))}
              className={styles.select}
            >
              <option value="summary">Summary</option>
              <option value="summary_large_image">Summary Large Image</option>
              <option value="player">Player</option>
              <option value="app">App</option>
            </select>
          </label>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.actions}>
        <button onClick={handleSave} disabled={saving} className={styles.saveButton}>
          <Save size={18} />
          {saving ? "保存中..." : saved ? "已保存" : "保存设置"}
        </button>
      </div>
    </div>
  );
}
