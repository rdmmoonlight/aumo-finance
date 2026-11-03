"use client";

import { CreatePeriodForm } from "#/features/periods/components/open-new-period-form";
import { PeriodsAlerts } from "#/features/periods/components/periods-alerts";
import { PeriodsListCard } from "#/features/periods/components/periods-table";
import { usePeriodsPage } from "#/features/periods/hooks/use-periods-page";

export default function PeriodsPage() {
  const {
    periods, openInfo, selectedPeriod, form,
    viewMode, setViewMode,
    errorMessage, setErrorMessage, successMessage, setSuccessMessage,
    isLoading, isLoadingOpenInfo, isGetPeriodsError,
    isSelecting, isClearing, isClosing, isCreating,
    selectingId, closingId,
    handleSelectPeriod, handleClearSelection, handleClosePeriod, handleCreateSubmit,
  } = usePeriodsPage();

  return (
    <div className="space-y-6">
      <PeriodsAlerts
        errorMessage={errorMessage}
        isGetPeriodsError={isGetPeriodsError}
        successMessage={successMessage}
        onClearError={() => setErrorMessage(null)}
        onClearSuccess={() => setSuccessMessage(null)}
      />

      {viewMode === "list" ? (
        <div className="grid grid-cols-12 gap-5 items-start">
          <div className="col-span-12 lg:col-span-6 xl:col-span-5 w-full lg:w-[calc(100%+3cm)]">
            <PeriodsListCard
              periods={periods}
              isLoading={isLoading}
              selectedPeriod={selectedPeriod}
              selectingId={selectingId}
              closingId={closingId}
              isSelecting={isSelecting}
              isClearing={isClearing}
              isClosing={isClosing}
              onSelectPeriod={handleSelectPeriod}
              onClosePeriod={handleClosePeriod}
              onClearSelection={handleClearSelection}
              onOpenCreate={() => setViewMode("create")}
            />
          </div>
          <div className="col-span-12 lg:col-span-6 xl:col-span-7 lg:pl-">
            <div className="min-h- rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] flex flex-col items-center justify-center gap-2 p-8 text-center">
              <span className="text- uppercase tracking-widest text-zinc-500">Empty space</span>
              <p className="text-xs text-zinc-600 max-w- leading-relaxed">
                Buat detail / chart nanti. Tabel udah dilebarin 3cm ke kanan.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-3xl">
          <CreatePeriodForm
            initialValues={form.initialValues}
            openInfo={openInfo}
            isLoadingOpenInfo={isLoadingOpenInfo}
            isCreating={isCreating}
            setMonth={form.setMonth}
            setYear={form.setYear}
            setSetupMode={form.setSetupMode}
            setCashAccountId={form.setCashAccountId}
            setBankAccountId={form.setBankAccountId}
            setRetainedId={form.setRetainedId}
            setCashAccountCode={form.setCashAccountCode}
            setCashAccountName={form.setCashAccountName}
            setCashBalance={form.setCashBalance}
            setBankAccountCode={form.setBankAccountCode}
            setBankAccountName={form.setBankAccountName}
            setBankBalance={form.setBankBalance}
            setRetainedCode={form.setRetainedCode}
            setRetainedName={form.setRetainedName}
            onSubmit={handleCreateSubmit}
            onCancel={() => setViewMode("list")}
          />
        </div>
      )}
    </div>
  );
}
