// Return status configuration and helper functions
export const StatusConfig = {
    requested: { 
        label: 'Requested', 
        icon: '📝', 
        color: 'blue',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-200'
    },
    pending_approval: { 
        label: 'Pending Approval', 
        icon: '⏳', 
        color: 'yellow',
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-700',
        borderColor: 'border-yellow-200'
    },
    approved: { 
        label: 'Approved', 
        icon: '✅', 
        color: 'green',
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        borderColor: 'border-green-200'
    },
    rejected: { 
        label: 'Rejected', 
        icon: '❌', 
        color: 'red',
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        borderColor: 'border-red-200'
    },
    pickup_scheduled: { 
        label: 'Pickup Scheduled', 
        icon: '📅', 
        color: 'blue',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-200'
    },
    picked_up: { 
        label: 'Picked Up', 
        icon: '📦', 
        color: 'blue',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-200'
    },
    in_transit: { 
        label: 'In Transit', 
        icon: '🚛', 
        color: 'blue',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-200'
    },
    received: { 
        label: 'Received', 
        icon: '🏢', 
        color: 'blue',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-200'
    },
    inspected: { 
        label: 'Inspected', 
        icon: '🔍', 
        color: 'blue',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-200'
    },
    approved_refund: { 
        label: 'Refund Approved', 
        icon: '💰', 
        color: 'green',
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        borderColor: 'border-green-200'
    },
    rejected_refund: { 
        label: 'Refund Rejected', 
        icon: '❌', 
        color: 'red',
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        borderColor: 'border-red-200'
    },
    refund_processed: { 
        label: 'Refund Processed', 
        icon: '✅', 
        color: 'green',
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        borderColor: 'border-green-200'
    },
    completed: { 
        label: 'Completed', 
        icon: '🎉', 
        color: 'green',
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        borderColor: 'border-green-200'
    },
    cancelled: { 
        label: 'Cancelled', 
        icon: '❌', 
        color: 'red',
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        borderColor: 'border-red-200'
    }
};

export const getNextActions = (status) => {
    const actions = [];
    
    switch (status) {
        case 'requested':
        case 'pending_approval':
            actions.push(
                { label: 'Approve', status: 'approved', color: 'green' },
                { label: 'Reject', status: 'rejected', color: 'red' }
            );
            break;
        case 'approved':
            actions.push(
                { label: 'Schedule Pickup', action: 'pickup', color: 'blue' }
            );
            break;
        case 'received':
            actions.push(
                { label: 'Mark Inspected', status: 'inspected', color: 'blue' }
            );
            break;
        case 'inspected':
            actions.push(
                { label: 'Approve Refund', status: 'approved_refund', color: 'green' },
                { label: 'Reject Refund', status: 'rejected_refund', color: 'red' }
            );
            break;
        case 'approved_refund':
            actions.push(
                { label: 'Process Refund', status: 'refund_processed', color: 'green' }
            );
            break;
        case 'refund_processed':
            actions.push(
                { label: 'Complete Return', status: 'completed', color: 'green' }
            );
            break;
    }
    
    return actions;
};

export const formatReturnStatus = (status) => {
    return StatusConfig[status]?.label || status?.replace('_', ' ') || 'Unknown';
};

export const getStatusColor = (status) => {
    const config = StatusConfig[status];
    return config ? `${config.bgColor} ${config.textColor} ${config.borderColor}` : 'bg-gray-50 text-gray-700 border-gray-200';
};