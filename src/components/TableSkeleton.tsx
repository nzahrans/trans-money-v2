const WIDTHS = ["w-3/4", "w-1/2", "w-2/3", "w-5/6", "w-3/5", "w-4/5", "w-1/3", "w-2/5"];

type Props = {
  cols?: number;
  rows?: number;
};

export default function TableSkeleton({ cols = 5, rows = 8 }: Props) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-slate-100 dark:border-sky-900/20">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-5 py-3.5">
              <div
                className={`h-4 bg-slate-200 dark:bg-sky-900/30 rounded animate-pulse ${WIDTHS[(i * cols + j) % WIDTHS.length]}`}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
