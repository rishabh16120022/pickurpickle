// This is a simulation of the Shiprocket API.
// In a real production app, these calls would go to your backend server,
// which would then authenticate and communicate with Shiprocket's API securely.

interface ServiceabilityResponse {
  courier_name: string;
  rate: number;
  etd: string;
  available: boolean;
}

export const checkServiceability = async (pincode: string): Promise<ServiceabilityResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Mock Logic: Pincodes starting with 1-8 are valid, 9 is invalid for demo
  if (pincode.length === 6 && !pincode.startsWith('9')) {
    const today = new Date();
    const etd = new Date(today);
    etd.setDate(today.getDate() + 4); // 4 days delivery

    return {
      courier_name: "BlueDart Surface",
      rate: 65,
      etd: etd.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      available: true
    };
  }

  return {
    courier_name: "",
    rate: 0,
    etd: "",
    available: false
  };
};

export const createShiprocketOrder = async (orderDetails: any) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    shiprocket_order_id: `SR-${Math.floor(Math.random() * 1000000)}`,
    shipment_id: `SHP-${Math.floor(Math.random() * 1000000)}`,
    awb_code: `AWB${Math.floor(Math.random() * 1000000000)}`,
    courier_name: "BlueDart Surface"
  };
};

export const getTrackingDetails = async (awb: string) => {
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock timeline generator
  const now = new Date();
  const history = [
    {
      date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toLocaleString(),
      activity: "Order Placed",
      location: "Website",
      status: "done"
    },
    {
      date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toLocaleString(),
      activity: "Pick Up Scheduled",
      location: "Guntur Warehouse",
      status: "done"
    },
    {
      date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toLocaleString(),
      activity: "Order Picked Up",
      location: "Guntur Warehouse",
      status: "done"
    },
    {
      date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toLocaleString(),
      activity: "Arrived at Origin Hub",
      location: "Vijayawada Hub",
      status: "done"
    },
    {
      date: new Date(now.getTime() - 12 * 60 * 60 * 1000).toLocaleString(),
      activity: "In Transit",
      location: "Hyderabad Apex",
      status: "current"
    },
    {
      date: "Estimated",
      activity: "Out for Delivery",
      location: "Destination City",
      status: "pending"
    },
    {
      date: "Estimated",
      activity: "Delivered",
      location: "Customer Address",
      status: "pending"
    }
  ];

  return history;
};