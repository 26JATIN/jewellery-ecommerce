'use client';
import { motion } from 'framer-motion';
import { 
    CheckCircle2, 
    Package, 
    Truck, 
    Building2,
    Clock,
    MapPin,
    XCircle
} from 'lucide-react';

const returnSteps = [
    {
        key: 'requested',
        label: 'Return Requested',
        icon: Clock,
        description: 'Your return request has been received'
    },
    {
        key: 'pickup_scheduled',
        label: 'Pickup Scheduled',
        icon: Package,
        description: 'Courier will pickup from your address'
    },
    {
        key: 'in_transit',
        label: 'In Transit',
        icon: Truck,
        description: 'Your return is on the way to our warehouse'
    },
    {
        key: 'returned_to_seller',
        label: 'Received at Warehouse',
        icon: Building2,
        description: 'Return received, processing refund'
    },
    {
        key: 'completed',
        label: 'Refund Completed',
        icon: CheckCircle2,
        description: 'Refund processed successfully'
    }
];

export default function ReturnTracker({ returnData }) {
    const isCancelled = returnData.status === 'cancelled';
    const currentStepIndex = returnSteps.findIndex(step => step.key === returnData.status);
    
    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900">Return Progress</h3>
                    {isCancelled && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-lg">
                            <XCircle className="w-5 h-5 text-red-600" />
                            <span className="text-sm font-semibold text-red-600">Cancelled</span>
                        </div>
                    )}
                </div>
                <p className="text-sm text-gray-600">Return Number: {returnData.returnNumber}</p>
            </div>

            {/* Cancelled Message */}
            {isCancelled ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                        <XCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Return Cancelled</h4>
                    <p className="text-sm text-gray-600 mb-4">
                        This return has been cancelled by the courier service or admin.
                    </p>
                    {returnData.notes && (
                        <div className="bg-white rounded-lg p-4 mt-4">
                            <p className="text-xs text-gray-500 mb-1">Cancellation Note:</p>
                            <p className="text-sm text-gray-800">{returnData.notes}</p>
                        </div>
                    )}
                </div>
            ) : (
                <>
                    {/* Progress Steps */}
                    <div className="relative">
                        {returnSteps.map((step, index) => {
                            const StepIcon = step.icon;
                            const isCompleted = index < currentStepIndex;
                            const isCurrent = index === currentStepIndex;
                            const isFuture = index > currentStepIndex;

                            return (
                                <div key={step.key} className="relative pb-8 last:pb-0">
                                    {/* Connector Line */}
                                    {index !== returnSteps.length - 1 && (
                                        <div className="absolute left-5 top-10 w-0.5 h-full -ml-px">
                                            <div className={`h-full ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
                                        </div>
                                    )}

                                    {/* Step Content */}
                                    <div className="relative flex items-start group">
                                        {/* Icon Circle */}
                                        <motion.div
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: index * 0.1 }}
                                            className={`
                                                flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                                                ${isCompleted ? 'bg-green-500 text-white' : 
                                                  isCurrent ? 'bg-amber-500 text-white ring-4 ring-amber-100' : 
                                                  'bg-gray-200 text-gray-400'}
                                                transition-all duration-300
                                            `}
                                        >
                                            {isCompleted ? (
                                                <CheckCircle2 className="w-5 h-5" />
                                            ) : (
                                                <StepIcon className="w-5 h-5" />
                                            )}
                                        </motion.div>

                                        {/* Step Info */}
                                        <motion.div
                                            initial={{ x: -10, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: index * 0.1 + 0.1 }}
                                            className="ml-4 flex-1"
                                        >
                                            <h4 className={`
                                                font-semibold
                                                ${isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'}
                                            `}>
                                                {step.label}
                                            </h4>
                                            <p className={`
                                                text-sm mt-1
                                                ${isCompleted || isCurrent ? 'text-gray-600' : 'text-gray-400'}
                                            `}>
                                                {step.description}
                                            </p>

                                            {/* Show timestamp if completed */}
                                            {isCompleted && returnData.updatedAt && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {new Date(returnData.updatedAt).toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            )}
                                        </motion.div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Shipping Details */}
                    {(returnData.shiprocketReturnAwb || returnData.courierName) && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 pt-6 border-t border-gray-200"
                        >
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Truck className="w-5 h-5 text-amber-600" />
                                Shipment Details
                            </h4>
                            <div className="grid md:grid-cols-2 gap-4">
                                {returnData.shiprocketReturnAwb && (
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <p className="text-xs text-gray-600 mb-1">AWB Tracking Number</p>
                                        <p className="font-semibold text-gray-900">{returnData.shiprocketReturnAwb}</p>
                                    </div>
                                )}
                                {returnData.courierName && (
                                    <div className="p-3 bg-indigo-50 rounded-lg">
                                        <p className="text-xs text-gray-600 mb-1">Courier Partner</p>
                                        <p className="font-semibold text-gray-900">{returnData.courierName}</p>
                                    </div>
                                )}
                                {returnData.estimatedPickupDate && (
                                    <div className="p-3 bg-amber-50 rounded-lg">
                                        <p className="text-xs text-gray-600 mb-1">Estimated Pickup</p>
                                        <p className="font-semibold text-gray-900">{returnData.estimatedPickupDate}</p>
                                    </div>
                                )}
                            </div>

                            {/* Track Shipment Button */}
                            {returnData.trackingUrl && (
                                <a
                                    href={returnData.trackingUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition font-medium"
                                >
                                    <MapPin className="w-4 h-4" />
                                    Track Return Shipment
                                </a>
                            )}
                        </motion.div>
                    )}
                </>
            )}
        </div>
    );
}

