fetch("../nav/nav.html")
    .then(res => res.text())
    .then(data => {
        document.getElementById('navbar').innerHTML = data;
    });

function increment(btn) {
    const input = btn.parentElement.querySelector('input');
    input.value = parseInt(input.value) + 1;
    updateSidebarIfChecked(btn);
}

function decrement(btn) {
    const input = btn.parentElement.querySelector('input');
    if (parseInt(input.value) > 1) {
        input.value = parseInt(input.value) - 1;
        updateSidebarIfChecked(btn);
    }
}

function updateSidebarIfChecked(el) {
    const itemPro = el.closest('.item-pro');
    const checkbox = itemPro.querySelector('.item-checkbox');
    if (checkbox.checked) {
        updateOrder(checkbox);
    }
}

function updateOrder(checkbox) {
    const displayArea = document.getElementById('order-display-area');
    const itemId = "order-item-" + checkbox.id;
    const itemContainer = checkbox.closest('.item-pro');

    const imgSrc = itemContainer.querySelector('.img-card').src;
    const productName = itemContainer.querySelector('.card-title').innerText;
    const priceText = itemContainer.querySelector('.price').innerText;
    const priceValue = parseFloat(priceText.replace('$', ''));
    const quantity = parseInt(itemContainer.querySelector('.quantity-grp input').value);
    const emptyMsg = document.getElementById('empty-msg');

    const itemTotal = priceValue * quantity;

    if (checkbox.checked) {
        if (emptyMsg) emptyMsg.style.display = 'none';

        let existingItem = document.getElementById(itemId);
        if (existingItem) existingItem.remove();

        const itemWrapper = document.createElement('div');
        itemWrapper.id = itemId;
        itemWrapper.className = "sidebar-item p-3 d-flex align-items-center gap-3";

        itemWrapper.innerHTML = `
                    <img src="${imgSrc}" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover; border: 1px solid #eee;">
                    <div style="flex-grow: 1;">
                        <h6 class="mb-1 fw-bold text-truncate" style="max-width: 180px;">${productName}</h6>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="badge bg-light text-secondary border">x${quantity}</span>
                            <span class="item-total-price fw-bold text-danger">$${itemTotal.toFixed(2)}</span>
                        </div>
                    </div>
                `;
        displayArea.appendChild(itemWrapper);
    } else {
        const itemToRemove = document.getElementById(itemId);
        if (itemToRemove) itemToRemove.remove();

        if (displayArea.querySelectorAll('.sidebar-item').length === 0) {
            emptyMsg.style.display = 'block';
        }
    }

    calculateGrandTotal();
}

function calculateGrandTotal() {
    const allPrices = document.querySelectorAll('.item-total-price');
    let grandTotal = 0;
    allPrices.forEach(priceSpan => {
        grandTotal += parseFloat(priceSpan.innerText.replace('$', ''));
    });
    const formattedTotal = grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    document.getElementById('total-price').innerText = formattedTotal;
    document.getElementById('sub-total').innerText = '$' + formattedTotal;
}

function toggleAll(masterCheckbox) {
    const checkboxes = document.querySelectorAll('.item-checkbox');
    checkboxes.forEach(cb => {
        if (cb.checked !== masterCheckbox.checked) {
            cb.checked = masterCheckbox.checked;
            updateOrder(cb);
        }
    });
}

function checkout() {
    const total = document.getElementById('total-price').innerText;
    if (parseFloat(total.replace(/,/g, '')) === 0) {
        showToast("Please select at least one product.");
        return;
    }
    // Redirect to payment page
    window.location.href = "../payment/payment.html";
}

function showToast(msg) {
    const existing = document.querySelector('.custom-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'custom-toast';
    toast.style = "position:fixed; bottom:30px; left:50%; transform:translateX(-50%); background:#222; color:white; padding:16px 32px; border-radius:12px; z-index:9999; box-shadow:0 10px 40px rgba(0,0,0,0.3); font-weight: 500; border-left: 4px solid #FF2D55;";
    toast.innerText = msg;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}
s