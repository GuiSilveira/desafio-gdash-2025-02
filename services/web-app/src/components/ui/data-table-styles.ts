export const CARD_STYLES =
  "rounded-3xl shadow-[0px_8px_24px_rgba(45,52,54,0.04)] dark:bg-[#2C3A4B] dark:shadow-none dark:border dark:border-[#3E4C5E]";
export const ICON_CONTAINER_STYLES = "p-3 rounded-2xl bg-blue-100 dark:bg-blue-950/30";
export const TITLE_STYLES = "text-xl font-bold text-[#2D3436] dark:text-[#F7F9FC]";
export const SUBTITLE_STYLES = "text-sm text-[#636E72] dark:text-[#9BA6B5] mt-1";
export const TABLE_HEADER_ROW_STYLES =
  "bg-slate-50 dark:bg-[#3E4C5E]/50 hover:bg-slate-50 dark:hover:bg-[#3E4C5E]/50";
export const TABLE_HEADER_CELL_STYLES =
  "font-semibold text-[#2D3436] dark:text-[#F7F9FC]";
export const TABLE_ROW_STYLES =
  "hover:bg-slate-50 dark:hover:bg-[#3E4C5E]/30 transition-colors";
export const TABLE_CONTAINER_STYLES =
  "rounded-xl border border-slate-200 dark:border-[#3E4C5E] overflow-hidden grid grid-cols-1";

export const dataTableStyles = {
  card: CARD_STYLES,
  iconContainer: ICON_CONTAINER_STYLES,
  title: TITLE_STYLES,
  subtitle: SUBTITLE_STYLES,
  tableHeaderRow: TABLE_HEADER_ROW_STYLES,
  tableHeaderCell: TABLE_HEADER_CELL_STYLES,
  tableRow: TABLE_ROW_STYLES,
  tableContainer: TABLE_CONTAINER_STYLES,
} as const;
