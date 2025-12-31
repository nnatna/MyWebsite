fetch("../nav/nav.html")
    .then(res => res.text())
    .then(data => {
        document.getElementById('navbar').innerHTML = data;
    });

const STORAGE_KEY = 'checkout_address_data';
const CARDS_KEY = 'saved_payment_cards';
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
    initCardManagement();
    initBankSelector();
    updateTotals();
});

function setupEventListeners() {
    document.getElementById('editAddressBtn').addEventListener('click', openAddressModal);
    document.getElementById('editAddressForm').addEventListener('submit', handleAddressSubmit);
    document.getElementById('paymentForm').addEventListener('submit', handlePaymentSubmit);
    document.querySelectorAll('input[name="delivery"]').forEach(radio => {
        radio.addEventListener('change', updateTotals);
    });
    const addBtn = document.getElementById('addCardBtn');
    if (addBtn) addBtn.addEventListener('click', () => openCardModal('add'));
    const cardForm = document.getElementById('cardForm');
    if (cardForm) cardForm.addEventListener('submit', handleCardFormSubmit);
    const cardsList = document.getElementById('cardsList');
    if (cardsList) {
        cardsList.addEventListener('click', (e) => {
            const item = e.target.closest('.list-group-item');
            if (!item) return;
            const idx = parseInt(item.getAttribute('data-index'));
            if (e.target.matches('.btn-edit')) {
                openCardModal('edit', idx);
            } else if (e.target.matches('.btn-delete')) {
                deleteCard(idx);
            } else {
                selectCard(idx);
            }
        });
    }
    document.querySelectorAll('input[name="paymethod"]').forEach(r => r.addEventListener('change', handlePayMethodChange));
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
    const cardModalInput = document.getElementById('cardNumberModal');
    const expiryModalInput = document.getElementById('cardExpiryModal');

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

    if (cardModalInput) {
        cardModalInput.addEventListener('input', (e) => {
            let v = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
            let matches = v.match(/\d{4,16}/g);
            let match = matches && matches[0] || '';
            let parts = [];
            for (let i = 0, len = match.length; i < len; i += 4) {
                parts.push(match.substring(i, i + 4));
            }
            e.target.value = parts.length ? parts.join(' ') : v;
        });
    }

    if (expiryModalInput) {
        expiryModalInput.addEventListener('input', (e) => {
            let v = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
            if (v.length >= 2) {
                e.target.value = v.substring(0, 2) + '/' + v.substring(2, 4);
            } else {
                e.target.value = v;
            }
        });
    }
}

/* Card management functions */
function initCardManagement() {
    renderCards();
}

