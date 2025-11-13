import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { CreditCard, Loader2 } from 'lucide-react';

const PaymentGatewaySettings = () => {
  const [paymentGateway, setPaymentGateway] = useState<string>('tranzupi');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPaymentGateway();
  }, []);

  const fetchPaymentGateway = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/payment-gateway`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPaymentGateway(data.paymentGateway || 'tranzupi');
      } else {
        console.error('Failed to fetch payment gateway');
      }
    } catch (error) {
      console.error('Error fetching payment gateway:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/payment-gateway`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paymentGateway })
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Success',
          description: 'Payment gateway updated successfully',
        });
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to update payment gateway',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error updating payment gateway:', error);
      toast({
        title: 'Error',
        description: 'Failed to update payment gateway',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Gateway Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">
            Select Payment Gateway
          </label>
          <Select value={paymentGateway} onValueChange={setPaymentGateway}>
            <SelectTrigger className="bg-[#2A2A2A] border-[#3A3A3A] text-white">
              <SelectValue placeholder="Select gateway" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tranzupi">Tranzupi</SelectItem>
              <SelectItem value="neoupi">Neo UPI</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-400">
            All payment methods will use the selected gateway. 
            {paymentGateway === 'tranzupi' && ' Currently using Tranzupi for all payments.'}
            {paymentGateway === 'neoupi' && ' Currently using Neo UPI for all payments.'}
          </p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Settings'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PaymentGatewaySettings;

