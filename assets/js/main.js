// === CART FUNCTIONALITY ===
let cart = [];

// DOM Elements
let cartBtn, cartSidebar, cartOverlay, closeCart, cartItems, cartCount, cartTotal, checkoutBtn;

// Open Cart
function openCart() {
    cartSidebar.classList.add('active');
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close Cart
function closeCartSidebar() {
    cartSidebar.classList.remove('active');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Update Cart Display
function updateCart() {
    // Update count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    // Update total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `€${total.toFixed(2)}`;

    // Update cart items display
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Il carrello è vuoto</p>';
        return;
    }

    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">€${item.price.toFixed(2)}</div>
                <div class="cart-item-quantity">
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
            </div>
            <button class="remove-item" onclick="removeFromCart(${item.id})">&times;</button>
        </div>
    `).join('');
}

// Add to Cart
function addToCart(id, name, price) {
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: id,
            name: name,
            price: price,
            quantity: 1
        });
    }

    updateCart();
    openCart();
}

// Remove from Cart
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCart();
}

// Update Quantity
function updateQuantity(id, change) {
    const item = cart.find(item => item.id === id);

    if (item) {
        item.quantity += change;

        if (item.quantity <= 0) {
            removeFromCart(id);
        } else {
            updateCart();
        }
    }
}

// Checkout
function checkout() {
    if (cart.length === 0) {
        alert('Il carrello è vuoto!');
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemsList = cart.map(item => `${item.name} (x${item.quantity})`).join(', ');

    alert(`Seleziona un metodo di pagamento:\n- Stripe (Carta di credito)\n- PayPal\n\nProdotti: ${itemsList}\nTotale: €${total.toFixed(2)}`);
}

// Stripe Checkout
function handleStripePayment() {
    if (cart.length === 0) {
        alert('Il carrello è vuoto!');
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Initialize Stripe (you'll need to replace with your actual publishable key)
    const stripe = Stripe('pk_test_YOUR_STRIPE_PUBLISHABLE_KEY');

    // For now, show info message
    alert(`Pagamento Stripe\n\nTotale: €${total.toFixed(2)}\n\nPer attivare i pagamenti Stripe:\n1. Crea un account su stripe.com\n2. Ottieni le API keys\n3. Sostituisci 'pk_test_YOUR_STRIPE_PUBLISHABLE_KEY' con la tua chiave\n4. Configura il backend per creare sessioni di checkout`);

    // Example: Redirect to Stripe Checkout
    // stripe.redirectToCheckout({
    //     lineItems: cart.map(item => ({
    //         price: item.priceId, // You'll need to create prices in Stripe
    //         quantity: item.quantity
    //     })),
    //     mode: 'payment',
    //     successUrl: window.location.origin + '/success.html',
    //     cancelUrl: window.location.origin + '/shop.html',
    // });
}

// PayPal Checkout
function handlePayPalPayment() {
    if (cart.length === 0) {
        alert('Il carrello è vuoto!');
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // For now, show info message
    alert(`Pagamento PayPal\n\nTotale: €${total.toFixed(2)}\n\nPer attivare PayPal:\n1. Crea un account Business su paypal.com\n2. Ottieni il Client ID\n3. Sostituisci 'YOUR_PAYPAL_CLIENT_ID' nell'HTML\n4. Il pulsante PayPal si attiverà automaticamente`);

    // PayPal SDK will be initialized from the script tag
    // The actual PayPal button should be rendered here
}

// Initialize DOM Elements and Event Listeners
function initializeCart() {
    // Get DOM elements
    cartBtn = document.getElementById('cartBtn');
    cartSidebar = document.getElementById('cartSidebar');
    cartOverlay = document.getElementById('cartOverlay');
    closeCart = document.getElementById('closeCart');
    cartItems = document.getElementById('cartItems');
    cartCount = document.getElementById('cartCount');
    cartTotal = document.getElementById('cartTotal');
    checkoutBtn = document.getElementById('checkoutBtn');

    // Event Listeners
    if (cartBtn) cartBtn.addEventListener('click', openCart);
    if (closeCart) closeCart.addEventListener('click', closeCartSidebar);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCartSidebar);
    if (checkoutBtn) checkoutBtn.addEventListener('click', checkout);

    // Payment buttons
    const stripeBtn = document.getElementById('stripeBtn');
    const paypalBtn = document.getElementById('paypalBtn');

    if (stripeBtn) {
        stripeBtn.addEventListener('click', handleStripePayment);
    }

    if (paypalBtn) {
        paypalBtn.addEventListener('click', handlePayPalPayment);
    }

    // Add to cart buttons
    const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
    console.log('Found add-to-cart buttons:', addToCartBtns.length);

    if (addToCartBtns.length === 0) {
        console.warn('WARNING: No add-to-cart buttons found!');
    }

    addToCartBtns.forEach((btn, index) => {
        console.log(`Attaching listener to button ${index + 1}:`, btn);

        btn.addEventListener('click', function(e) {
            console.log('Button clicked!', this);
            e.stopPropagation(); // Prevent event bubbling

            const id = parseInt(this.getAttribute('data-id'));
            const name = this.getAttribute('data-name');
            const price = parseFloat(this.getAttribute('data-price'));

            console.log('Adding to cart:', {id, name, price});
            addToCart(id, name, price);

            // Show animation feedback
            const originalText = this.textContent;
            const feedbackText = originalText.includes('Add') ? 'Added!' : 'Aggiunto!';
            this.textContent = feedbackText;
            this.style.background = '#27AE60';

            setTimeout(() => {
                this.textContent = originalText;
                this.style.background = '';
            }, 1000);
        });
    });

    // Initialize cart display
    updateCart();
}

