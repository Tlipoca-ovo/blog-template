"use client";

import { useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import styles from "./NavigationEditor.module.css";

interface NavItem {
  index: number;
  label: string;
  url: string;
}

interface NavigationEditorProps {
  initialItems: NavItem[];
}

export function NavigationEditor({ initialItems }: NavigationEditorProps) {
  const [items, setItems] = useState<NavItem[]>(initialItems);
  const [newLabel, setNewLabel] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleAdd = () => {
    if (!newLabel.trim() || !newUrl.trim()) return;
    const newIndex =
      items.length > 0 ? Math.max(...items.map((i) => i.index)) + 1 : 0;
    setItems((prev) => [
      ...prev,
      { index: newIndex, label: newLabel.trim(), url: newUrl.trim() },
    ]);
    setNewLabel("");
    setNewUrl("");
    setIsAdding(false);
  };

  const handleRemove = (index: number) => {
    if (!window.confirm("确定要删除此导航链接吗？")) return;
    setItems((prev) => prev.filter((i) => i.index !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const maxIndex =
        items.length > 0 ? Math.max(...items.map((i) => i.index)) : 0;
      const allKeys: string[] = [];
      for (let i = 0; i <= maxIndex + 2; i++) {
        allKeys.push(`nav_label_${i}`, `nav_url_${i}`);
      }
      const clearResults = await Promise.all(
        allKeys.map((key) =>
          fetch("/api/config", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ key, value: "" }),
          })
        )
      );
      const clearFailed = clearResults.filter((r) => !r.ok);
      if (clearFailed.length > 0) {
        setError("保存失败，请稍后重试");
        return;
      }
      const saveResults = await Promise.all(
        items.map((item, i) =>
          Promise.all([
            fetch("/api/config", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ key: `nav_label_${i}`, value: item.label }),
            }),
            fetch("/api/config", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ key: `nav_url_${i}`, value: item.url }),
            }),
          ])
        )
      );
      const flatResults = saveResults.flat();
      const failed = flatResults.filter((r) => !r.ok);
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
          <h2 className={styles.cardTitle}>导航菜单</h2>
          {!isAdding ? (
            <button
              onClick={() => setIsAdding(true)}
              className={styles.addButton}
            >
              <Plus size={18} />
              添加链接
            </button>
          ) : (
            <button
              onClick={() => setIsAdding(false)}
              className={styles.cancelButton}
            >
              取消
            </button>
          )}
        </div>

        {isAdding && (
          <div className={styles.addForm}>
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="链接文字"
              className={styles.input}
            />
            <input
              type="text"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="链接地址（如 /about）"
              className={styles.input}
            />
            <button onClick={handleAdd} className={styles.saveAddButton}>
              添加
            </button>
          </div>
        )}

        {items.length === 0 ? (
          <div className={styles.empty}>暂无导航链接</div>
        ) : (
          <div className={styles.navList}>
            {items.map((item) => (
              <div key={item.index} className={styles.navItem}>
                <span className={styles.navLabel}>{item.label}</span>
                <span className={styles.navUrl}>{item.url}</span>
                <button
                  onClick={() => handleRemove(item.index)}
                  className={`${styles.actionBtn} ${styles.danger}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.actions}>
        <button
          onClick={handleSave}
          disabled={saving}
          className={styles.saveButtonLarge}
        >
          <Save size={18} />
          {saving ? "保存中..." : saved ? "已保存" : "保存导航"}
        </button>
      </div>
    </div>
  );
}