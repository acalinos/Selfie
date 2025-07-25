import { Table } from "@tanstack/react-table";

import { Button } from "./button";
import { Input } from "./input";
import { DataTableViewOptions } from "./data-table-view-options";

import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { X } from "lucide-react";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  titleID: string;
  columnId: string;
  filterName: string;
  filterOptions: {
    label: string;
    value: unknown;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
}

export function DataTableToolbar<TData>({
  table,
  titleID,
  columnId,
  filterName,
  filterOptions,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="w-full overflow-x-auto scrollbar-hide">
      <div className="flex w-max items-center gap-2 px-1 sm:px-0">
        <Input
          placeholder="Filter rows..."
          value={(table.getColumn(titleID)?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn(titleID)?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        <div>
        {table.getColumn(columnId) && (
          <DataTableFacetedFilter
            column={table.getColumn(columnId)}
            title={filterName}
            options={filterOptions}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
