
document.addEventListener("DOMContentLoaded", fetchProducts);
//get products
function fetchProducts() {
  fetch("/api/fridge-products")
    .then((response) => response.json())
    .then((products) => {
      renderProducts(products);
    })
    .catch((err) => console.error("ERROR loading products:", err));
}

function renderProducts(products) {
  
  document.querySelectorAll(".category-container").forEach((container) => (container.innerHTML = ""));

  //produktu kastes
  products.forEach((product) => {
    
    let productWrapper = document.createElement("div");
    productWrapper.classList.add("product-box");
    productWrapper.setAttribute("data-expiry", product.expiry_date);

    let box = document.createElement("div");
    box.classList.add("box");

    
    let iconElement = document.createElement("div");
    iconElement.classList.add("icon");
    
    iconElement.innerText = product.icon; 


    let content = document.createElement("div");
    content.classList.add("product-content");
    content.innerHTML = `<strong>${product.product_name}</strong><br>
                          <strong>${product.expiry_date}</strong><br>
                         Quantity: ${product.quantity}<br>
                         <p class="notes">${product.notes || ""}</p>`;

    box.appendChild(iconElement);
    box.appendChild(content);
    productWrapper.appendChild(box);

    //bridinajuma krasa 
    updateProductColor(productWrapper, product.expiry_date);

    //sadala kategorijas
    let categoryContainer = document.querySelector(`#${product.category} .category-container`);
    if (categoryContainer) {
      categoryContainer.appendChild(productWrapper);
    }

    //dzesana
    let editProductWrapper = document.createElement("div");
    editProductWrapper.classList.add("product-box");

    let editBox = document.createElement("div");
    editBox.classList.add("box");

    let deleteButton = document.createElement("button");
    deleteButton.textContent = "X";
    deleteButton.classList.add("delete-button");
    deleteButton.onclick = () => deleteProduct(product.id);

   
    editBox.appendChild(iconElement.cloneNode(true));
    editBox.appendChild(content.cloneNode(true));
    editBox.appendChild(deleteButton);
    editProductWrapper.appendChild(editBox);

    let editCategoryContainer = document.querySelector(`#edit-${product.category} .category-container`);
    if (editCategoryContainer) {
      editCategoryContainer.appendChild(editProductWrapper);
    }
  });
}

//pievienosana
document.getElementById("productForm").addEventListener("submit", function (event) {
  event.preventDefault();

  let productName = document.getElementById("productName").value.trim();
  let expiryDate = document.getElementById("expiryDate").value;
  let quantity = document.getElementById("quantity").value;
  let category = document.getElementById("category").value;
  let icon = document.getElementById("icon").value;
  let notes = document.getElementById("notes").value;
  //obligatie
  if (!productName || !expiryDate || !quantity || !category ) {
    alert("Please fill out; name, quantity, expiry date and category!");
    return;
  }

  let product = { productName, expiryDate, quantity, category, icon, notes };

  //nosuta
  fetch("/api/fridge-products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Could not add product");
      }
    })
    .then((data) => {
      fetchProducts();
      document.getElementById("productForm").reset();
      showView("mainView");
    })
    .catch((err) => {
      console.error(err);
      alert("Kļūda: " + err.message);
    });
});

//dzesana id
function deleteProduct(productId) {
  fetch(`/api/fridge-products/${productId}`, { method: "DELETE" })
    .then((response) => {
      if (response.ok) {
        fetchProducts();
      } else {
        throw new Error("Could not delete product");
      }
    })
    .catch((err) => console.error("ERROR delete:", err));
}
//skati
function showView(view) {
  document.getElementById("mainView").style.display = "none";
  document.getElementById("addView").style.display = "none";
  document.getElementById("editView").style.display = "none";
  document.getElementById(view).style.display = "block";
}
//terminu krasas
function updateProductColor(element, expiryDate) {
    let expiry = new Date(expiryDate);
    let today = new Date();
    let timeDiff = expiry - today;
    let daysLeft = timeDiff / (1000 * 60 * 60 * 24); 

    if (daysLeft <= 3) { 
      element.style.backgroundColor = "#f2b0b0"; 
      element.style.color = "#4d4d4d"; 
  } else if (daysLeft <= 7) { 
      element.style.backgroundColor = "#f2d4b0"; 
      element.style.color = "#4d4d4d"; 
  }
}

document.addEventListener("DOMContentLoaded", highlightExpiringProducts);