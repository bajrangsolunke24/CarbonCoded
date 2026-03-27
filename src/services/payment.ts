import api from './api';

export interface RazorpayOrderResponse {
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
  request_id: string;
  company_name: string;
  test_mode?: boolean;
}

export async function createOrder(purchase_request_id: string): Promise<RazorpayOrderResponse> {
  const res = await api.post('/payment/create-order', { purchase_request_id });
  return res.data;
}

export async function verifyPayment(payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  const res = await api.post('/payment/verify', payload);
  return res.data;
}

// Used in test/demo mode when no real Razorpay keys are configured
export async function simulatePay(order_id: string) {
  const res = await api.post('/payment/simulate-pay', { order_id });
  return res.data;
}

export function openRazorpayModal(
  orderData: RazorpayOrderResponse,
  onSuccess: (response: any) => void,
  onError: (err: any) => void
) {
  if (!(window as any).Razorpay) {
    // Load Razorpay script dynamically
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => initModal();
    script.onerror = () => onError(new Error('Failed to load Razorpay SDK'));
    document.head.appendChild(script);
  } else {
    initModal();
  }

  function initModal() {
    const options: any = {
      key: orderData.test_mode ? import.meta.env.VITE_RAZORPAY_KEY_ID : (orderData.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID),
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      name: 'Carbon Credit Authority',
      description: `Carbon Credits — ${orderData.request_id}`,
      prefill: { name: orderData.company_name },
      theme: { color: '#1A5C38' },
      modal: { ondismiss: () => onError(new Error('Payment cancelled by user')) },
      handler: async (response: any) => {
        try {
          if (orderData.test_mode) {
            const result = await simulatePay(orderData.order_id);
            onSuccess(result);
          } else {
            const result = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            onSuccess(result);
          }
        } catch (err) {
          onError(err);
        }
      },
    };
    
    if (!orderData.test_mode) {
      options.order_id = orderData.order_id;
    }

    if (orderData.test_mode) {
      const originalDismiss = options.modal.ondismiss;
      options.modal.ondismiss = () => {
        const btn = document.getElementById('rzp-test-done-btn');
        if (btn) btn.remove();
        if (originalDismiss) originalDismiss();
      };
    }

    const rzp = new (window as any).Razorpay(options);
    
    if (orderData.test_mode) {
      // Inject a floating button on top of the Razorpay modal
      const mockBtn = document.createElement('button');
      mockBtn.id = 'rzp-test-done-btn';
      mockBtn.innerText = '✅ Payment Done (Test)';
      mockBtn.style.position = 'fixed';
      mockBtn.style.bottom = '8%';
      mockBtn.style.left = '50%';
      mockBtn.style.transform = 'translateX(-50%)';
      mockBtn.style.zIndex = '2147483647'; // max z-index to appear over Razorpay backdrop
      mockBtn.style.padding = '16px 32px';
      mockBtn.style.backgroundColor = '#16a34a'; // green-600
      mockBtn.style.color = 'white';
      mockBtn.style.border = 'none';
      mockBtn.style.borderRadius = '8px';
      mockBtn.style.fontSize = '18px';
      mockBtn.style.fontWeight = 'bold';
      mockBtn.style.cursor = 'pointer';
      mockBtn.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.1)';
      mockBtn.style.animation = 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite';

      mockBtn.onclick = async () => {
        mockBtn.innerText = 'Processing...';
        mockBtn.disabled = true;
        mockBtn.style.opacity = '0.7';
        try {
          const result = await simulatePay(orderData.order_id);
          // Try to close the Razorpay modal wrappers
          try {
            document.querySelectorAll('.razorpay-container').forEach(el => el.remove());
          } catch(e) {}
          mockBtn.remove();
          onSuccess(result);
        } catch (e) {
          mockBtn.innerText = '✅ Payment Done (Test)';
          mockBtn.disabled = false;
          mockBtn.style.opacity = '1';
          onError(e);
        }
      };
      
      document.body.appendChild(mockBtn);
    }

    rzp.open();
  }
}