function loadCards() {
    try {
        const raw = localStorage.getItem(CARDS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
}

function saveCards(cards) {
    localStorage.setItem(CARDS_KEY, JSON.stringify(cards));
}

function renderCards() {
    const list = document.getElementById('cardsList');
    if (!list) return;
    const cards = loadCards();
    list.innerHTML = '';
    if (!cards.length) {
        list.innerHTML = '<div class="small-muted">No saved cards. Add one to pay faster.</div>';
        return;
    }
    cards.forEach((c, i) => {
        const item = document.createElement('div');
        item.className = 'list-group-item';
        item.setAttribute('data-index', i);
        item.innerHTML = `
            <div class="card-meta">
                <div class="card-nick">${escapeHtml(c.nick || c.name)}</div>
                <div class="card-number-muted">${escapeHtml(maskCard(c.number))} • ${escapeHtml(c.expiry || '')}</div>
            </div>
            <div class="card-actions">
                <button type="button" class="btn btn-sm btn-outline-secondary btn-edit">Edit</button>
                <button type="button" class="btn btn-sm btn-outline-danger btn-delete">Delete</button>
            </div>
        `;
        list.appendChild(item);
    });
}

function maskCard(num) {
    if (!num) return '';
    const digits = num.replace(/\s/g, '');
    return '•••• •••• •••• ' + digits.slice(-4);
}

function openCardModal(mode = 'add', idx = -1) {
    const modalEl = document.getElementById('cardModal');
    const modalTitle = document.getElementById('cardModalTitle');
    const cardIndex = document.getElementById('cardIndex');
    const nick = document.getElementById('cardNick');
    const num = document.getElementById('cardNumberModal');
    const exp = document.getElementById('cardExpiryModal');
    const cvc = document.getElementById('cardCvcModal');

    if (mode === 'edit') {
        const cards = loadCards();
        const card = cards[idx] || {};
        modalTitle.textContent = 'Edit Card';
        cardIndex.value = idx;
        nick.value = card.nick || card.name || '';
        num.value = card.number || '';
        exp.value = card.expiry || '';
        cvc.value = card.cvc || '';
    } else {
        modalTitle.textContent = 'Add Card';
        cardIndex.value = -1;
        nick.value = '';
        num.value = '';
        exp.value = '';
        cvc.value = '';
    }

    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

function handleCardFormSubmit(e) {
    e.preventDefault();
    const idx = parseInt(document.getElementById('cardIndex').value);
    const nick = document.getElementById('cardNick').value.trim();
    const num = document.getElementById('cardNumberModal').value.trim();
    const exp = document.getElementById('cardExpiryModal').value.trim();
    const cvc = document.getElementById('cardCvcModal').value.trim();

    const cards = loadCards();
    const entry = { nick, number: num.replace(/\s/g, ''), expiry: exp, cvc };
    if (idx >= 0 && idx < cards.length) {
        cards[idx] = entry;
    } else {
        cards.push(entry);
    }
    saveCards(cards);
    renderCards();
    bootstrap.Modal.getInstance(document.getElementById('cardModal')).hide();
    notify('Card saved');
}

function deleteCard(idx) {
    if (!confirm('Delete this card?')) return;
    const cards = loadCards();
    if (idx >= 0 && idx < cards.length) {
        cards.splice(idx, 1);
        saveCards(cards);
        renderCards();
        notify('Card deleted');
    }
}

let _selectedCard = -1;

function selectCard(idx) {
    const list = document.getElementById('cardsList');
    if (!list) return;
    const items = list.querySelectorAll('.list-group-item');
    items.forEach(it => it.classList.remove('card-selected'));
    const chosen = list.querySelector(`[data-index="${idx}"]`);
    if (chosen) chosen.classList.add('card-selected');
    _selectedCard = idx;
    // populate card fields with selected card
    const cards = loadCards();
    const c = cards[idx];
    if (c) {
        document.getElementById('cardName').value = c.nick || c.name || '';
        document.getElementById('cardNumber').value = formatCardForInput(c.number || '');
        document.getElementById('cardExpiry').value = c.expiry || '';
        document.getElementById('cardCvc').value = c.cvc || '';
    }
}

function formatCardForInput(num) {
    const v = (num || '').replace(/\s/g, '');
    const parts = [];
    for (let i = 0; i < v.length; i += 4) parts.push(v.substring(i, i + 4));
    return parts.join(' ');
}

function handlePayMethodChange(e) {
    const method = document.querySelector('input[name="paymethod"]:checked').value;
    const bankInfo = document.getElementById('bankInfo');
    const cardFields = document.getElementById('cardFields');
    const cardManager = document.getElementById('cardManager');
    const cardsList = document.getElementById('cardsList');
    const addCardBtn = document.getElementById('addCardBtn');

    if (method === 'bank') {
        if (bankInfo) bankInfo.classList.remove('d-none');
        if (cardFields) cardFields.classList.add('d-none');
        if (cardsList) cardsList.classList.add('d-none');
        if (addCardBtn) addCardBtn.classList.add('d-none');
    } else {
        if (bankInfo) bankInfo.classList.add('d-none');
        if (cardFields) cardFields.classList.remove('d-none');
        if (cardsList) cardsList.classList.remove('d-none');
        if (addCardBtn) addCardBtn.classList.remove('d-none');
    }
}

function initBankSelector() {
    const sel = document.getElementById('bankSelect');
    if (!sel) return;
    const radios = sel.querySelectorAll('input[name="bank"]');
    if (radios.length) {
        radios.forEach(r => r.addEventListener('change', updateBankDetails));
    } else if (sel.tagName === 'SELECT') {
        sel.addEventListener('change', updateBankDetails);
    }
    updateBankDetails();
}

function updateBankDetails() {
    const sel = document.getElementById('bankSelect');
    const details = document.getElementById('bankDetails');
    if (!sel || !details) return;
    let v = '';
    const checkedRadio = sel.querySelector('input[name="bank"]:checked');
    if (checkedRadio) v = checkedRadio.value;
    else if (sel.tagName === 'SELECT') v = sel.value;
    if (v === 'ABA') {
        details.textContent = 'ABA Bank — Account: 987-654-321';
    } else if (v === 'ACLEDA') {
        details.textContent = 'ACLEDA Bank — Account: 012-345-678';
    } else {
        details.textContent = '';
    }
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
    toast.className = `alert alert-${type} alert-temp shadow-lg border-0 text-white  bg-success`;
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