import { initRouter } from './router/index';
import './style.css';

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initRouter());
} else {
    initRouter();
}