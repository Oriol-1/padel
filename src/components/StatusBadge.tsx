import { playerResponseLabel } from "@/lib/format";

export function StatusBadge({ value }: { value: string }) {
  const css = `badge badge-${value.toLowerCase().replaceAll("_", "-")}`;
  return <span className={css}>{playerResponseLabel(value)}</span>;
}
