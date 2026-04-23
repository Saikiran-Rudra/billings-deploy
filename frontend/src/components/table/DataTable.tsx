import type { FC, ReactNode } from "react";
import TableRow from "./TableRow";

export interface Column {
  key: string;
  header: string;
  accessor?: (row: Record<string, unknown>) => ReactNode;
}

export interface TableAction {
  label: string;
  onClick: (row: Record<string, unknown>) => void;
  variant?: "primary" | "danger";
  icon?: FC<{ className?: string }>;
}

interface DataTableProps {
  columns: Column[];
  data: Record<string, unknown>[];
  actions?: TableAction[];
  isLoading?: boolean;
}

export default function DataTable({ columns, data, actions, isLoading = false }: DataTableProps) {
  return (
    <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
      <table className="table w-full">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
              >
                {col.header}
              </th>
            ))}
            {actions && actions.length > 0 && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, index) => (
            <TableRow
              key={(row._id as string) ?? (row.id as string | number) ?? index}
              row={row}
              columns={columns}
              actions={actions}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
