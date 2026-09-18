import React from "react";
import { Card, EmptyState } from "./ui.jsx";
import { Inbox } from "lucide-react";

/**
 * columns: [{ key, label, render?: (row) => node, align?: 'left'|'right', width?: string }]
 * rows: array of objects
 * rowKey: string key used as the React key + optional onRowClick param
 */
export default function DataTable({ columns, rows, rowKey = "id", onRowClick, emptyLabel = "No records yet" }) {
  if (!rows || rows.length === 0) {
    return (
      <Card>
        <EmptyState icon={Inbox} title={emptyLabel} description="Records will appear here once available." />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-black/[0.06]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`text-xs font-medium text-black/35 py-3.5 px-5 whitespace-nowrap ${
                    col.align === "right" ? "text-right" : "text-left"
                  }`}
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row[rowKey]}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`border-b border-black/[0.04] last:border-0 ${
                  onRowClick ? "cursor-pointer hover:bg-black/[0.015]" : ""
                } transition-colors`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`py-3.5 px-5 align-middle text-black/75 ${
                      col.align === "right" ? "text-right" : "text-left"
                    }`}
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