// === PRODUCT FILTERS ===
function initializeFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));

            // Add active class to clicked button
            this.classList.add('active');

            const filter = this.getAttribute('data-filter');

            // Filter products
            productCards.forEach(card => {
                if (filter === 'tutti' || card.getAttribute('data-category') === filter) {
                    card.classList.remove('hidden');
                    card.style.animation = 'fadeIn 0.5s ease';
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });

    // Scroll animations for product cards
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe product cards
    productCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(card);
    });
}

// === SMOOTH SCROLLING ===
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));

            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// === CONTACT FORM ===
function initializeForms() {
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(this);

            alert('Grazie per il tuo messaggio! Ti risponderò al più presto.');

            this.reset();
        });
    }

    // === NEWSLETTER FORM ===
    const newsletterForm = document.getElementById('newsletterForm');

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const email = this.querySelector('input[type="email"]').value;

            // Here you would normally send to your email service (Mailchimp, SendGrid, etc.)
            alert(`Grazie per l'iscrizione!\n\nRiceverai presto contenuti esclusivi e il tuo codice sconto del 10% all'indirizzo:\n${email}\n\nControlla la tua casella email!`);

            this.reset();
        });
    }
}

// === HEADER SCROLL EFFECT ===
function initializeHeaderScroll() {
    let lastScroll = 0;
    const header = document.querySelector('.header');

    if (header) {
        window.addEventListener('scroll', function() {
            const currentScroll = window.pageYOffset;

            if (currentScroll > lastScroll && currentScroll > 100) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }

            lastScroll = currentScroll;
        });
    }
}

// === INITIALIZE ALL ===
document.addEventListener('DOMContentLoaded', function() {
    console.log('===== DOMContentLoaded event fired =====');

    console.log('Initializing cart...');
    initializeCart();

    console.log('Initializing filters...');
    initializeFilters();

    console.log('Initializing smooth scrolling...');
    initializeSmoothScrolling();

    console.log('Initializing forms...');
    initializeForms();

    console.log('Initializing header scroll...');
    initializeHeaderScroll();

    console.log('===== My Mindful Mandala - E-commerce ready! =====');
});
