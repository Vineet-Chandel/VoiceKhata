"use client"

import * as React from "react"
import { format, parseISO } from "date-fns"
import {
    closestCenter, DndContext, KeyboardSensor,
    MouseSensor, TouchSensor, useSensor, useSensors,
    type DragEndEvent, type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
    arrayMove, SortableContext,
    useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
    IconChevronDown, IconChevronLeft, IconChevronRight,
    IconChevronsLeft, IconChevronsRight, IconDotsVertical,
    IconGripVertical, IconLayoutColumns,
} from "@tabler/icons-react"
import {
    flexRender, getCoreRowModel, getFacetedRowModel,
    getFacetedUniqueValues, getFilteredRowModel,
    getPaginationRowModel, getSortedRowModel, useReactTable,
    type ColumnDef, type ColumnFiltersState,
    type Row, type SortingState, type VisibilityState,
} from "@tanstack/react-table"

import { useIsMobile } from "@/components/hooks/use-mobile"
import { Badge } from "@/components/ui/Dashboard_UI/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
    Drawer, DrawerClose, DrawerContent, DrawerDescription,
    DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger,
} from "@/components/ui/Dashboard_UI/drawer"
import {
    DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/Dashboard_UI/dropdown-menu"
import { Label } from "@/components/ui/Dashboard_UI/label"
import { Separator } from "@/components/ui/Dashboard_UI/separator"
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/Dashboard_UI/select"
import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow,
} from "@/components/ui/Dashboard_UI/table"

import { EditRecurringDialog } from "@/components/ui/Recurring_UI/edit-recurring-dialog"
import { DeleteRecurringDialog } from "@/components/ui/Recurring_UI/delete-recurring-dialog"
import type { RecurringTransaction, RecurringInput } from "@/components/hooks/use-recurring"
import { useLanguage } from "@/context/LanguageContext"

const FREQ_COLORS: Record<string, string> = {
    daily: "bg-blue-500/10 text-blue-500",
    weekly: "bg-purple-500/10 text-purple-500",
    monthly: "bg-orange-500/10 text-orange-500",
    yearly: "bg-green-500/10 text-green-500",
}

// ── Drag handle ───────────────────────────────────────────────────────────────
function DragHandle({ id }: { id: string }) {
    const { attributes, listeners } = useSortable({ id })
    return (
        <Button
            {...attributes} {...listeners}
            variant="ghost" size="icon"
            className="size-7 text-muted-foreground hover:bg-transparent cursor-pointer"
        >
            <IconGripVertical className="size-3 text-muted-foreground" />
            <span className="sr-only">Drag to reorder</span>
        </Button>
    )
}

// ── Actions cell ──────────────────────────────────────────────────────────────
function ActionsCell({
    row, onToggle, onEdit, onDelete,
}: {
    row: Row<RecurringTransaction>
    onToggle: (id: string, active: boolean) => Promise<unknown>
    onEdit: (id: string, updates: Partial<RecurringInput>) => Promise<unknown>
    onDelete: (id: string) => Promise<void>
}) {
    const { t } = useLanguage()
    const [editOpen, setEditOpen] = React.useState(false)
    const [deleteOpen, setDeleteOpen] = React.useState(false)

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="cursor-pointer">
                        <IconDotsVertical />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem
                        onSelect={() => onToggle(row.original.id, !row.original.active)}
                        className="cursor-pointer"
                    >
                        {row.original.active ? t("tx.pause") : t("tx.resume")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setEditOpen(true)} className="cursor-pointer">
                        {t("common.edit")}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        variant="destructive"
                        onSelect={() => setDeleteOpen(true)}
                        className="cursor-pointer"
                    >
                        {t("common.delete")}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <EditRecurringDialog
                recurring={row.original}
                open={editOpen}
                onOpenChange={setEditOpen}
                onSave={onEdit}
            />
            <DeleteRecurringDialog
                recurring={row.original}
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                onConfirm={onDelete}
            />
        </>
    )
}

