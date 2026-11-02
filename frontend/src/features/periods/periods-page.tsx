"use client";

import { CreatePeriodForm } from "#/features/periods/components/open-new-period-form";
import { PeriodsAlerts } from "#/features/periods/components/periods-alerts";
import { PeriodsListCard } from "#/features/periods/components/periods-list-card";
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
    <div className="space-y-6 max-w-5xl">
      <PeriodsAlerts
        errorMessage={errorMessage}
        isGetPeriodsError={isGetPeriodsError}
        successMessage={successMessage}
        onClearError={() => setErrorMessage(null)}
        onClearSuccess={() => setSuccessMessage(null)}
      />

      {viewMode === "list" ? (
        <PeriodsListCard
          periods={periods}
          isLoading={isLoading}
          selectedPeriod={selectedPeriod}
          selectingId={selectingId}
          closingId={closingId}
          isSelecting={isSelecting}
          isClearing={isClearing}
          isClosing={isClosing}
          onSelect={handleSelectPeriod}
          onClose={handleClosePeriod}
          onClearSelection={handleClearSelection}
          onOpenCreate={() => setViewMode("create")}
        />
      ) : (
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
      )}
    </div>
  );
}