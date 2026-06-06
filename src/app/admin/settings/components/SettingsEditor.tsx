"use client";

import { useState } from "react";
import { Save, Globe, Code } from "lucide-react";
import styles from "./SettingsEditor.module.css";

interface SettingsEditorProps {
  initialSiteName: string;
  initialSiteDescription: string;
  initialSiteLogo: string;
  initialSiteFavicon: string;
  initialSiteUrl: string;
  initialAnalyticCode: string;
  initialCustomCss: string;
  initialCustomHead: string;
  initialFooterText: string;
}

const CONFIG_MAP = {
  siteName: "site_name",
  siteDescription: "site_description",
  siteLogo: "site_logo",
  siteFavicon: "site_favicon",
  siteUrl: "site_url",
  analyticCode: "analytic_code",
  customCss: "custom_css",
  customHead: "custom_head",
  footerText: "footer_text",
} as const;

export function SettingsEditor({ ...props }: SettingsEditorProps) {
  const [values, setValues] = useState({
    siteName: props.initialSiteName,
    siteDescription: props.initialSiteDescription,
    siteLogo: props.initialSiteLogo,
    siteFavicon: props.initialSiteFavicon,
    siteUrl: props.initialSiteUrl,
    analyticCode: props.initialAnalyticCode,
    customCss: props.initialCustomCss,
    customHead: props.initialCustomHead,
    footerText: props.initialFooterText,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const results = await Promise.all(
        Object.entries(values).map(([key, value]) => {
          const configKey = CONFIG_MAP[key as keyof typeof CONFIG_MAP];
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
            <Globe size={18} />
            <h2 className={styles.cardTitle}>站点信息</h2>
          </div>
        </div>
        <div className={styles.grid}>
          <label className={styles.field}>
            <span>站点名称</span>
            <input
              type="text"
              value={values.siteName}
              onChange={(e) => setValues((v) => ({ ...v, siteName: e.target.value }))}
              placeholder="我的博客"
              className={styles.input}
            />
          </label>
          <label className={styles.field}>
            <span>站点地址</span>
            <input
              type="text"
              value={values.siteUrl}
              onChange={(e) => setValues((v) => ({ ...v, siteUrl: e.target.value }))}
              placeholder="https://example.com"
              className={styles.input}
            />
          </label>
          <label className={styles.field}>
            <span>站点 Logo URL</span>
            <input
              type="text"
              value={values.siteLogo}
              onChange={(e) => setValues((v) => ({ ...v, siteLogo: e.target.value }))}
              placeholder="https://example.com/logo.png"
              className={styles.input}
            />
          </label>
          <label className={styles.field}>
            <span>Favicon URL</span>
            <input
              type="text"
              value={values.siteFavicon}
              onChange={(e) => setValues((v) => ({ ...v, siteFavicon: e.target.value }))}
              placeholder="https://example.com/favicon.ico"
              className={styles.input}
            />
          </label>
          <label className={`${styles.field} ${styles.fullWidth}`}>
            <span>站点描述</span>
            <input
              type="text"
              value={values.siteDescription}
              onChange={(e) => setValues((v) => ({ ...v, siteDescription: e.target.value }))}
              placeholder="个人博客描述"
              className={styles.input}
            />
          </label>
          <label className={`${styles.field} ${styles.fullWidth}`}>
            <span>底部自定义文字</span>
            <input
              type="text"
              value={values.footerText}
              onChange={(e) => setValues((v) => ({ ...v, footerText: e.target.value }))}
              placeholder="© 2024 我的博客. All rights reserved."
              className={styles.input}
            />
          </label>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitleRow}>
            <Code size={18} />
            <h2 className={styles.cardTitle}>代码注入</h2>
          </div>
        </div>
        <div className={styles.fields}>
          <label className={`${styles.field} ${styles.fullWidth}`}>
            <span>自定义 Head 代码</span>
            <textarea
              value={values.customHead}
              onChange={(e) => setValues((v) => ({ ...v, customHead: e.target.value }))}
              placeholder='<script>...</script>'
              rows={3}
              className={styles.textarea}
            />
            <span className={styles.hint}>会插入到所有页面的 &lt;head&gt; 标签中</span>
          </label>
          <label className={`${styles.field} ${styles.fullWidth}`}>
            <span>统计代码</span>
            <textarea
              value={values.analyticCode}
              onChange={(e) => setValues((v) => ({ ...v, analyticCode: e.target.value }))}
              placeholder="Google Analytics / 百度统计等代码"
              rows={4}
              className={styles.textarea}
            />
          </label>
          <label className={`${styles.field} ${styles.fullWidth}`}>
            <span>自定义 CSS</span>
            <textarea
              value={values.customCss}
              onChange={(e) => setValues((v) => ({ ...v, customCss: e.target.value }))}
              placeholder=".my-custom-class { color: red; }"
              rows={6}
              className={styles.textarea}
            />
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
