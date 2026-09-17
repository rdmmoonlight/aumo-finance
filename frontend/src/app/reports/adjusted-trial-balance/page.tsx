'use client'


import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/apiClient';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { IconListCheck, IconCalendar, IconEyeOff, IconAlertTriangle, IconLoader2, IconCircleCheck } from '@tabler/icons-react';

export interface TrialRow { accountId: number; referenceNumber: number; accountName: string; type: string; normalBalanceIsDebit: boolean; netBalance?: number; debit?: number; credit?: number; amount?: number; }
const formatNumber = (n:number) => n===0? '-': new Intl.NumberFormat('id-ID',{style:'decimal',maximumFractionDigits:0}).format(Math.abs(n));

function useTrialBalance(endpoint: string) {
  const [noPeriod, setNoPeriod] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [rows, setRows] = useState<TrialRow[]>([]);
  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try{
      const {data} = await apiClient.get(endpoint);
      if(data?.hasPeriodSelected===false){ setNoPeriod(true); setRows([]); return; }
      const raw: any[] = Array.isArray(data)? data : data?.data || data?.rows || [];
      const computed = raw.map((r:any)=>{
        const net = r.netBalance?? r.amount?? 0;
        let debit = r.debit?? 0; let credit = r.credit?? 0;
        if(r.debit===undefined && r.credit===undefined){
          if(r.normalBalanceIsDebit){ debit = net>=0? net:0; credit = net<0? Math.abs(net):0; }
          else { credit = net>=0? net:0; debit = net<0? Math.abs(net):0; }
        }
        return {...r, debit, credit };
      });
      setNoPeriod(false); setRows(computed);
    }catch(err:any){ if(err.response?.status===404){ setNoPeriod(true); } else setError(err.response?.data?.message||err.message); }
    finally{ setLoading(false); }
  }, [endpoint]);
  useEffect(()=>{ fetchData(); const h=()=>fetchData(); window.addEventListener('periodChanged',h); return()=>window.removeEventListener('periodChanged',h); }, [fetchData]);
  const totalDebit = useMemo(()=> rows.reduce((s,r)=>s+(Number(r.debit)||0),0), [rows]);
  const totalCredit = useMemo(()=> rows.reduce((s,r)=>s+(Number(r.credit)||0),0), [rows]);
  return { noPeriod, loading, error, rows, totalDebit, totalCredit, isBalanced: Math.abs(totalDebit-totalCredit) < 0.01 };
}

function TrialTable({ rows, totalDebit, totalCredit }: { rows:TrialRow[], totalDebit:number, totalCredit:number }) {
  return (
    <Card className="overflow-hidden"><CardContent className="p-0"><Table><TableHeader><TableRow>
      <TableHead className="text-center pl-6 w-[10%]">Ref.</TableHead><TableHead className="w-[50%]">Account</TableHead><TableHead className="w-[15%]">Type</TableHead><TableHead className="text-right w-[12%]">Debit</TableHead><TableHead className="text-right pr-6 w-[13%]">Credit</TableHead>
    </TableRow></TableHeader><TableBody>{rows.length? rows.map(r=><TableRow key={r.accountId}><TableCell className="text-center pl-6"><Badge variant="outline" className="font-mono text-amber-500">{r.referenceNumber||'-'}</Badge></TableCell><TableCell className="text-xs font-medium">{r.accountName}</TableCell><TableCell><Badge variant="secondary">{r.type}</Badge></TableCell><TableCell className="text-right font-mono text-xs text-emerald-500">{(r.debit||0)>0? formatNumber(r.debit!):'-'}</TableCell><TableCell className="text-right pr-6 font-mono text-xs text-red-500">{(r.credit||0)>0? formatNumber(r.credit!):'-'}</TableCell></TableRow>) : <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-xs">No accounts found.</TableCell></TableRow>}</TableBody><TableFooter><TableRow className="font-bold"><TableCell colSpan={3} className="text-right pl-6">Total</TableCell><TableCell className="text-right font-mono text-emerald-500">{formatNumber(totalDebit)}</TableCell><TableCell className="text-right pr-6 font-mono text-red-500">{formatNumber(totalCredit)}</TableCell></TableRow></TableFooter></Table></CardContent></Card>
  )
}

export default function AdjustedTrialBalancePage() {
  const { noPeriod, loading, error, rows, totalDebit, totalCredit, isBalanced } = useTrialBalance('/api/v1/reports/trial-balance/adjusted');
  if(loading) return <div className="py-16 text-center text-muted-foreground flex items-center justify-center gap-2"><IconLoader2 className="animate-spin" size={16}/> Loading adjusted trial balance...</div>;
  return (
    <div className="space-y-6">
      <div><h1 className="text-xl font-bold flex items-center gap-2"><IconListCheck className="text-amber-500" size={22}/> Adjusted Trial Balance</h1><p className="text-sm text-muted-foreground mt-1">After adjusting entries • IDR</p></div>
      {error && <Alert variant="destructive"><IconAlertTriangle size={16}/><AlertDescription>{error}</AlertDescription></Alert>}
      {noPeriod? (
        <Card className="py-16 text-center border-dashed"><CardContent className="space-y-3"><IconEyeOff size={36} className="mx-auto text-muted-foreground"/><h3 className="font-semibold">No Period Selected</h3><p className="text-sm text-muted-foreground">Select a period to view trial balance.</p><Button asChild size="sm"><Link href="/periods" className="gap-1.5"><IconCalendar size={14}/> Go to Periods</Link></Button></CardContent></Card>
      ) : (
        <>
          <TrialTable rows={rows} totalDebit={totalDebit} totalCredit={totalCredit} />
          <Alert className={isBalanced? 'bg-emerald-500/10 border-emerald-500/20':'bg-red-500/10 border-red-500/20'}><IconCircleCheck size={16}/><AlertDescription className="text-xs">{isBalanced? 'Adjusted TB is balanced':'Unbalanced - check adjusting entries'}</AlertDescription></Alert>
        </>
      )}
    </div>
  );
}
