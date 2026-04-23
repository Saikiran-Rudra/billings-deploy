import type { ReactNode } from "react";
import type { Column, TableAction } from "./DataTable";

interface TableRowProps {
  row: Record<string, unknown>;
  columns: Column[];
  actions?: TableAction[];
}

export default function TableRow({ row, columns, actions }: TableRowProps) {
  return (
    <tr>
      {columns.map((col) => {
        const value = col.accessor ? col.accessor(row) : row[col.key] ?? "";
        return (
          <td key={col.key} className="px-6 py-4 whitespace-nowrap">
            {value as ReactNode}
          </td>
        );
      })}
      {actions && actions.length > 0 && (
        <td className="px-6 py-4 whitespace-nowrap flex gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            const isDelete = action.variant === "danger";
            
            return (
              <button
                key={action.label}
                onClick={() => action.onClick(row)}
                title={action.label}
                className={`transition-colors ${
                  isDelete
                    ? "text-red-500 hover:text-red-700 hover:bg-red-50"
                    : action.label === "View"
                      ? "text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                      : "text-green-500 hover:text-green-700 hover:bg-green-50"
                } p-2 rounded-md`}
              >
                {Icon ? (
                  <Icon className="w-5 h-5" />
                ) : (
                  action.label
                )}
              </button>
            );
          })}
        </td>
      )}
    </tr>
  );
}
