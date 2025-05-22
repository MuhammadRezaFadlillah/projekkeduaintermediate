import { convertBase64ToUint8Array } from "./index";
import CONFIG from '../../config';
import { subscribePushNotification, unsubscribePushNotification } from "../data/api";
import Swal from "sweetalert2";

export function isNotificationAvailable() {
    return 'Notification' in window;
}

export function isNotificationGranted() {
    return Notification.permission === 'granted';
}

export async function requestNotificationPermission() {
    if (!isNotificationAvailable()) {
        console.error('Notification API tidak didukung di browser ini.');
        return false;
    }

    if (isNotificationGranted()) {
        return true;
    }

    const status = await Notification.requestPermission();

    if (status === 'denied') {
        await Swal.fire({
            icon: 'error',
            title: 'Izin Notifikasi ditolak.',
            confirmButtonText: 'Oke',
        });
        return false;
    }

    if (status === 'default') {
        await Swal.fire({
            icon: 'error',
            title: 'Izin Notifikasi ditutup atau diabaikan.',
            confirmButtonText: 'Oke',
        });
        return false;
    }

    return true;
}

export async function getPushSubscription() {
    const registration = await navigator.serviceWorker.getRegistration();
    
    if (!registration) {
        console.warn('Service Worker belum terdaftar atau tidak aktif.');
        return null;
    }

    if (!registration.pushManager) {
        console.warn('pushManager tidak tersedia di Service Worker.');
        return null;
    }

    return await registration.pushManager.getSubscription();
}

export async function isCurrentPushSubscriptionAvailable() {
    return !!(await getPushSubscription());
}

export function generateSubscribeOptions() {
    return {
        userVisibleOnly: true,
        applicationServerKey: convertBase64ToUint8Array(CONFIG.VAPID_PUBLIC_KEY),
    };
}

export async function subscribe() {
    if (!(await requestNotificationPermission())) {
        return;
    }

    if (await isCurrentPushSubscriptionAvailable()) {
        await Swal.fire({
            icon: 'info',
            title: 'Sudah berlangganan push notification.',
            confirmButtonText: 'Oke',
        });
        return;
    }

    console.log('Mulai berlangganan push notification...');

    const failureSubscribeMessage = 'Langganan push notification gagal diaktifkan.';
    const successSubscribeMessage = 'Langganan push notification berhasil diaktifkan.';

    let pushSubscription;

    try {
        const registration = await navigator.serviceWorker.getRegistration();

        if (!registration || !registration.pushManager) {
            console.error('Service Worker belum siap atau pushManager tidak tersedia.');
            await Swal.fire({
                icon: 'error',
                title: failureSubscribeMessage,
                confirmButtonText: 'Oke',
            });
            return;
        }

        pushSubscription = await registration.pushManager.subscribe(generateSubscribeOptions());

        const { endpoint, keys } = pushSubscription.toJSON();
        console.log({ endpoint, keys });

        const response = await subscribePushNotification({ endpoint, keys });

        if (!response.ok) {
            console.error('subscribe response:', response);
            await Swal.fire({
                icon: 'error',
                title: failureSubscribeMessage,
                confirmButtonText: 'Oke',
            });
            await pushSubscription.unsubscribe();
            return;
        }

        await Swal.fire({
            icon: 'success',
            title: successSubscribeMessage,
            confirmButtonText: 'Oke',
        });
    } catch (error) {
        console.error('subscribe error:', error);
        await Swal.fire({
            icon: 'error',
            title: failureSubscribeMessage,
            confirmButtonText: 'Oke',
        });

        if (pushSubscription) {
            await pushSubscription.unsubscribe();
        }
    }
}

export async function unsubscribe() {
    const failureUnsubscribeMessage = 'Langganan push notification gagal dinonaktifkan.';
    const successUnsubscribeMessage = 'Langganan push notification berhasil dinonaktifkan.';

    try {
        const pushSubscription = await getPushSubscription();

        if (!pushSubscription) {
            await Swal.fire({
                icon: 'info',
                title: 'Belum berlangganan push notification.',
                confirmButtonText: 'Oke',
            });
            return;
        }

        const { endpoint, keys } = pushSubscription.toJSON();
        const response = await unsubscribePushNotification({ endpoint });

        if (!response.ok) {
            console.error('unsubscribe: response:', response);
            await Swal.fire({
                icon: 'error',
                title: failureUnsubscribeMessage,
                confirmButtonText: 'Oke',
            });
            return;
        }

        const unsubscribed = await pushSubscription.unsubscribe();
        if (!unsubscribed) {
            await Swal.fire({
                icon: 'error',
                title: failureUnsubscribeMessage,
                confirmButtonText: 'Oke',
            });
            await subscribePushNotification({ endpoint, keys });
            return;
        }

        await Swal.fire({
            icon: 'success',
            title: successUnsubscribeMessage,
            confirmButtonText: 'Oke',
        });
    } catch (error) {
        console.error('unsubscribe: error:', error);
        await Swal.fire({
            icon: 'error',
            title: failureUnsubscribeMessage,
            confirmButtonText: 'Oke',
        });
    }
}

