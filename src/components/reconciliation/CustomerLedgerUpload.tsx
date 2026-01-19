'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { FileUp, UploadCloud, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { customerLedgerEntryService } from '@/services/customerLedgerEntry.service';

type CustomerLedgerUploadProps = {
  agencyCode: string;
  dictionary?: any;
};

export function CustomerLedgerUpload({ agencyCode, dictionary }: CustomerLedgerUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    
    try {
      setIsUploading(true);
      await customerLedgerEntryService.uploadLedgerEntry({
        file,
      });

      toast({
        title: dictionary?.success || 'Success',
        description: dictionary?.customerLedgerFileUploaded || 'Customer ledger file uploaded successfully',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error uploading customer ledger:', error);
      toast({
        title: dictionary?.error || 'Error',
        description: dictionary?.failedToUploadCustomer || 'Failed to upload customer ledger file',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
        isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center space-y-2">
        <UploadCloud className="h-10 w-10 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">
            {isDragActive
              ? dictionary?.dropCustomerFile || 'Drop the customer ledger file here'
              : dictionary?.dragAndDropCustomer || 'Drag and drop your customer ledger file here, or click to select'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {dictionary?.excelFilesOnly || 'Excel files only (.xlsx, .xls)'}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="mt-2"
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              {dictionary?.uploading || 'Uploading...'}
            </>
          ) : (
            <>
              <FileUp className="mr-2 h-4 w-4" />
              {dictionary?.selectFile || 'Select File'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
