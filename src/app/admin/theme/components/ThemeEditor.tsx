"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import styles from "./ThemeEditor.module.css";

interface ThemeEditorProps {
  initialPrimaryColor: string;
  initialBackgroundColor: string;
  initialTextColor: string;
  initialCardColor: string;
  initialBorderColor: string;
  initialFontFamily: string;
  initialFontSize: string;
  initialBorderRadius: string;
  initialMaxWidth: string;
}

export function ThemeEditor(props: ThemeEditorProps) {
  const [values, setValues] = useState({
    primaryColor: props.initialPrimaryColor,
    backgroundColor: props.initialBackgroundColor,
    textColor: props.initialTextColor,
    cardColor: props.initialCardColor,
    borderColor: props.initialBorderColor,
    fontFamily: props.initialFontFamily,
    fontSize: props.initialFontSize,
    borderRadius: props.initialBorderRadius,
    maxWidth: props.initialMaxWidth,
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
        Object.entries(values).map(([key, value]) =>
          fetch("/api/config", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ key, value }),
          })
        )
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
          <h2 className={styles.cardTitle}>颜色配置</h2>
        </div>
        <div className={styles.grid}>
          <label className={styles.field}>
            <span>主色调</span>
            <input
              type="color"
              value={values.primaryColor}
              onChange={(e) => setValues((v) => ({ ...v, primaryColor: e.target.value }))}
              className={styles.colorInput}
            />
            <input
              type="text"
              value={values.primaryColor}
              onChange={(e) => setValues((v) => ({ ...v, primaryColor: e.target.value }))}
              className={styles.textInput}
            />
          </label>
          <label className={styles.field}>
            <span>背景色</span>
            <input
              type="color"
              value={values.backgroundColor}
              onChange={(e) => setValues((v) => ({ ...v, backgroundColor: e.target.value }))}
              className={styles.colorInput}
            />
            <input
              type="text"
              value={values.backgroundColor}
              onChange={(e) => setValues((v) => ({ ...v, backgroundColor: e.target.value }))}
              className={styles.textInput}
            />
          </label>
          <label className={styles.field}>
            <span>文字色</span>
            <input
              type="color"
              value={values.textColor}
              onChange={(e) => setValues((v) => ({ ...v, textColor: e.target.value }))}
              className={styles.colorInput}
            />
            <input
              type="text"
              value={values.textColor}
              onChange={(e) => setValues((v) => ({ ...v, textColor: e.target.value }))}
              className={styles.textInput}
            />
          </label>
          <label className={styles.field}>
            <span>卡片色</span>
            <input
              type="color"
              value={values.cardColor}
              onChange={(e) => setValues((v) => ({ ...v, cardColor: e.target.value }))}
              className={styles.colorInput}
            />
            <input
              type="text"
              value={values.cardColor}
              onChange={(e) => setValues((v) => ({ ...v, cardColor: e.target.value }))}
              className={styles.textInput}
            />
          </label>
          <label className={styles.field}>
            <span>边框色</span>
            <input
              type="color"
              value={values.borderColor}
              onChange={(e) => setValues((v) => ({ ...v, borderColor: e.target.value }))}
              className={styles.colorInput}
            />
            <input
              type="text"
              value={values.borderColor}
              onChange={(e) => setValues((v) => ({ ...v, borderColor: e.target.value }))}
              className={styles.textInput}
            />
          </label>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>排版配置</h2>
        </div>
        <div className={styles.grid}>
          <label className={styles.field}>
            <span>字体</span>
            <select
              value={values.fontFamily}
              onChange={(e) => setValues((v) => ({ ...v, fontFamily: e.target.value }))}
              className={styles.select}
            >
              <option value="system-ui">系统字体</option>
              <option value="serif">衬线字体</option>
              <option value="monospace">等宽字体</option>
            </select>
          </label>
          <label className={styles.field}>
            <span>字号</span>
            <select
              value={values.fontSize}
              onChange={(e) => setValues((v) => ({ ...v, fontSize: e.target.value }))}
              className={styles.select}
            >
              <option value="14">14px</option>
              <option value="16">16px</option>
              <option value="18">18px</option>
            </select>
          </label>
          <label className={styles.field}>
            <span>圆角</span>
            <select
              value={values.borderRadius}
              onChange={(e) => setValues((v) => ({ ...v, borderRadius: e.target.value }))}
              className={styles.select}
            >
              <option value="0">无</option>
              <option value="4">4px</option>
              <option value="8">8px</option>
              <option value="12">12px</option>
            </select>
          </label>
          <label className={styles.field}>
            <span>最大宽度</span>
            <select
              value={values.maxWidth}
              onChange={(e) => setValues((v) => ({ ...v, maxWidth: e.target.value }))}
              className={styles.select}
            >
              <option value="768">768px</option>
              <option value="1024">1024px</option>
              <option value="1280">1280px</option>
              <option value="1536">1536px</option>
            </select>
          </label>
        </div>
      </div>

        {error && <div className={styles.error}>{error}</div>}

      <div className={styles.actions}>
        <button onClick={handleSave} disabled={saving} className={styles.saveButton}>
          <Save size={18} />
          {saving ? "保存中..." : saved ? "已保存" : "保存主题"}
        </button>
      </div>
    </div>
  );
}