// ── Column factory ────────────────────────────────────────────────────────────
function buildColumns(
    onToggle: (id: string, active: boolean) => Promise<unknown>,
    onEdit: (id: string, updates: Partial<RecurringInput>) => Promise<unknown>,
    onDelete: (id: string) => Promise<void>,
    t: (key: string) => string
): ColumnDef<RecurringTransaction>[] {
    return [
        {
            id: "drag",
            header: () => null,
            cell: ({ row }) => <DragHandle id={row.original.id} />,
        },
        {
            accessorKey: "transaction",
            header: t("tx.transaction"),
            cell: ({ row }) => <RecurringViewer item={row.original} />,
        },
        {
            accessorKey: "amount",
            header: () => <div className="text-right w-[120px]">{t("tx.amount")}</div>,
            cell: ({ row }) => (
                <div className="text-right w-[120px] font-medium">
                    ₹{row.original.amount.toLocaleString("en-IN")}
                </div>
            ),
        },
        {
            accessorKey: "category",
            header: t("tx.category"),
            cell: ({ row }) => (
                <div className="inline-flex">
                    <Badge variant="outline">{row.original.category}</Badge>
                </div>
            ),
        },
        {
            accessorKey: "frequency",
            header: t("tx.frequency"),
            cell: ({ row }) => (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${FREQ_COLORS[row.original.frequency]}`}>
                    {row.original.frequency.charAt(0).toUpperCase() + row.original.frequency.slice(1)}
                </span>
            ),
        },
        {
            accessorKey: "next_run",
            header: t("tx.nextRun"),
            cell: ({ row }) => (
                <span className="text-muted-foreground text-sm">
                    {format(parseISO(row.original.next_run), "dd MMM yyyy")}
                </span>
            ),
        },
        {
            accessorKey: "end_date",
            header: t("tx.endDate"),
            cell: ({ row }) => (
                <span className="text-muted-foreground text-sm">
                    {row.original.end_date ? format(parseISO(row.original.end_date), "dd MMM yyyy") : "—"}
                </span>
            ),
        },
        {
            accessorKey: "method",
            header: t("tx.method"),
        },
        {
            accessorKey: "type",
            header: t("tx.type"),
            cell: ({ row }) => (
                <Badge
                    className={
                        row.original.type === "Credit"
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                    }
                >
                    {row.original.type}
                </Badge>
            ),
        },
        {
            accessorKey: "active",
            header: t("tx.active"),
            cell: ({ row }) => (
                <Switch
                    checked={row.original.active}
                    onCheckedChange={(checked) => onToggle(row.original.id, checked)}
                />
            ),
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <ActionsCell
                    row={row}
                    onToggle={onToggle}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ),
        },
    ]
}

// ── Draggable row ─────────────────────────────────────────────────────────────
function DraggableRow({ row }: { row: Row<RecurringTransaction> }) {
    const { transform, transition, setNodeRef, isDragging } = useSortable({
        id: row.original.id,
    })
    return (
        <TableRow
            data-state={row.getIsSelected() && "selected"}
            data-dragging={isDragging}
            ref={setNodeRef}
            className={`relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80 ${!row.original.active ? "opacity-50" : ""}`}
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

// ── Main table ────────────────────────────────────────────────────────────────
export function RecurringTable({
    data: initialData,
    onToggle,
    onEdit,
    onDelete,
}: {
    data: RecurringTransaction[]
    onToggle: (id: string, active: boolean) => Promise<unknown>
    onEdit: (id: string, updates: Partial<RecurringInput>) => Promise<unknown>
    onDelete: (id: string) => Promise<void>
}) {
    const { t, language } = useLanguage()
    const [data, setData] = React.useState(initialData)

    React.useEffect(() => { setData(initialData) }, [initialData])

    const [rowSelection, setRowSelection] = React.useState({})
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 })

    const sortableId = React.useId()
    const sensors = useSensors(
        useSensor(MouseSensor, {}),
        useSensor(TouchSensor, {}),
        useSensor(KeyboardSensor, {})
    )

    const dataIds = React.useMemo<UniqueIdentifier[]>(
        () => data.map((r) => r.id),
        [data]
    )

    const columns = React.useMemo(
        () => buildColumns(onToggle, onEdit, onDelete, t),
        [onToggle, onEdit, onDelete, t]
    )

    const table = useReactTable({
        data,
        columns,
        state: { sorting, columnVisibility, rowSelection, columnFilters, pagination },
        getRowId: (row) => row.id,
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
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

    if (!data.length) {
        return (
            <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
                {t("tx.noRecurringRules")}
            </div>
        )
    }

    return (
        <div className="w-full flex flex-col gap-4">

            {/* Toolbar */}
            <div className="flex items-center justify-end px-4 lg:px-6">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="cursor-pointer">
                            <IconLayoutColumns />
                            <span className="hidden lg:inline">{language === 'hi' ? 'कॉलम कस्टमाइज़ करें' : 'Customize Columns'}</span>
                            <span className="lg:hidden">{language === 'hi' ? 'कॉलम' : 'Columns'}</span>
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
                                            {t("tx.noResults")}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </DndContext>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-4">
                    <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
                        {table.getFilteredSelectedRowModel().rows.length} {t("tx.of")}{" "}
                        {table.getFilteredRowModel().rows.length} {language === 'hi' ? 'पंक्तियाँ चुनी गईं।' : 'row(s) selected.'}
                    </div>
                    <div className="flex w-full items-center gap-8 lg:w-fit">
                        <div className="hidden items-center gap-2 lg:flex">
                            <Label htmlFor="rows-per-page" className="text-sm font-medium">
                                {t("tx.rowsPerPage")}
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
                            {t("tx.pageOf")} {table.getState().pagination.pageIndex + 1} {t("tx.of")} {table.getPageCount()}
                        </div>
                        <div className="ml-auto flex items-center gap-2 lg:ml-0">
                            <Button
                                variant="outline" className="hidden h-8 w-8 p-0 lg:flex cursor-pointer"
                                onClick={() => table.setPageIndex(0)}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <IconChevronsLeft />
                            </Button>
                            <Button
                                variant="outline" className="size-8 cursor-pointer" size="icon"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <IconChevronLeft />
                            </Button>
                            <Button
                                variant="outline" className="size-8 cursor-pointer" size="icon"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                <IconChevronRight />
                            </Button>
                            <Button
                                variant="outline" className="hidden size-8 lg:flex cursor-pointer" size="icon"
                                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                disabled={!table.getCanNextPage()}
                            >
                                <IconChevronsRight />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ── Recurring Viewer drawer ───────────────────────────────────────────────────
function RecurringViewer({ item }: { item: RecurringTransaction }) {
    const isMobile = useIsMobile()
    const { t } = useLanguage()

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
                    <DrawerDescription>{t("tx.autopayRuleDetails")}</DrawerDescription>
                </DrawerHeader>
                <div className="flex flex-col gap-4 px-4 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>{t("tx.amount")}</Label>
                            <p className="font-medium">₹{item.amount.toLocaleString("en-IN")}</p>
                        </div>
                        <div>
                            <Label>{t("tx.category")}</Label>
                            <p className="text-muted-foreground">{item.category}</p>
                        </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>{t("tx.frequency")}</Label>
                            <p className="text-muted-foreground capitalize">{item.frequency}</p>
                        </div>
                        <div>
                            <Label>{t("tx.method")}</Label>
                            <p className="text-muted-foreground">{item.method}</p>
                        </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>{t("tx.nextRun")}</Label>
                            <p className="text-muted-foreground">
                                {format(parseISO(item.next_run), "dd MMM yyyy")}
                            </p>
                        </div>
                        <div>
                            <Label>{t("tx.endDate")}</Label>
                            <p className="text-muted-foreground">
                                {item.end_date ? format(parseISO(item.end_date), "dd MMM yyyy") : t("tx.noEndDate")}
                            </p>
                        </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>{t("tx.type")}</Label>
                            <p className={item.type === "Credit" ? "text-green-400" : "text-red-400"}>
                                {item.type}
                            </p>
                        </div>
                        <div>
                            <Label>{t("tx.status")}</Label>
                            <p className={item.active ? "text-green-400" : "text-muted-foreground"}>
                                {item.active ? t("tx.active") : t("tx.paused")}
                            </p>
                        </div>
                    </div>
                </div>
                <DrawerFooter>
                    <DrawerClose asChild>
                        <Button variant="outline" className="cursor-pointer">Close</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}