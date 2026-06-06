"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./AdminTable.module.css";

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  width?: string;
}

interface AdminTableProps<T extends { id: string | number }> {
  columns: Column<T>[];
  data: T[];
  actions?: (row: T) => React.ReactNode;
  emptyText?: string;
  loading?: boolean;
  selectable?: boolean;
  selectedIds?: (string | number)[];
  onSelectChange?: (ids: (string | number)[]) => void;
}

export function AdminTable<T extends { id: string | number }>({
  columns,
  data,
  actions,
  emptyText = "暂无数据",
  loading = false,
  selectable = false,
  selectedIds = [],
  onSelectChange,
}: AdminTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  const indeterminateRef = useRef<HTMLInputElement>(null);

  const totalPages = Math.ceil(data.length / pageSize);
  const paginatedData = data.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const allSelected = paginatedData.length > 0 && paginatedData.every((row) => selectedIds.includes(row.id));
  const someSelected = paginatedData.some((row) => selectedIds.includes(row.id));

  useEffect(() => {
    if (indeterminateRef.current) {
      indeterminateRef.current.indeterminate = someSelected && !allSelected;
    }
  }, [someSelected, allSelected]);

  const handleSelectAll = () => {
    if (!onSelectChange) return;
    if (allSelected) {
      onSelectChange(selectedIds.filter((id) => !paginatedData.find((r) => r.id === id)));
    } else {
      const newIds = [...new Set([...selectedIds, ...paginatedData.map((r) => r.id)])];
      onSelectChange(newIds);
    }
  };

  const handleSelectRow = (id: string | number) => {
    if (!onSelectChange) return;
    if (selectedIds.includes(id)) {
      onSelectChange(selectedIds.filter((i) => i !== id));
    } else {
      onSelectChange([...selectedIds, id]);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <span>加载中...</span>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              {selectable && (
                <th className={styles.checkboxCell}>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={indeterminateRef}
                    onChange={handleSelectAll}
                    className={styles.checkbox}
                  />
                </th>
              )}
              {columns.map((col) => (
                <th key={String(col.key)} className={styles.th} style={{ width: col.width }}>
                  {col.label}
                </th>
              ))}
              {actions && <th className={styles.th}>操作</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)} className={styles.emptyCell}>
                  {emptyText}
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => (
                <tr key={String(row.id)} className={styles.tr}>
                  {selectable && (
                    <td className={styles.checkboxCell}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(row.id)}
                        onChange={() => handleSelectRow(row.id)}
                        className={styles.checkbox}
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={String(col.key)} className={styles.td}>
                      {col.render
                        ? col.render(row)
                        : String((row as Record<string, unknown>)[col.key as string] ?? "")}
                    </td>
                  ))}
                  {actions && (
                    <td className={styles.td}>
                      <div className={styles.actions}>{actions(row)}</div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <span className={styles.pageInfo}>
            共 {data.length} 条，第 {currentPage}/{totalPages} 页
          </span>
          <div className={styles.pageButtons}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={styles.pageButton}
            >
              上一页
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={styles.pageButton}
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  );
}