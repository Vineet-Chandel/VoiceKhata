// src/components/ui/Transaction_UI/data-table.tsx
import * as React from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconDotsVertical,
  IconGripVertical,
  IconLayoutColumns,
  IconLoader,
} from "@tabler/icons-react"
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type Row,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import { z } from "zod"
import { Link } from "react-router-dom"

import { useIsMobile } from "@/components/hooks/use-mobile"
import { Badge } from "@/components/ui/Dashboard_UI/badge"
import { Button } from "@/components/ui/button"
import {
  Drawer, DrawerClose, DrawerContent, DrawerDescription,
  DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger,
} from "@/components/ui/Dashboard_UI/drawer"
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/Dashboard_UI/dropdown-menu"
import { Label }     from "@/components/ui/Dashboard_UI/label"
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/Dashboard_UI/select"
import { Separator } from "@/components/ui/Dashboard_UI/separator"
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/Dashboard_UI/table"

import { EditTransactionDialog }   from "@/components/ui/Transaction_UI/edit-transaction-dialog"
import { DeleteTransactionDialog } from "@/components/ui/Transaction_UI/delete-transaction-dialog"
import type { Transaction } from "@/components/hooks/use-transactions"
import type { Budget } from "@/components/hooks/use-budgets"

export const schema = z.object({
  id:          z.number(),
  transaction: z.string(),
  category:    z.string(),
  amount:      z.number(),
  date:        z.string(),
  method:      z.string(),
  status:      z.string(),
  type:        z.string(),
})

type TransactionUpdate = Omit<Transaction, "id" | "firebase_uid" | "created_at">

interface TableCallbacks {
  onEdit:            (id: number, updated: TransactionUpdate) => Promise<void>
  onDelete:          (id: number) => Promise<void>
  budgetCategories?: string[]
  budgetRows?:       Budget[]
}

// ─── Drag handle ──────────────────────────────────────────────────────────────
function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({ id })
  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="size-7 text-muted-foreground hover:bg-transparent cursor-pointer"
    >
      <IconGripVertical className="size-3 text-muted-foreground" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}

// ─── Actions cell ─────────────────────────────────────────────────────────────
function ActionsCell({
  row, onEdit, onDelete, budgetCategories = [], budgetRows = [],
}: {
  row:               Row<z.infer<typeof schema>>
  onEdit:            (id: number, updated: TransactionUpdate) => Promise<void>
  onDelete:          (id: number) => Promise<void>
  budgetCategories?: string[]
  budgetRows?:       Budget[]
}) {
  const [editOpen,   setEditOpen]   = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)

  const asTransaction: Transaction = {
    ...(row.original as Transaction),
    firebase_uid: "",
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="cursor-pointer">
            <IconDotsVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setEditOpen(true)} className="cursor-pointer">
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => setDeleteOpen(true)}
            className="cursor-pointer"
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditTransactionDialog
        transaction={asTransaction}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSave={onEdit}
        budgetCategories={budgetCategories}
        budgetRows={budgetRows}
      />

      <DeleteTransactionDialog
        transaction={asTransaction}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={onDelete}
      />
    </>
  )
}

