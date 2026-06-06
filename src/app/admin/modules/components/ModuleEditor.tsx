"use client";

import { useState } from "react";
import { Save, Eye, EyeOff } from "lucide-react";
import styles from "./ModuleEditor.module.css";

interface Module {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

interface ModuleEditorProps {
  initialModules: Module[];
}

export function ModuleEditor({ initialModules }: ModuleEditorProps) {
  const [modules, setModules] = useState(initialModules);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleModule = (id: string) => {
    setModules((prev) =>
      prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await Promise.all(
        modules.map((m) =>
          fetch("/api/config", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              key: `module_${m.id}`,
              value: m.enabled ? "true" : "false",
            }),
          })
        )
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>首页模块</h2>
          <span className={styles.hint}>启用/禁用各模块在首页的显示</span>
        </div>
        <div className={styles.moduleList}>
          {modules.map((module) => (
            <div key={module.id} className={styles.moduleItem}>
              <div className={styles.moduleInfo}>
                <span className={styles.moduleName}>{module.name}</span>
                <span className={styles.moduleDesc}>{module.description}</span>
              </div>
              <button
                onClick={() => toggleModule(module.id)}
                className={`${styles.toggle} ${module.enabled ? styles.enabled : ""}`}
                title={module.enabled ? "点击禁用" : "点击启用"}
              >
                {module.enabled ? <Eye size={16} /> : <EyeOff size={16} />}
                <span>{module.enabled ? "已启用" : "已禁用"}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.actions}>
        <button onClick={handleSave} disabled={saving} className={styles.saveButton}>
          <Save size={18} />
          {saving ? "保存中..." : saved ? "已保存" : "保存设置"}
        </button>
      </div>
    </div>
  );
}