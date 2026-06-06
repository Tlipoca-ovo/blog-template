/**
 * 生成 URL 友好的 slug
 * @param text 输入文本
 * @param customSlug 可选的自定义 slug
 * @returns 生成的 slug
 */
export function generateSlug(text: string, customSlug?: string): string {
  if (customSlug) return customSlug;
  return text
    .toLowerCase()
    .replace(/[^a-zA-Z0-9一-龥]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * 验证 slug 格式
 * @param slug 要验证的 slug
 * @returns 是否为合法 slug
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-zA-Z0-9一-龥]+(-[a-zA-Z0-9一-龥]+)*$/.test(slug);
}

/**
 * 验证 URL 格式
 * @param url 要验证的 URL
 * @returns 是否为合法 URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 验证十六进制颜色格式
 * @param color 要验证的颜色值
 * @returns 是否为合法的十六进制颜色
 */
export function isValidColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}