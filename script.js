const products = [
  { id: 1, name: "Camisa APONTI", category: "vestuario", price: 39.90, icon: "👕" },
  { id: 2, name: "Boné APONTI", category: "vestuario", price: 29.90, icon: "🧢" },
  { id: 3, name: "Chaveiro APONTI", category: "acessorios", price: 9.90, icon: "🔑" },
  { id: 4, name: "Caneta APONTI", category: "estudo", price: 4.90, icon: "🖊️" },
  { id: 5, name: "Mousepad APONTI", category: "tech", price: 19.90, icon: "🖱️" },
  { id: 6, name: "Caneca APONTI", category: "acessorios", price: 24.90, icon: "☕" },
  { id: 7, name: "Adesivos APONTI", category: "acessorios", price: 5.90, icon: "✨" },
  { id: 8, name: "Caderno APONTI", category: "estudo", price: 19.90, icon: "📓" },
  { id: 9, name: "Suporte para celular", category: "tech", price: 14.90, icon: "📱" },
  { id: 10, name: "Cabo USB", category: "tech", price: 12.90, icon: "🔌" },
  { id: 11, name: "Ecobag APONTI", category: "acessorios", price: 24.90, icon: "👜" },
  { id: 12, name: "Cordão APONTI", category: "acessorios", price: 8.90, icon: "🎫" }
];

let cart = [];
let activeCategory = "todos";

const productGrid = document.getElementById("productGrid");
const cartDrawer = document.getElementById("cartDrawer");
const overlay = document.getElementById("overlay");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartCount = document.getElementById("cartCount");
const checkoutModal = document.getElementById("checkoutModal");
const formError = document.getElementById("formError");

const money = value =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function renderProducts() {
  const search = document.getElementById("searchInput").value.trim().toLowerCase();

  const filtered = products.filter(product => {
    const matchesCategory = activeCategory === "todos" || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(search);
    return matchesCategory && matchesSearch;
  });

  productGrid.innerHTML = filtered.map(product => `
    <article class="product-card">
      <div class="product-image" aria-hidden="true">${product.icon}</div>
      <div class="product-info">
        <small>APONTI STORE</small>
        <h3>${product.name}</h3>
        <div class="price">${money(product.price)}</div>
        <button class="add-button" type="button" data-add="${product.id}">
          Adicionar ao carrinho
        </button>
      </div>
    </article>
  `).join("");

  document.querySelectorAll("[data-add]").forEach(button => {
    button.addEventListener("click", () => addToCart(Number(button.dataset.add)));
  });
}

function addToCart(productId) {
  const product = products.find(item => item.id === productId);
  const existing = cart.find(item => item.id === productId);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  renderCart();

  // ERRO 1 — Heurística: Visibilidade do status do sistema
  // Não há feedback visual/ textual depois de adicionar um produto.
}

function renderCart() {
  cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (!cart.length) {
    cartItems.innerHTML = `<p class="empty-cart">Seu carrinho está vazio.</p>`;
    cartTotal.textContent = money(0);
    return;
  }

  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-icon" aria-hidden="true">${item.icon}</div>
      <div>
        <h4>${item.name}</h4>
        <p>${money(item.price)}</p>
        <div class="qty">
          <button type="button" data-minus="${item.id}" aria-label="Diminuir quantidade">−</button>
          <strong>${item.quantity}</strong>
          <button type="button" data-plus="${item.id}" aria-label="Aumentar quantidade">+</button>
        </div>
        <!-- ERRO 3 — Heurística: Controle e liberdade do usuário -->
        <!-- O link para remover o item foi omitido propositalmente. -->
      </div>
      <strong>${money(item.price * item.quantity)}</strong>
    </div>
  `).join("");

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartTotal.textContent = money(total);

  document.querySelectorAll("[data-minus]").forEach(button => {
    button.addEventListener("click", () => changeQuantity(Number(button.dataset.minus), -1));
  });
  document.querySelectorAll("[data-plus]").forEach(button => {
    button.addEventListener("click", () => changeQuantity(Number(button.dataset.plus), 1));
  });
}

function changeQuantity(productId, amount) {
  const item = cart.find(product => product.id === productId);
  if (!item) return;

  item.quantity += amount;

  // ERRO 5 — Heurística: Prevenção de erros
  // A interface não impede uma quantidade inválida de chegar a zero.
  if (item.quantity <= 0) {
    item.quantity = 0;
  }

  renderCart();
}

function openCart() {
  cartDrawer.classList.add("open");
  overlay.classList.remove("hidden");
}
function closeCart() {
  cartDrawer.classList.remove("open");
  overlay.classList.add("hidden");
}

document.getElementById("openCart").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);

document.querySelectorAll(".category").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".category").forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    activeCategory = button.dataset.category;
    renderProducts();
  });
});

document.getElementById("searchInput").addEventListener("input", renderProducts);

document.getElementById("checkoutButton").addEventListener("click", () => {
  if (!cart.length) {
    // ERRO 7 — Heurística: Recuperação diante de erros
    // Mensagem pouco útil para orientar o usuário.
    formError.textContent = "ERR_CART_001";
    openCart();
    return;
  }

  // ERRO 2 — Heurística: Correspondência com o mundo real
  // O botão usa linguagem técnica: "Processar transação".
  checkoutModal.classList.remove("hidden");
});

document.getElementById("closeCheckout").addEventListener("click", () => {
  checkoutModal.classList.add("hidden");
});

document.getElementById("continueButton").addEventListener("click", () => {
  checkoutModal.classList.add("hidden");
  document.getElementById("successMessage").classList.add("hidden");
  document.getElementById("checkoutForm").classList.remove("hidden");
});

document.getElementById("checkoutForm").addEventListener("submit", event => {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const payment = document.getElementById("payment").value;
  const terms = document.getElementById("terms").checked;

  // ERRO 6 — Heurística: Reconhecimento em vez de memória
  // A forma de pagamento precisa ser escolhida novamente no checkout,
  // sem resumo visível do pedido/seleção anterior.
  if (!name || !email || !payment || !terms) {
    // ERRO 7 — Heurística: Recuperação diante de erros
    formError.textContent = "ERR_CHECKOUT_004";
    return;
  }

  // ERRO 4 — Heurística: Consistência e padronização
  // O botão final possui uma apresentação diferente do padrão da ação principal.
  document.querySelector(".modal-card .primary-button.full").textContent = "EXECUTE_ORDER";

  document.getElementById("checkoutForm").classList.add("hidden");
  document.getElementById("successMessage").classList.remove("hidden");
  cart = [];
  renderCart();
});

renderProducts();
renderCart();