// ─── Column factory ───────────────────────────────────────────────────────────
function buildColumns(callbacks: TableCallbacks): ColumnDef<z.infer<typeof schema>>[] {
  return [
    {
      id:     "drag",
      header: () => null,
      cell:   ({ row }) => <DragHandle id={row.original.id} />,
    },
    {
      accessorKey: "transaction",
      header:      "Transaction",
      cell:        ({ row }) => <TransactionViewer item={row.original} />,
    },
    {
      accessorKey: "category",
      header:      "Category",
      cell:        ({ row }) => (
        <div className="inline-flex">
          <Badge variant="outline">{row.original.category}</Badge>
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header:      () => <div className="text-right w-[120px]">Amount</div>,
      cell:        ({ row }) => {
        const isCredit = row.original.type === "Credit"
        return (
          <div className="text-right w-[120px]">
            <span className={`font-bold tabular-nums text-sm ${isCredit ? "text-[#16856A]" : "text-[#172033]"}`}>
              {isCredit ? "+" : "-"}₹{row.original.amount.toLocaleString("en-IN")}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "date",
      header:      () => <div className="pl-6">Date</div>,
      cell:        ({ row }) => <div className="pl-6 text-xs text-[#526078]">{row.original.date}</div>,
    },
    {
      accessorKey: "type",
      header:      "Direction",
      cell:        ({ row }) => {
        const isCredit = row.original.type === "Credit"
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
            isCredit ? "bg-[#E8F6F1] text-[#16856A]" : "bg-[#FDECEE] text-[#C2414B]"
          }`}>
            {isCredit ? "Money In" : "Money Out"}
          </span>
        )
      },
    },
    {
      accessorKey: "method",
      header:      "Method",
    },
    {
      accessorKey: "status",
      header:      "Status",
      cell:        ({ row }) => (
        <Badge variant="outline">
          {row.original.status === "Completed"
            ? <IconCircleCheckFilled className="fill-green-500" />
            : <IconLoader />
          }
          {row.original.status}
        </Badge>
      ),
    },
    {
      id:   "actions",
      cell: ({ row }) => (
        <ActionsCell
          row={row}
          onEdit={callbacks.onEdit}
          onDelete={callbacks.onDelete}
          budgetCategories={callbacks.budgetCategories}
          budgetRows={callbacks.budgetRows}
        />
      ),
    },
  ]
}

// ─── Draggable row ─────────────────────────────────────────────────────────────
function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  })
  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

// ─── DataTable ─────────────────────────────────────────────────────────────────
export function DataTable({
  data: initialData,
  limit,
  showViewAll = false,
  viewAllHref = "/dashboard/transactions",
  onEdit,
  onDelete,
  budgetCategories = [],
  budgetRows = [],
}: {
  data:              z.infer<typeof schema>[]
  limit?:            number
  showViewAll?:      boolean
  viewAllHref?:      string
  onEdit:            (id: number, updated: TransactionUpdate) => Promise<void>
  onDelete:          (id: number) => Promise<void>
  budgetCategories?: string[]
  budgetRows?:       Budget[]
}) {
  const [data, setData] = React.useState(() =>
    limit ? initialData.slice(0, limit) : initialData
  )

  React.useEffect(() => {
    setData(limit ? initialData.slice(0, limit) : initialData)
  }, [initialData, limit])

  const [rowSelection,     setRowSelection]     = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters,    setColumnFilters]    = React.useState<ColumnFiltersState>([])
  const [sorting,          setSorting]          = React.useState<SortingState>([])
  const [pagination,       setPagination]       = React.useState({ pageIndex: 0, pageSize: 10 })

  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data]
  )

  const columns = React.useMemo(
    () => buildColumns({ onEdit, onDelete, budgetCategories, budgetRows }),
    [onEdit, onDelete, budgetCategories, budgetRows]
  )

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnVisibility, rowSelection, columnFilters, pagination },
    getRowId:               (row) => row.id.toString(),
    enableRowSelection:     true,
    onRowSelectionChange:   setRowSelection,
    onSortingChange:        setSorting,
    onColumnFiltersChange:  setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange:     setPagination,
    getCoreRowModel:        getCoreRowModel(),
    getFilteredRowModel:    getFilteredRowModel(),
    getPaginationRowModel:  getPaginationRowModel(),
    getSortedRowModel:      getSortedRowModel(),
    getFacetedRowModel:     getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(data, oldIndex, newIndex)
      })
    }
  }

  return (
    <div className="w-full flex flex-col gap-4">

      {/* Toolbar */}
      <div className="flex items-center justify-end px-4 lg:px-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="cursor-pointer">
              <IconLayoutColumns />
              <span className="hidden lg:inline">Customize Columns</span>
              <span className="lg:hidden">Columns</span>
              <IconChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {table
              .getAllColumns()
              .filter((col) => typeof col.accessorFn !== "undefined" && col.getCanHide())
              .map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  className="capitalize"
                  checked={col.getIsVisible()}
                  onCheckedChange={(value) => col.toggleVisibility(!!value)}
                >
                  {col.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between px-4">
          <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
            {showViewAll ? (
              <Link
                to={viewAllHref}
                className="text-sm text-primary underline-offset-4 hover:underline"
              >
                View all transactions →
              </Link>
            ) : (
              <span>
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} row(s) selected.
              </span>
            )}
          </div>

          {!showViewAll && (
            <div className="flex w-full items-center gap-8 lg:w-fit">
              <div className="hidden items-center gap-2 lg:flex">
                <Label htmlFor="rows-per-page" className="text-sm font-medium">
                  Rows per page
                </Label>
                <Select
                  value={`${table.getState().pagination.pageSize}`}
                  onValueChange={(value) => table.setPageSize(Number(value))}
                >
                  <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                    <SelectValue placeholder={table.getState().pagination.pageSize} />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[10, 20, 30, 40, 50].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>{pageSize}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex w-fit items-center justify-center text-sm font-medium">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </div>

              <div className="ml-auto flex items-center gap-2 lg:ml-0">
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex cursor-pointer"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to first page</span>
                  <IconChevronsLeft />
                </Button>
                <Button
                  variant="outline" className="size-8 cursor-pointer" size="icon"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to previous page</span>
                  <IconChevronLeft />
                </Button>
                <Button
                  variant="outline" className="size-8 cursor-pointer" size="icon"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to next page</span>
                  <IconChevronRight />
                </Button>
                <Button
                  variant="outline"
                  className="hidden size-8 lg:flex cursor-pointer" size="icon"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to last page</span>
                  <IconChevronsRight />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Transaction Viewer drawer ─────────────────────────────────────────────────
function TransactionViewer({ item }: { item: z.infer<typeof schema> }) {
  const isMobile = useIsMobile()

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="link" className="px-0 text-left cursor-pointer">
          {item.transaction}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{item.transaction}</DrawerTitle>
          <DrawerDescription>Transaction details</DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 px-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <p className="text-muted-foreground">{item.category}</p>
            </div>
            <div>
              <Label>Amount</Label>
              <p className="font-medium">{"₹" + item.amount.toLocaleString()}</p>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date</Label>
              <p className="text-muted-foreground">{item.date}</p>
            </div>
            <div>
              <Label>Payment Method</Label>
              <p className="text-muted-foreground">{item.method}</p>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Type</Label>
              <p className={item.type === "Debit" ? "text-red-400" : "text-green-400"}>
                {item.type}
              </p>
            </div>
            <div>
              <Label>Status</Label>
              <p className="text-muted-foreground">{item.status}</p>
            </div>
          </div>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button className="cursor-pointer" variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
