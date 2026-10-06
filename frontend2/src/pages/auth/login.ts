import { authStore } from '../lib/store/authStore';

document.addEventListener('DOMContentLoaded', async () => {
    const form = document.querySelector<HTMLFormElement>('#login-form');
    const emailInput = document.querySelector<HTMLInputElement>('#email');
    const passwordInput = document.querySelector<HTMLInputElement>('#password');
    const rememberInput = document.querySelector<HTMLInputElement>('#remember-me');
    const errorAlert = document.querySelector<HTMLDivElement>('#error-alert');
    const btnSubmit = document.querySelector<HTMLButtonElement>('#btn-submit');
    const btnText = document.querySelector<HTMLSpanElement>('#btn-text');
    const btnSpinner = document.querySelector<HTMLSpanElement>('#btn-spinner');

    // 1. Cek sesi aktif terlebih dahulu saat halaman dimuat
    await authStore.getState().fetchProfile();
    if (authStore.getState().isAuthenticated) {
        window.location.href = '/dashboard.html';
        return;
    }

    // 2. Langganan perubahan state dari Zustand authStore
    authStore.subscribe((state) => {
        // Tampilkan / Sembunyikan Error Alert
        if (errorAlert) {
            if (state.error) {
                errorAlert.textContent = state.error;
                errorAlert.classList.remove('hidden');
            } else {
                errorAlert.classList.add('hidden');
            }
        }

        // Ubah Tampilan Tombol Submit saat Loading
        if (btnSubmit && btnText && btnSpinner) {
            btnSubmit.disabled = state.isLoading;
            if (state.isLoading) {
                btnText.textContent = 'Memproses...';
                btnSpinner.classList.remove('hidden');
            } else {
                btnText.textContent = 'Masuk';
                btnSpinner.classList.add('hidden');
            }
        }
    });

    // 3. Handle Submit Form Login
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        authStore.getState().clearError();

        const email = emailInput?.value.trim() || '';
        const password = passwordInput?.value || '';
        const rememberMe = rememberInput?.checked || false;

        if (!email || !password) return;

        const success = await authStore.getState().login({
            email,
            password,
            rememberMe,
        });

        if (success) {
            // Redirect ke dashboard halaman utama setelah cookie session terbentuk
            window.location.href = '/dashboard.html';
        }
    });
});