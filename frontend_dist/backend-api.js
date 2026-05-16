(function () {
    const API_BASE_URL = window.API_BASE_URL || 'https://joshua-marketplace-backend.onrender.com/api';
    const originalSetItem = Storage.prototype.setItem;
    const originalRemoveItem = Storage.prototype.removeItem;

    const parseJson = (text) => {
        try {
            return text ? JSON.parse(text) : {};
        } catch (error) {
            return {};
        }
    };

    const getAuthToken = () => localStorage.getItem('jmpAuthToken');
    const setAuthToken = (token) => {
        originalSetItem.call(localStorage, 'jmpAuthToken', token);
    };

    const clearAuthToken = () => {
        originalRemoveItem.call(localStorage, 'jmpAuthToken');
    };

    const getAuthHeaders = () => {
        const token = getAuthToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const apiFetch = async (path, options = {}) => {
        const url = `${API_BASE_URL}${path}`;
        const fetchOptions = {
            method: options.method || 'GET',
            headers: {
                Accept: 'application/json',
                ...options.headers,
                ...getAuthHeaders()
            }
        };

        if (options.body && !(options.body instanceof FormData)) {
            fetchOptions.headers['Content-Type'] = 'application/json';
            fetchOptions.body = JSON.stringify(options.body);
        }

        if (options.body instanceof FormData) {
            fetchOptions.body = options.body;
        }

        const response = await fetch(url, fetchOptions);
        const text = await response.text();
        const data = parseJson(text);

        if (!response.ok) {
            const message = data.error || data.message || response.statusText || 'API request failed';
            const error = new Error(message);
            error.status = response.status;
            error.body = data;
            throw error;
        }

        return data;
    };

    const setCurrentUserLocal = (user) => {
        originalSetItem.call(localStorage, 'jmpCurrentUser', JSON.stringify(user));
    };

    const clearCurrentUserLocal = () => {
        originalRemoveItem.call(localStorage, 'jmpCurrentUser');
    };

    const registerUser = async (payload) => {
        return apiFetch('/auth/register', {
            method: 'POST',
            body: payload
        });
    };

    const loginUser = async ({ email, password }) => {
        const data = await apiFetch('/auth/login', {
            method: 'POST',
            body: { email, password }
        });
        if (data.token) {
            setAuthToken(data.token);
        }
        if (data.user) {
            setCurrentUserLocal(data.user);
        }
        return data;
    };

    const getProfile = async () => {
        return apiFetch('/auth/me', { method: 'GET' });
    };

    const updateProfile = async (payload) => {
        return apiFetch('/auth/update', {
            method: 'PUT',
            body: payload
        });
    };

    const getProducts = async () => {
        const data = await apiFetch('/products', { method: 'GET' });
        return Array.isArray(data) ? data : data.data || [];
    };

    const createProduct = async (product) => {
        return apiFetch('/products', {
            method: 'POST',
            body: product
        });
    };

    const updateProduct = async (id, product) => {
        return apiFetch(`/products/${id}`, {
            method: 'PUT',
            body: product
        });
    };

    const deleteProduct = async (id) => {
        return apiFetch(`/products/${id}`, {
            method: 'DELETE'
        });
    };

    const getCart = async () => {
        return apiFetch('/cart', { method: 'GET' });
    };

    const addToCart = async ({ productId, quantity = 1 }) => {
        return apiFetch('/cart/add', {
            method: 'POST',
            body: { productId, quantity }
        });
    };

    const updateCart = async ({ itemId, quantity }) => {
        return apiFetch('/cart/update', {
            method: 'PUT',
            body: { itemId, quantity }
        });
    };

    const removeFromCart = async (itemId) => {
        return apiFetch(`/cart/remove/${itemId}`, { method: 'DELETE' });
    };

    const clearCart = async () => {
        return apiFetch('/cart/clear', { method: 'DELETE' });
    };

    const getFavorites = async () => {
        return apiFetch('/favorites', { method: 'GET' });
    };

    const addFavorite = async (productId) => {
        return apiFetch('/favorites/add', {
            method: 'POST',
            body: { productId }
        });
    };

    const removeFavorite = async (productId) => {
        return apiFetch(`/favorites/remove/${productId}`, { method: 'DELETE' });
    };

    const getOrders = async () => {
        return apiFetch('/orders', { method: 'GET' });
    };

    const createOrder = async (order) => {
        return apiFetch('/orders/create', {
            method: 'POST',
            body: order
        });
    };

    const getMessages = async () => {
        return apiFetch('/messages', { method: 'GET' });
    };

    const sendMessage = async ({ recipientEmail, title, content }) => {
        return apiFetch('/messages/send', {
            method: 'POST',
            body: { recipientEmail, title, content }
        });
    };

    const markMessageRead = async (id) => {
        return apiFetch(`/messages/${id}/read`, { method: 'PUT' });
    };

    const submitVerification = async (payload) => {
        return apiFetch('/verification/submit', {
            method: 'POST',
            body: payload
        });
    };

    const getVerificationRequests = async () => {
        return apiFetch('/verification/requests', { method: 'GET' });
    };

    const approveVerification = async (email, status) => {
        return apiFetch('/verification/approve', {
            method: 'PUT',
            body: { email, status }
        });
    };

    const syncBackendData = async () => {
        try {
            const token = getAuthToken();
            if (!token) return;

            const profile = await getProfile();
            setCurrentUserLocal(profile);

            const products = await getProducts();
            originalSetItem.call(localStorage, 'jmpProducts', JSON.stringify(products));

            const cart = await getCart();
            originalSetItem.call(localStorage, `jmpCart_${profile.email}`, JSON.stringify(cart.items || []));

            const favorites = await getFavorites();
            originalSetItem.call(localStorage, `jmpFavorites_${profile.email}`, JSON.stringify(favorites));

            const orders = await getOrders();
            originalSetItem.call(localStorage, 'jmpOrders', JSON.stringify(orders));

            const messages = await getMessages();
            originalSetItem.call(localStorage, 'jmpMessages', JSON.stringify(messages));
        } catch (error) {
            console.warn('Backend sync failed:', error.message);
        }
    };

    window.backendApi = {
        API_BASE_URL,
        registerUser,
        loginUser,
        getProfile,
        updateProfile,
        getProducts,
        createProduct,
        updateProduct,
        deleteProduct,
        getCart,
        addToCart,
        updateCart,
        removeFromCart,
        clearCart,
        getFavorites,
        addFavorite,
        removeFavorite,
        getOrders,
        createOrder,
        getMessages,
        sendMessage,
        markMessageRead,
        submitVerification,
        getVerificationRequests,
        approveVerification,
        syncBackendData
    };

    window.backendSync = {
        syncBackendData,
        clearAuthToken,
        clearCurrentUserLocal,
        setCurrentUserLocal
    };

    document.addEventListener('DOMContentLoaded', () => {
        syncBackendData();
    });
})();
