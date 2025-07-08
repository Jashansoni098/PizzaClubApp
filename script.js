document.addEventListener('DOMContentLoaded', () => {

    // --- All previous setup code remains the same ---
    const splashScreen = document.getElementById('splash-screen');
    const loadingBar = document.getElementById('loading-bar');
    if (loadingBar) { setTimeout(() => { loadingBar.style.width = '100%'; }, 100); }
    setTimeout(() => { if (splashScreen) { splashScreen.classList.add('fade-out'); splashScreen.addEventListener('transitionend', () => splashScreen.classList.add('hidden')); } }, 3000);

    const menuData = {
        "Pizzas": [ { id: 'p1', category: 'Simply Veg', name: 'Cheese & Single Veg', prices: { Regular: 120, Medium: 199, Large: 299 } }, { id: 'p2', category: 'Simply Veg', name: 'Single Cheese Margherita', prices: { Regular: 160, Medium: 270, Large: 399 } }, { id: 'p3', category: 'Veg Treat', name: 'Country Feast', description: 'Onion, Capsicum & Fresh Tamato', prices: { Regular: 160, Medium: 270, Large: 399 } }, { id: 'p4', category: 'Veg Treat', name: 'Farm Fresh', description: 'Onion, Capsicum, Fresh Tamato & Mushroom', prices: { Regular: 160, Medium: 270, Large: 399 } }, { id: 'p5', category: 'Spicy Feast', name: 'Hawaiian Delight', description: 'Gold Corn, Panner & Jalapeno', prices: { Regular: 190, Medium: 320, Large: 499 } }, { id: 'p6', category: 'Spicy Feast', name: 'Hot 5 Paper', description: 'Capsicum, Green Chilley, Red Peprika, Panner & Jalapeno', prices: { Regular: 190, Medium: 320, Large: 499 } } ],
        "Sides": [ { id: 's1', name: 'Choco Lava', price: 70 }, { id: 's2', name: 'Makhni Roll', price: 130 }, { id: 's3', name: 'Stuffed Garlic', price: 140 }, { id: 's4', name: 'Red Pasta', price: 130 }, { id: 's5', name: 'French Fry', price: 80 } ],
        "Wraps": [ { id: 'w1', name: 'Maxican Wrap', price: 60 }, { id: 'w2', name: 'Sweet Chilly Wrap', price: 70 }, { id: 'w3', name: 'Spicy Paneer Wrap', price: 80 }, { id: 'w4', name: 'Crazy Cheese Wrap', price: 99 } ]
    };
    
    let cart = [];
    let currentCategory = 'All';
    const PER_KM_CHARGE = 20.00;

    const mainAppContent = document.getElementById('main-app-content');
    const checkoutPage = document.getElementById('checkout-page');
    const menuGrid = document.getElementById('menu-grid');
    const categoryTabsContainer = document.getElementById('category-tabs');
    const cartIcon = document.getElementById('cart-icon');
    const cartModal = document.getElementById('cart-modal');
    const closeModalBtn = document.querySelector('.close-btn');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartCountEl = document.getElementById('cart-count');
    const cartTotalEl = document.getElementById('cart-total');
    const proceedToCheckoutBtn = document.getElementById('proceed-to-checkout-btn');
    const backToMenuBtn = document.getElementById('back-to-menu-btn');
    const confirmOrderBtn = document.getElementById('confirm-order-btn');
    const successModal = document.getElementById('success-modal');
    const backToHomeBtn = document.getElementById('back-to-home-btn');
    const custDistanceInput = document.getElementById('cust-distance');

    // --- UPDATED: renderMenu is now much smarter ---
    const renderMenu = () => {
        menuGrid.innerHTML = '';
        const allItems = [].concat(...Object.values(menuData));
        const itemsToRender = currentCategory === 'All'
            ? allItems
            : menuData[currentCategory] || [];

        itemsToRender.forEach(item => {
            const card = document.createElement('div');
            card.className = 'menu-card';
            let actionsHTML = '';

            if (item.prices) { // It's a Pizza
                let sizeButtonsHTML = '';
                for (const size in item.prices) {
                    const cartId = `${item.id}_${size}`;
                    const itemInCart = cart.find(ci => ci.cartId === cartId);

                    if (itemInCart) {
                        sizeButtonsHTML += `
                            <div class="quantity-controller">
                                <button class="quantity-control-btn" data-id="${item.id}" data-size="${size}" data-action="decrease">-</button>
                                <span class="quantity-display">${itemInCart.quantity}</span>
                                <button class="quantity-control-btn" data-id="${item.id}" data-size="${size}" data-action="increase">+</button>
                            </div>`;
                    } else {
                        sizeButtonsHTML += `<button class="size-btn" data-id="${item.id}" data-size="${size}">Reg: ₹${item.prices[size]}</button>`;
                    }
                }
                actionsHTML = `<div class="pizza-actions"><h5>Select Size</h5><div class="size-buttons">${sizeButtonsHTML}</div></div>`;
            } else { // It's a Side or Wrap
                const itemInCart = cart.find(ci => ci.id === item.id);
                if (itemInCart) {
                    actionsHTML = `
                        <div class="single-item-actions">
                            <span class="item-price">₹${item.price}</span>
                            <div class="quantity-controller">
                                <button class="quantity-control-btn" data-id="${item.id}" data-action="decrease">-</button>
                                <span class="quantity-display">${itemInCart.quantity}</span>
                                <button class="quantity-control-btn" data-id="${item.id}" data-action="increase">+</button>
                            </div>
                        </div>`;
                } else {
                    actionsHTML = `
                        <div class="single-item-actions">
                            <span class="item-price">₹${item.price}</span>
                            <button class="add-btn" data-id="${item.id}">Add</button>
                        </div>`;
                }
            }

            card.innerHTML = `<div class="card-body"><h4>${item.name}</h4>${item.description ? `<p>${item.description}</p>` : ''}</div>${actionsHTML}`;
            menuGrid.appendChild(card);
        });
    };
    
    // --- UPDATED: addToCart and updateQuantity now re-render the menu ---
    const addToCart = (itemId, size = null) => {
        const itemData = [].concat(...Object.values(menuData)).find(item => item.id === itemId);
        if (!itemData) return;
        const cartId = size ? `${itemId}_${size}` : itemId;
        const existingItem = cart.find(item => item.cartId === cartId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ cartId, id: itemId, name: itemData.name, price: size ? itemData.prices[size] : itemData.price, size, quantity: 1 });
        }
        renderCart();
        renderMenu(); // Re-render menu to show quantity controller
    };

    const updateQuantity = (cartId, action) => {
        const itemIndex = cart.findIndex(item => item.cartId === cartId);
        if (itemIndex === -1) return;
        if (action === 'increase') {
            cart[itemIndex].quantity++;
        } else if (action === 'decrease') {
            cart[itemIndex].quantity--;
            if (cart[itemIndex].quantity <= 0) {
                cart.splice(itemIndex, 1);
            }
        }
        renderCart();
        renderMenu(); // Re-render menu to update quantity or show 'Add' button
    };
    
    // --- UPDATED: Menu Grid Event Listener is smarter now ---
    menuGrid.addEventListener('click', e => {
        const button = e.target;
        const { id, size, action } = button.dataset;

        if (button.matches('.add-btn, .size-btn')) {
            addToCart(id, size);
        } else if (button.matches('.quantity-control-btn')) {
            const cartId = size ? `${id}_${size}` : id;
            updateQuantity(cartId, action);
        }
    });

    // --- All other functions and listeners remain the same ---
    const calculateDeliveryFee = (distance, subtotal) => { if (!distance || distance <= 0) return 40.00; if (distance <= 3 && subtotal >= 300) return 0; if (distance <= 3) return 40.00; const extraDistance = distance - 3; return 40.00 + (Math.ceil(extraDistance) * PER_KM_CHARGE); };
    const renderOrderSummary = () => { const summaryList = document.getElementById('summary-items-list'); const subtotalEl = document.getElementById('summary-subtotal'); const deliveryEl = document.getElementById('summary-delivery'); const grandTotalEl = document.getElementById('summary-grand-total'); summaryList.innerHTML = ''; const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0); cart.forEach(item => { summaryList.innerHTML += `<div class="summary-item"><span>${item.name} ${item.size ? `(${item.size})` : ''} x ${item.quantity}</span><span>₹${(item.price * item.quantity).toFixed(2)}</span></div>`; }); const distance = parseFloat(custDistanceInput.value) || 0; const deliveryFee = calculateDeliveryFee(distance, subtotal); subtotalEl.textContent = `₹${subtotal.toFixed(2)}`; deliveryEl.textContent = deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`; grandTotalEl.textContent = `₹${(subtotal + deliveryFee).toFixed(2)}`; };
    const renderTabs = () => { const categories = ['All', ...Object.keys(menuData)]; categoryTabsContainer.innerHTML = categories.map(cat => `<button class="tab ${cat === currentCategory ? 'active' : ''}" data-category="${cat}">${cat}</button>`).join(''); };
    const renderCart = () => { cartItemsContainer.innerHTML = ''; if (cart.length === 0) { cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Your cart is empty.</p>'; proceedToCheckoutBtn.disabled = true; proceedToCheckoutBtn.style.opacity = '0.5'; } else { proceedToCheckoutBtn.disabled = false; proceedToCheckoutBtn.style.opacity = '1'; cart.forEach(item => { const itemDiv = document.createElement('div'); itemDiv.className = 'cart-item'; itemDiv.innerHTML = `<div class="cart-item-info"><h5>${item.name} ${item.size ? `(${item.size})` : ''}</h5><p>₹${item.price.toFixed(2)} each</p></div><div class="cart-item-controls"><div class="quantity-box"><button class="quantity-btn" data-id="${item.cartId}" data-action="decrease">-</button><span class="item-quantity">${item.quantity}</span><button class="quantity-btn" data-id="${item.cartId}" data-action="increase">+</button></div><span class="item-total-price">₹${(item.price * item.quantity).toFixed(2)}</span></div>`; cartItemsContainer.appendChild(itemDiv); }); } const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0); const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0); cartTotalEl.textContent = `₹${total.toFixed(2)}`; cartCountEl.textContent = totalItems; cartCountEl.style.display = totalItems > 0 ? 'flex' : 'none'; };
    const showModal = (modal) => modal.classList.add('is-visible');
    const hideModal = (modal) => modal.classList.remove('is-visible');
    cartIcon.addEventListener('click', () => { renderCart(); showModal(cartModal); });
    closeModalBtn.addEventListener('click', () => hideModal(cartModal));
    proceedToCheckoutBtn.addEventListener('click', () => { hideModal(cartModal); mainAppContent.classList.add('is-exiting'); checkoutPage.classList.remove('off-screen'); renderOrderSummary(); });
    backToMenuBtn.addEventListener('click', () => { mainAppContent.classList.remove('is-exiting'); checkoutPage.classList.add('off-screen'); });
    confirmOrderBtn.addEventListener('click', () => { const name = document.getElementById('cust-name').value; const phone = document.getElementById('cust-phone').value; const address = document.getElementById('cust-address').value; if (!name || !phone || !address) { alert('Please fill in all delivery details.'); return; } showModal(successModal); });
    backToHomeBtn.addEventListener('click', () => { hideModal(successModal); backToMenuBtn.click(); cart = []; renderCart(); renderMenu(); document.getElementById('delivery-form').reset(); });
    categoryTabsContainer.addEventListener('click', e => { if (e.target.classList.contains('tab')) { currentCategory = e.target.dataset.category; renderTabs(); renderMenu(); } });
    cartItemsContainer.addEventListener('click', e => { if(e.target.classList.contains('quantity-btn')) { const cartId = e.target.dataset.id; const action = e.target.dataset.action; updateQuantity(cartId, action); } });
    custDistanceInput.addEventListener('input', renderOrderSummary);
    window.addEventListener('click', e => { if (e.target.classList.contains('modal')) { hideModal(e.target); } });

    // Initial Render
    renderTabs();
    renderMenu();
    renderCart();

});