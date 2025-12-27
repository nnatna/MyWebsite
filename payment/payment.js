fetch("../nav/nav.html")
    .then(res => res.text())
    .then(data => {
        document.getElementById('navbar').innerHTML = data;
    });

const STORAGE_KEY = 'checkout_address_data';
const DEFAULT_ADDRESS = {
    name: 'John Doe',
    street: '123 Innovation Blvd',
    city: 'San Francisco',
    state: 'CA',
    zip: '94103',
    phone: '555-0123'
};

document.addEventListener('DOMContentLoaded', () => {
    initAddress();
    initPaymentFormatting();
    setupEventListeners();
    updateTotals();
});

function setupEventListeners() {
    document.getElementById('editAddressBtn').addEventListener('click', openAddressModal);
    document.getElementById('editAddressForm').addEventListener('submit', handleAddressSubmit);
    document.getElementById('paymentForm').addEventListener('submit', handlePaymentSubmit);
    document.querySelectorAll('input[name="delivery"]').forEach(radio => {
        radio.addEventListener('change', updateTotals);
    });
}

function initAddress() {
    const addr = getStoredAddress();
    renderAddress(addr);
}

function getStoredAddress() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : DEFAULT_ADDRESS;
    } catch (e) {
        return DEFAULT_ADDRESS;
    }
}

function renderAddress(addr) {
    const container = document.getElementById('shippingAddressDisplay');
    container.innerHTML = `
                <div class="address-title">${escapeHtml(addr.name)}</div>
                <div class="address-line">${escapeHtml(addr.street)}</div>
                <div class="address-line">${escapeHtml(addr.city)}, ${escapeHtml(addr.zip)}</div>
                <div class="address-line mt-1"><small>Phone: ${escapeHtml(addr.phone)}</small></div>
            `;
}

function openAddressModal() {
    const addr = getStoredAddress();
    document.getElementById('addr_name').value = addr.name;
    document.getElementById('addr_street').value = addr.street;
    document.getElementById('addr_city').value = addr.city;
    document.getElementById('addr_zip').value = addr.zip;
    document.getElementById('addr_phone').value = addr.phone;

    const modal = new bootstrap.Modal(document.getElementById('editAddressModal'));
    modal.show();
}

function handleAddressSubmit(e) {
    e.preventDefault();
    const newAddr = {
        name: document.getElementById('addr_name').value,
        street: document.getElementById('addr_street').value,
        city: document.getElementById('addr_city').value,
        zip: document.getElementById('addr_zip').value,
        phone: document.getElementById('addr_phone').value
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newAddr));
    renderAddress(newAddr);
    bootstrap.Modal.getInstance(document.getElementById('editAddressModal')).hide();
    notify('Address saved successfully');
}

function initPaymentFormatting() {
    const cardInput = document.getElementById('cardNumber');
    const expiryInput = document.getElementById('cardExpiry');

    cardInput.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        let matches = v.match(/\d{4,16}/g);
        let match = matches && matches[0] || '';
        let parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        e.target.value = parts.length ? parts.join(' ') : v;
    });

    expiryInput.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            e.target.value = v.substring(0, 2) + '/' + v.substring(2, 4);
        } else {
            e.target.value = v;
        }
    });
}

function updateTotals() {
    const itemPrice = parseFloat(document.getElementById('itemPriceVal').getAttribute('data-value')) || 0;
    const taxAmount = parseFloat(document.getElementById('taxVal').getAttribute('data-value')) || 0;
    const selectedDelivery = document.querySelector('input[name="delivery"]:checked');
    const shipping = selectedDelivery ? parseFloat(selectedDelivery.value) : 0;

    const total = itemPrice + taxAmount + shipping;

    document.getElementById('subtotalDisplay').textContent = `$${itemPrice.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    document.getElementById('shippingCostText').textContent = shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`;
    document.getElementById('totalPriceText').textContent = `$${total.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
}

function handlePaymentSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('placeOrderBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';

    setTimeout(() => {
        btn.disabled = false;
        btn.textContent = 'Confirm Payment';
        notify('Success! Your order has been placed.', 'success');
    }, 2000);
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function notify(message, type = 'dark') {
    const toast = document.createElement('div');
    toast.className = `alert alert-${type} alert-temp shadow-lg border-0 text-white bg-dark`;
    toast.style.borderRadius = '8px';
    toast.innerHTML = `<div class="d-flex align-items-center"><div class="me-2">✓</div>${message}</div>`;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.transition = 'opacity 0.5s ease';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

window._paymentHelpers = { loadAddress, renderAddress };