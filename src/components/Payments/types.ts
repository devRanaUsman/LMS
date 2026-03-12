export interface SafePayTransaction {
    id: string;
    customer: {
        first_name: string;
        email: string;
        phone: string;
    };
    metadata: {
        order_id: string;
    };
    display_amount: string;
    state: "TRACKER_ENDED" | "INCOMPLETE";
    created_at: {
        seconds: number;
    };
}
