const $ = id => document.getElementById(id);
const itemEditor = $("itemEditor");
const previewItems = $("previewItems");
let nextId = 1;
let items = [];

const money = value => new Intl.NumberFormat("en-IN", {
  style: "currency", currency: "INR", minimumFractionDigits: 2
}).format(value || 0);

function dateForInput(date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}
function prettyDate(value) {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function addItem(description = "", quantity = 1, rate = 0) {
  items.push({ id: nextId++, description, quantity, rate });
  renderEditor();
  updatePreview();
}
function renderEditor() {
  itemEditor.replaceChildren();
  items.forEach(item => {
    const row = document.createElement("div");
    row.className = "item-row";
    row.innerHTML = `
      <div><label for="desc-${item.id}">ITEM / SERVICE</label><input id="desc-${item.id}" data-id="${item.id}" data-field="description" placeholder="e.g. Logo design"></div>
      <div><label for="qty-${item.id}">QTY</label><input id="qty-${item.id}" data-id="${item.id}" data-field="quantity" type="number" min="1" step="1"></div>
      <div><label for="rate-${item.id}">RATE ₹</label><input id="rate-${item.id}" data-id="${item.id}" data-field="rate" type="number" min="0" step="0.01"></div>
      <button class="remove-item" data-remove="${item.id}" type="button" aria-label="Remove item">×</button>`;
    row.querySelector(`[data-field="description"]`).value = item.description;
    row.querySelector(`[data-field="quantity"]`).value = item.quantity;
    row.querySelector(`[data-field="rate"]`).value = item.rate;
    itemEditor.appendChild(row);
  });
}
function updatePreview() {
  $("previewBusiness").textContent = $("businessName").value || "Your business";
  $("previewNumber").textContent = $("invoiceNumber").value || "—";
  $("previewDate").textContent = prettyDate($("invoiceDate").value);
  $("previewCustomer").textContent = $("customerName").value || "Your client";
  $("previewCustomerEmail").textContent = $("customerEmail").value || "";
  $("previewDue").textContent = prettyDate($("dueDate").value);
  $("previewEmail").textContent = $("businessEmail").value || "";
  $("previewNotes").textContent = $("notes").value || "Thank you for your business!";
  const rate = Number($("taxRate").value) || 0;
  $("previewTaxRate").textContent = rate;

  previewItems.replaceChildren();
  let subtotal = 0;
  items.forEach(item => {
    const amount = item.quantity * item.rate;
    subtotal += amount;
    const row = document.createElement("tr");
    [item.description || "New item", item.quantity, money(item.rate), money(amount)].forEach(value => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.appendChild(cell);
    });
    previewItems.appendChild(row);
  });
  if (items.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 4;
    cell.textContent = "Add an item to get started";
    row.appendChild(cell);
    previewItems.appendChild(row);
  }
  const tax = subtotal * rate / 100;
  $("previewSubtotal").textContent = money(subtotal);
  $("previewTax").textContent = money(tax);
  $("previewTotal").textContent = money(subtotal + tax);
}

itemEditor.addEventListener("input", event => {
  const field = event.target.dataset.field;
  if (!field) return;
  const item = items.find(entry => entry.id === Number(event.target.dataset.id));
  if (!item) return;
  if (field === "description") item.description = event.target.value;
  if (field === "quantity") item.quantity = Math.max(1, Number(event.target.value) || 1);
  if (field === "rate") item.rate = Math.max(0, Number(event.target.value) || 0);
  updatePreview();
});
itemEditor.addEventListener("click", event => {
  const button = event.target.closest("[data-remove]");
  if (!button) return;
  items = items.filter(item => item.id !== Number(button.dataset.remove));
  renderEditor();
  updatePreview();
});
$("addItemBtn").addEventListener("click", () => addItem());
$("printBtn").addEventListener("click", () => window.print());

const inputIds = ["businessName", "businessEmail", "invoiceNumber", "customerName", "customerEmail", "invoiceDate", "dueDate", "taxRate", "notes"];
inputIds.forEach(id => $(id).addEventListener("input", updatePreview));

function resetExample() {
  $("businessName").value = "Bloom Creative Studio";
  $("businessEmail").value = "hello@bloomstudio.example";
  $("invoiceNumber").value = "BB-2026-001";
  $("customerName").value = "Rhea Mehta";
  $("customerEmail").value = "aarav@example.com";
  $("invoiceDate").value = dateForInput(new Date());
  const due = new Date();
  due.setDate(due.getDate() + 14);
  $("dueDate").value = dateForInput(due);
  $("taxRate").value = "18";
  $("notes").value = "Thank you for supporting our little creative studio. We loved bringing this project to life!";
  items = [];
  nextId = 1;
  addItem("Brand identity design", 1, 2400);
  addItem("Social media templates", 3, 450);
}
$("resetBtn").addEventListener("click", resetExample);
resetExample();
