/**
 * 格式化日期
 */
export function formatDate(date: Date | string, format: "full" | "date" | "time" = "date"): string {
  const d = typeof date === "string" ? new Date(date) : date;

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  switch (format) {
    case "full":
      return `${year}年${month}月${day}日 ${hours}:${minutes}`;
    case "time":
      return `${hours}:${minutes}`;
    case "date":
    default:
      return `${year}-${month}-${day}`;
  }
}

/**
 * 计算阅读时间（按每分钟 200 字计算）
 */
export function calculateReadingTime(content: string): number {
  const text = content.replace(/<[^>]*>/g, "").replace(/\s/g, "");
  const words = text.length;
  const minutes = Math.ceil(words / 200);
  return Math.max(1, minutes);
}

/**
 * 截取摘要
 */
export function truncateExcerpt(content: string, maxLength: number = 160): string {
  // 移除 HTML 标签
  const text = content.replace(/<[^>]*>/g, "").replace(/\s/g, "").trim();
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/**
 * 生成 slug（从标题）
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s一-鿿]/g, "") // 保留中文
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/**
 * 格式化数字（带单位）
 */
export function formatNumber(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + "w";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "k";
  }
  return num.toString();
}

/**
 * 相对时间（如：3 小时前）
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return "刚刚";
  if (minutes < 60) return `${minutes} 分钟前`;
  if (hours < 24) return `${hours} 小时前`;
  if (days < 30) return `${days} 天前`;
  if (months < 12) return `${months} 个月前`;
  return `${years} 年前`;
}