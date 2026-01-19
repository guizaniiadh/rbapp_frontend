'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { bankLedgerEntryService } from '@/services/bankLedgerEntry.service';
import { customerLedgerEntryService } from '@/services/customerLedgerEntry.service';

type ReconciliationResultsProps = {
  agencyCode: string;
  dictionary?: any;
};

type ReconciliationStatus = 'idle' | 'loading' | 'success' | 'error';

export function ReconciliationResults({ agencyCode, dictionary }: ReconciliationResultsProps) {
  const [status, setStatus] = useState<ReconciliationStatus>('idle');
  const [bankLedgerCount, setBankLedgerCount] = useState<number>(0);
  const [customerLedgerCount, setCustomerLedgerCount] = useState<number>(0);
  const [mismatchedEntries, setMismatchedEntries] = useState<any[]>([]);
  const { toast } = useToast();

  const loadLedgerCounts = async () => {
    try {
      const [bankEntries, customerEntries] = await Promise.all([
        bankLedgerEntryService.getLedgerEntriesByAgency(agencyCode),
        customerLedgerEntryService.getCustomerLedgerEntries(),
      ]);

      setBankLedgerCount(bankEntries.length);
      setCustomerLedgerCount(customerEntries.length);
    } catch (error) {
      console.error('Error loading ledger counts:', error);
      toast({
        title: dictionary?.error || 'Error',
        description: dictionary?.failedToLoadLedgerEntries || 'Failed to load ledger entries',
        variant: 'destructive',
      });
    }
  };

  const handleReconcile = async () => {
    try {
      setStatus('loading');
      
      // TODO: Implement actual reconciliation logic with your API
      // This is a placeholder for the reconciliation process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock data for demonstration
      setMismatchedEntries([
        { id: 1, reference: 'INV-001', amount: 1000, type: 'bank' },
        { id: 2, reference: 'PAY-045', amount: 2500, type: 'customer' },
      ]);
      
      setStatus('success');
      toast({
        title: dictionary?.success || 'Success',
        description: dictionary?.reconciliationCompletedSuccessfully || 'Reconciliation completed successfully',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error during reconciliation:', error);
      setStatus('error');
      toast({
        title: dictionary?.error || 'Error',
        description: dictionary?.failedToReconcileLedgers || 'Failed to reconcile ledgers',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    loadLedgerCounts();
  }, [agencyCode]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">{dictionary?.reconciliationResults || 'Reconciliation Status'}</h3>
          <p className="text-sm text-muted-foreground">
            {bankLedgerCount} {dictionary?.bank || 'bank'} entries • {customerLedgerCount} {dictionary?.customer || 'customer'} entries
          </p>
        </div>
        <Button
          onClick={handleReconcile}
          disabled={status === 'loading' || bankLedgerCount === 0 || customerLedgerCount === 0}
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {dictionary?.reconciling || 'Reconciling...'}
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              {dictionary?.reconcileNow || 'Reconcile Now'}
            </>
          )}
        </Button>
      </div>

      {status === 'success' && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle2 className="h-5 w-5 text-green-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">{dictionary?.reconciliationComplete || 'Reconciliation Complete'}</h3>
              <div className="mt-2 text-sm text-green-700">
                {mismatchedEntries.length > 0 ? (
                  <p>{mismatchedEntries.length} {dictionary?.mismatchedEntriesFound || 'mismatched entries found'}</p>
                ) : (
                  <p>{dictionary?.allEntriesMatch || 'All entries match perfectly!'}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{dictionary?.reconciliationFailed || 'Reconciliation Failed'}</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{dictionary?.errorDuringReconciliation || 'An error occurred during reconciliation. Please try again.'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {mismatchedEntries.length > 0 && status === 'success' && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">{dictionary?.mismatchedEntries || 'Mismatched Entries'}</h4>
          <div className="overflow-hidden border rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {dictionary?.reference || 'Reference'}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {dictionary?.amount || 'Amount'}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {dictionary?.type || 'Type'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mismatchedEntries.map((entry) => (
                  <tr key={`${entry.type}-${entry.id}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.reference}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        entry.type === 'bank' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {entry.type === 'bank' ? (dictionary?.bank || 'Bank') : (dictionary?.customer || 'Customer')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
