// Phase 3: PWA Notifications support
// Note: Notifications work when service worker is registered and permissions are granted

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
}

// Check if notifications are supported
export function isNotificationSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator;
}

// Check notification permission status
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) {
    return 'denied';
  }
  return Notification.permission;
}

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    console.warn('Notifications are not supported in this browser');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

// Show notification
export async function showNotification(payload: NotificationPayload): Promise<void> {
  if (!isNotificationSupported()) {
    console.warn('Notifications are not supported');
    return;
  }

  const permission = await requestNotificationPermission();
  if (permission !== 'granted') {
    console.warn('Notification permission not granted');
    return;
  }

  // Try to use service worker notification (works offline)
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/icon-192x192.png',
      badge: payload.badge || '/icon-72x72.png',
      tag: payload.tag,
      data: payload.data,
      requireInteraction: false,
    });
  } else {
    // Fallback to regular notification
    new Notification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/icon-192x192.png',
      tag: payload.tag,
      data: payload.data,
    });
  }
}

// Schedule notification for payment due date
export async function schedulePaymentDueNotification(
  paymentId: number,
  clientName: string,
  amount: number,
  dueDate: Date
): Promise<void> {
  const now = new Date();
  const timeUntilDue = dueDate.getTime() - now.getTime();
  
  // Notify 24 hours before due date
  const notifyTime = timeUntilDue - (24 * 60 * 60 * 1000);
  
  if (notifyTime > 0) {
    setTimeout(async () => {
      await showNotification({
        title: 'Pagamento a vencer',
        body: `Pagamento de ${clientName} no valor de R$ ${amount.toFixed(2)} vence amanhã`,
        tag: `payment-due-${paymentId}`,
        data: { type: 'payment-due', paymentId },
      });
    }, notifyTime);
  }
}

// Notify about overdue payments
export async function notifyOverduePayments(
  overdueCount: number,
  totalAmount: number
): Promise<void> {
  if (overdueCount === 0) return;

  await showNotification({
    title: 'Pagamentos em atraso',
    body: `Você tem ${overdueCount} pagamento(s) em atraso totalizando R$ ${totalAmount.toFixed(2)}`,
    tag: 'overdue-payments',
    data: { type: 'overdue-payments', count: overdueCount },
  });
}

// Notify about new service order
export async function notifyNewServiceOrder(
  osId: number,
  clientName: string,
  serviceDate: Date
): Promise<void> {
  await showNotification({
    title: 'Nova Ordem de Serviço',
    body: `OS #${osId} criada para ${clientName} em ${serviceDate.toLocaleDateString('pt-BR')}`,
    tag: `new-os-${osId}`,
    data: { type: 'new-os', osId },
  });
}

// Notify about service order status change
export async function notifyOSStatusChange(
  osId: number,
  newStatus: string,
  clientName: string
): Promise<void> {
  const statusText: Record<string, string> = {
    'EmAndamento': 'Em Andamento',
    'Concluido': 'Concluído',
    'Cancelado': 'Cancelado',
  };

  await showNotification({
    title: 'Status da OS alterado',
    body: `OS #${osId} (${clientName}) está agora ${statusText[newStatus] || newStatus}`,
    tag: `os-status-${osId}`,
    data: { type: 'os-status-change', osId, status: newStatus },
  });
}

// Check for upcoming services (next 24 hours)
export async function checkUpcomingServices(
  ordensServico: Array<{ id: number; clienteNome: string; agendamento: { dataHoraInicio: Date } }>
): Promise<void> {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const upcomingServices = ordensServico.filter(os => {
    const serviceDate = new Date(os.agendamento.dataHoraInicio);
    return serviceDate >= now && serviceDate <= tomorrow;
  });

  if (upcomingServices.length > 0) {
    await showNotification({
      title: 'Serviços agendados para amanhã',
      body: `Você tem ${upcomingServices.length} serviço(s) agendado(s) para as próximas 24 horas`,
      tag: 'upcoming-services',
      data: { type: 'upcoming-services', count: upcomingServices.length },
    });
  }
}

// Initialize notification system
export async function initializeNotifications(): Promise<boolean> {
  if (!isNotificationSupported()) {
    console.log('Notifications not supported');
    return false;
  }

  const permission = await requestNotificationPermission();
  if (permission === 'granted') {
    console.log('Notifications enabled');
    return true;
  } else {
    console.log('Notifications permission denied');
    return false;
  }
}

// Check if we can show notifications offline
export function canShowOfflineNotifications(): boolean {
  return isNotificationSupported() && 
         'serviceWorker' in navigator && 
         Notification.permission === 'granted';
}
