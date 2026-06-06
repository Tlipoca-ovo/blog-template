import { getConfig } from "@/lib/config";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ThemeEditor } from "./components/ThemeEditor";

export default async function ThemePage() {
  const primaryColor = await getConfig("theme_primary_color", "#6366f1");
  const backgroundColor = await getConfig("theme_background_color", "#ffffff");
  const textColor = await getConfig("theme_text_color", "#1f2937");
  const cardColor = await getConfig("theme_card_color", "#ffffff");
  const borderColor = await getConfig("theme_border_color", "#e5e7eb");
  const fontFamily = await getConfig("theme_font_family", "system-ui");
  const fontSize = await getConfig("theme_font_size", "16");
  const borderRadius = await getConfig("theme_border_radius", "8");
  const maxWidth = await getConfig("theme_max_width", "1280");

  return (
    <div>
      <AdminHeader title="主题定制" description="自定义博客外观样式" />
      <ThemeEditor
        initialPrimaryColor={primaryColor}
        initialBackgroundColor={backgroundColor}
        initialTextColor={textColor}
        initialCardColor={cardColor}
        initialBorderColor={borderColor}
        initialFontFamily={fontFamily}
        initialFontSize={fontSize}
        initialBorderRadius={borderRadius}
        initialMaxWidth={maxWidth}
      />
    </div>
  );
}