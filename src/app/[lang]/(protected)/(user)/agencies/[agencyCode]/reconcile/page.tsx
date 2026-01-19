import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUp, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BankLedgerUpload } from '@/components/reconciliation/BankLedgerUpload';
import { CustomerLedgerUpload } from '@/components/reconciliation/CustomerLedgerUpload';
import { ReconciliationResults } from '@/components/reconciliation/ReconciliationResults';

type ReconciliationPageProps = {
  params: {
    agencyCode: string;
    lang: string;
  };
};

export default function ReconciliationPage({ params }: ReconciliationPageProps) {
  const { agencyCode } = params;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Reconciliation - {decodeURIComponent(agencyCode)}
        </h2>
        <p className="text-muted-foreground">
          Upload and reconcile bank and customer ledger entries
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Bank Ledger</CardTitle>
          </CardHeader>
          <CardContent>
            <BankLedgerUpload agencyCode={agencyCode} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Ledger</CardTitle>
          </CardHeader>
          <CardContent>
            <CustomerLedgerUpload agencyCode={agencyCode} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reconciliation Results</CardTitle>
        </CardHeader>
        <CardContent>
          <ReconciliationResults agencyCode={agencyCode} />
        </CardContent>
      </Card>
    </div>
  );
}
