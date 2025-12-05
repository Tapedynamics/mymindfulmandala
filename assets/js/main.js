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
async function handleStripePayment() {
    if (cart.length === 0) {
        alert('Il carrello è vuoto!');
        return;
    }

    // Show loading state
    const stripeBtn = document.getElementById('stripeBtn');
    const originalText = stripeBtn.textContent;
    stripeBtn.textContent = 'Caricamento...';
    stripeBtn.disabled = true;

    try {
        // Call Netlify Function to create checkout session
        const response = await fetch('/.netlify/functions/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                items: cart.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                }))
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to create checkout session');
        }

        // Redirect to Stripe Checkout
        window.location.href = data.url;

    } catch (error) {
        console.error('Stripe checkout error:', error);
        alert('Errore durante il pagamento. Riprova o contattaci via email.');

        // Restore button state
        stripeBtn.textContent = originalText;
        stripeBtn.disabled = false;
    }
}

// PayPal Checkout
function handlePayPalPayment() {
    if (cart.length === 0) {
        alert('Il carrello è vuoto!');
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemsList = cart.map(item => `${item.name} (x${item.quantity})`).join('\n');

    // Check if PayPal SDK is loaded
    if (typeof paypal === 'undefined') {
        alert('Errore: SDK PayPal non caricato. Ricarica la pagina.');
        return;
    }

    // Create PayPal modal container
    const modalHTML = `
        <div id="paypalModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 10000; display: flex; align-items: flex-start; justify-content: center; overflow-y: auto; padding: 20px 0;">
            <div style="background: white; padding: 30px; border-radius: 10px; max-width: 500px; width: 90%; margin: auto; max-height: calc(100vh - 40px); overflow-y: auto;">
                <h3 style="margin-top: 0; color: #2C2C2C;">Completa il pagamento</h3>
                <p style="color: #5A5A5A; margin-bottom: 20px;">Totale: €${total.toFixed(2)}</p>
                <div id="paypal-button-container"></div>
                <button onclick="closePayPalModal()" style="margin-top: 15px; width: 100%; padding: 12px; background: #ddd; border: none; border-radius: 5px; cursor: pointer;">Annulla</button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Render PayPal button
    paypal.Buttons({
        createOrder: function(data, actions) {
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: total.toFixed(2),
                        currency_code: 'EUR'
                    },
                    description: itemsList
                }]
            });
        },
        onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
                alert('Pagamento completato con successo!\n\nGrazie per il tuo acquisto ' + details.payer.name.given_name + '!');
                cart = [];
                updateCart();
                closePayPalModal();
                closeCartSidebar();
            });
        },
        onError: function(err) {
            alert('Si è verificato un errore durante il pagamento. Riprova.');
            closePayPalModal();
        },
        onCancel: function(data) {
            closePayPalModal();
        }
    }).render('#paypal-button-container');
}

function closePayPalModal() {
    const modal = document.getElementById('paypalModal');
    if (modal) {
        modal.remove();
    }
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

// === LIGHTBOX FOR PRODUCT IMAGES ===
function initializeLightbox() {
    var images = document.querySelectorAll('.product-card .product-image img');
    console.log('Found ' + images.length + ' product images');

    for (var i = 0; i < images.length; i++) {
        images[i].style.cursor = 'pointer';
        images[i].style.pointerEvents = 'auto';
        images[i].style.position = 'relative';
        images[i].style.zIndex = '100';

        // Usa addEventListener con capture per intercettare prima di tutto
        images[i].addEventListener('click', function(e) {
            e.stopPropagation();
            console.log('Image clicked!');
            var card = this.closest('.product-card');
            var name = card.querySelector('.product-name').textContent;
            openLightbox(this.src, name);
        }, true);
    }
}

function openLightboxFromCard(productCard) {
    const img = productCard.querySelector('.product-image img');
    const productName = productCard.querySelector('.product-name').textContent;
    if (img) {
        openLightbox(img.src, productName);
    }
}

function openLightbox(imageSrc, title) {
    const lightboxHTML = `
        <div id="imageLightbox" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 10000; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <button onclick="closeLightbox()" style="position: absolute; top: 20px; right: 20px; background: none; border: none; color: white; font-size: 40px; cursor: pointer; z-index: 10001;">&times;</button>
            <div style="max-width: 90%; max-height: 90%; text-align: center;">
                <img src="${imageSrc}" alt="${title}" style="max-width: 100%; max-height: 80vh; object-fit: contain; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
                <p style="color: white; margin-top: 15px; font-size: 18px; font-family: 'Cormorant Garamond', serif;">${title}</p>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', lightboxHTML);
    document.body.style.overflow = 'hidden';

    // Close on background click
    document.getElementById('imageLightbox').addEventListener('click', function(e) {
        if (e.target === this) {
            closeLightbox();
        }
    });

    // Close on ESC key
    document.addEventListener('keydown', handleLightboxEsc);
}

function handleLightboxEsc(e) {
    if (e.key === 'Escape') {
        closeLightbox();
    }
}

function closeLightbox() {
    const lightbox = document.getElementById('imageLightbox');
    if (lightbox) {
        lightbox.remove();
        document.body.style.overflow = 'auto';
        document.removeEventListener('keydown', handleLightboxEsc);
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

    console.log('Initializing lightbox...');
    initializeLightbox();

    console.log('===== My Mindful Mandala - E-commerce ready! =====');
});
