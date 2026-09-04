"use client"

import { useTransactions } from "@/components/hooks/use-transactions"
import { useRecurring } from "@/components/hooks/use-recurring"
import { RecurringOverview } from "@/components/ui/Recurring_UI/recurring-overview"
import { RecurringTable } from "@/components/ui/Recurring_UI/recurring-table"
import { AddRecurringDialog } from "@/components/ui/Recurring_UI/add-recurring-dialog"

export default function RecurringPage() {
    const { addTransaction } = useTransactions()
    const {
        recurring, loading,
        addRecurring, updateRecurring, toggleRecurring, deleteRecurring,
    } = useRecurring(addTransaction)

    return (
        <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">

                <div className="flex items-center justify-between px-4 lg:px-6">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">AutoFlow</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {loading
                                ? "Loading..."
                                : `${recurring.length} recurring rule${recurring.length !== 1 ? "s" : ""}`}
                        </p>
                    </div>
                    <AddRecurringDialog onAdd={addRecurring} />
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
                        Loading autopay rules…
                    </div>
                ) : (
                    <>
                        <RecurringOverview recurring={recurring} />
                        <RecurringTable
                            data={recurring}
                            onToggle={toggleRecurring}
                            onEdit={updateRecurring}
                            onDelete={deleteRecurring}
                        />
                    </>
                )}

            </div>
        </div>
    )
}