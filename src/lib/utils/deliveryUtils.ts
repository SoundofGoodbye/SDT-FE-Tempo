import { DeliveryStep } from "@/components/ui/StepTimeline";

// Function to convert API deliveryStepName to UI stepType format
//FIXME: This should be deprecated - find usages and impact of removal first.
export const convertDeliveryStepName = (deliveryStepName: string): DeliveryStep['stepType'] => {
    const mapping: Record<string, DeliveryStep['stepType']> = {
        "INITIAL_REQUEST": "Initial Request",
        "ON_BOARDING": "On boarding",
        "ADD_STOCK": "Add Stock",
        "REMOVE_STOCK": "Remove Stock",
        "BROKEN_PRODUCT": "Broken Product",
        "OFF_LOADING": "Off Loading",
        "FINAL": "Complete Delivery"
    };
    return mapping[deliveryStepName] || deliveryStepName as DeliveryStep['stepType'];
};

export function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(" ");
}