let products = [];
let basket = null;
const cart_items = document.getElementById("cart__items");
const pricesMap = new Map();

/**
 * Cette fonction construit le DOM
 * Je récupère les informations du local storage que je met dans la variable "basket"
 */
async function buildDom() {
  products = [];
  cart_items.innerHTML = "";

  basket = JSON.parse(localStorage.getItem("MyKanapCart"));
  if (basket === null || basket == 0) {
    alert(
      "Votre panier est vide, veuillez sélectionner vos produits dans la page d'acceuil"
    );
    document.querySelector("h1").innerText = "Votre panier est vide !";
  } else {
    const usedIds = new Map();
    for (let p of basket) {
      const pId = p.id.split("_");
      const idProduct = pId[0];
      const colorProduct = pId[1];
      let product = null;
      products.push(idProduct); // Le tableau products qui contient les id est indispensable pour l'envoi du formulaire au serveur

      if (usedIds.has(idProduct)) {
        product = usedIds.get(idProduct);
        buildDomFromProduct(product, colorProduct, p.quantity);
      } else {
        const callApi = await fetch(
          "https://api-kanap-ntcl.onrender.com/api/products/" + idProduct
        );
        product = await callApi.json();
        usedIds.set(idProduct, product);
        buildDomFromProduct(product, colorProduct, p.quantity);
      }
      if (!pricesMap.has(p.id)) {
        const data = {
          quantity: p.quantity,
          price: product.price,
        };
        pricesMap.set(p.id, data);
      }
    }
    refreshNumberProduct();
  }
}
buildDom();

/**
 * Cette fonction construit le DOM
 * @param {string} product
 * @param {string} color
 * @param {number} quantity
 */
function buildDomFromProduct(product, color, quantity) {
  let article = document.createElement("article");
  article.className = "cart__item";
  article.setAttribute("data-id", `${product._id}`);
  article.setAttribute("data-color", `${color}`);
  let imgProduct = document.createElement("div");
  imgProduct.className = "cart__item__img";
  article.appendChild(imgProduct);
  let image = document.createElement("img");
  image.src = `${product.imageUrl}`;
  image.alt = `${product.altTxt}`;
  imgProduct.appendChild(image);

  let itemContent = document.createElement("div");
  itemContent.className = "cart__item__content";
  article.appendChild(itemContent);

  let itemContentTitlePrice = document.createElement("div");
  itemContentTitlePrice.className = "cart__item__content__titlePrice";
  itemContent.appendChild(itemContentTitlePrice);

  let productTitle = document.createElement("h2");
  productTitle.innerHTML = `${product.name}`;
  itemContentTitlePrice.appendChild(productTitle);

  let productColor = document.createElement("p");
  productColor.innerHTML = `${color}`;
  itemContentTitlePrice.appendChild(productColor);

  let productPrice = document.createElement("p");
  productPrice.innerHTML = `${product.price} €`;
  itemContentTitlePrice.appendChild(productPrice);

  let itemContentSettings = document.createElement("div");
  itemContentSettings.className = "cart__item__content__settings";
  itemContent.appendChild(itemContentSettings);

  let itemContentSettingsQuantity = document.createElement("div");
  itemContentSettingsQuantity.className =
    "cart__item__content__settings__quantity";
  itemContentSettings.appendChild(itemContentSettingsQuantity);
  let Pquantité = document.createElement("p");
  Pquantité.innerHTML = "Qté : ";
  itemContentSettingsQuantity.appendChild(Pquantité);

  let inputQuantity = document.createElement("input");
  inputQuantity.value = `${quantity}`;
  inputQuantity.className = "itemQuantity";
  inputQuantity.setAttribute("type", "number");
  inputQuantity.setAttribute("min", "1");
  inputQuantity.setAttribute("max", "100");
  inputQuantity.setAttribute("name", "itemQuantity");
  itemContentSettingsQuantity.appendChild(inputQuantity);

  let itemContentSettingsDelete = document.createElement("div");
  itemContentSettingsDelete.className = "cart__item__content__settings__delete";
  itemContentSettings.appendChild(itemContentSettingsDelete);

  let deleteProductItem = document.createElement("p");
  deleteProductItem.className = "deleteItem";
  deleteProductItem.innerHTML = "Supprimer";
  itemContentSettingsDelete.appendChild(deleteProductItem);
  cart_items.appendChild(article);
  deleteProduct(deleteProductItem, product.price);
  changeQuantityProduct(inputQuantity, product.price);
}

/**
 * Cette fonction met à jour la quantité de produits et le prix total de la page panier et l'affiche dans le DOM
 */
function refreshNumberProduct() {
  document.getElementById("totalQuantity").innerHTML = getNumberProduct();
  document.getElementById("totalPrice").innerHTML = getTotalPrice();
}

/**
 * Cette fonction supprime un article
 * @param {string} itemToDelete
 * @param {number} price
 */
function deleteProduct(itemToDelete) {
  itemToDelete.addEventListener("click", function (e) {
    let article = itemToDelete.closest("article");
    const idProduct = article.dataset.id + "_" + article.dataset.color;
    removeFromCart(idProduct);
    cart_items.removeChild(article);
    products = products.filter((p) => p.id !== article.dataset.id);
    pricesMap.delete(idProduct);
    refreshNumberProduct();
  });
}

/**
 * Cette fonction paramètre les inputs de modification de quantité
 Si une valeur entrée n'est pas entre 1 et 100, l'input se remet automatiquement à la valeur précédente
 Sinon elle appelle la fonction changeQuantity()
 * @param {string} itemToChange 
 * @param {number} price 
 */
function changeQuantityProduct(itemToChange, price) {
  itemToChange.addEventListener("change", function (e) {
    let article = itemToChange.closest("article");
    const idProduct = article.dataset.id + "_" + article.dataset.color;

    const regexInput = /^[1-9][0-9]?$|^100$/; // Regex qui permet de contrôler de 1 à 100

    if (!regexInput.test(e.target.value)) {
      alert("Veuillez sélectionner une valeur entre 1 et 100");
      const storeValue = getQuantity(idProduct);
      const value =
        storeValue === -1 ? parseInt(e.target.defaultValue) : storeValue;
      e.target.value = value; // Je réaffecte la valeur prise dans le LS dans l'input
    } else {
      changeQuantity(idProduct, e.target.valueAsNumber);
      if (pricesMap.has(idProduct)) {
        const data = pricesMap.get(idProduct);
        data.quantity = e.target.valueAsNumber;
        pricesMap.set(idProduct, data);
      }
      refreshNumberProduct(); // Je recalcul la quantité et le prix total
    }
  });
}

/**
 *  Cette fonction calcul le prix total des produits de la page panier
 * @returns Le prix total
 */
function getTotalPrice() {
  const it = pricesMap.values();
  let res = it.next();
  let total = 0;
  while (!res.done) {
    const val = res.value;
    total += val.quantity * val.price;
    res = it.next();
  }
  return total;
}

//-------------------------------------------------------Gestion du formulaire----------------------------------------------------------

// Je récupère les sélecteurs du formulaire

const firstName = document.getElementById("firstName");
const lastName = document.getElementById("lastName");
const address = document.getElementById("address");
const city = document.getElementById("city");
const email = document.getElementById("email");

// Récupération des messages d'erreur

const firstNameError = document.getElementById("firstNameErrorMsg");
const lastNameError = document.getElementById("lastNameErrorMsg");
const addressError = document.getElementById("addressErrorMsg");
const cityError = document.getElementById("cityErrorMsg");
const emailError = document.getElementById("emailErrorMsg");

// Récupération du bouton de confirmation

const confirm = document.getElementById("order");

// Déclaration des Regex du formulaire

const regexName = /^[^0-9_!¡?÷?¿/\\+=@#$%ˆ&*(){}|~<>,;:[\]]{1,20}$/;
const regexAdress = /^[^_!¡?÷?¿\\+=@#$%ˆ&*()^{}|~<>,;:[\]]{2,45}$/;
const regexCity = /^[^0-9_!¡?÷?¿/\\+=@#$%ˆ&*(){}|~<>;:[\]]{2,20}$/;
const regexMail = /^[a-z0-9._-éèàùâôûîê]+@[a-z0-9._-]{2,}\.[a-z]{2,4}$/;

/**
 * Cette fonction contrôle les champs de saisie du formulaires
 * Si l'utilisateur ne respecte pas les contraintes des Regex un message d'erreur est affiché
 */

function controlInputs() {
  // Setting firstName
  firstName.addEventListener("input", (e) => {
    if (e.target.value.match(regexName)) {
      firstNameError.innerHTML = "";
    } else {
      firstNameError.innerHTML =
        "Le prénom doit avoir entre 1 et 20 caractères. Sans caractères spéciaux ni chiffres. Les tirets et accents sont acceptés";
    }
  });

  // Setting Name
  lastName.addEventListener("input", (e) => {
    if (e.target.value.match(regexName)) {
      lastNameError.innerHTML = "";
    } else {
      lastNameError.innerHTML =
        "Le nom doit avoir entre 1 et 20 caractères. Sans caractères spéciaux ni chiffres. Les tirets et accents sont acceptés";
    }
  });

  // Setting Adress
  address.addEventListener("input", (e) => {
    if (e.target.value.match(regexAdress)) {
      addressError.innerHTML = "";
    } else {
      addressError.innerHTML =
        "l'adresse doit comporter entre 2 et 45 caractères. Sans caractères spéciaux. Les tirets et accents sont acceptés";
    }
  });

  // Setting City
  city.addEventListener("input", (e) => {
    if (e.target.value.match(regexCity)) {
      cityError.innerHTML = "";
    } else {
      cityError.innerHTML =
        "La ville doit avoir entre 2 et 20 caractères. Sans caractères spéciaux ni chiffres. Les tirets et accents sont acceptés";
    }
  });

  // Setting Email
  email.addEventListener("input", (e) => {
    if (e.target.value.match(regexMail)) {
      emailError.innerHTML = "";
    } else {
      emailError.innerHTML = "Le format de l'adresse mail n'est pas valide";
    }
  });
}
controlInputs();

/**
 * Configuration du bouton "Commander"
 * Si le bouton est cliqué je stock les données saisie par l'utilisateur dans un objet contact
 * Je récupère les données du formulaire et les id de mes articles dans le même objet
 * que j' envoie sur l'API, en échange l'API m'envoie un numéro de commande
 */

function orderButton() {
  order.addEventListener("click", (event) => {
    event.preventDefault();
    if (basket === null || basket == 0) {
      alert(
        "votre panier est vide, veuillez sélectionner vos produits dans la page d'acceuil"
      );
    } else {
      if (
        regexName.test(firstName.value) &&
        regexName.test(lastName.value) &&
        regexCity.test(city.value) &&
        regexAdress.test(address.value) &&
        regexMail.test(email.value) == true
      ) {
        const contact = {
          firstName: firstName.value,
          lastName: lastName.value,
          address: address.value,
          city: city.value,
          email: email.value,
        };

        const order = {
          contact,
          products,
        };
        // j'envoi les données sur l'api au format JSON avec une requête POST
        const options = {
          method: "POST",
          body: JSON.stringify(order),
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        };
        fetch("http://localhost:3000/api/products/order", options)
          .then((response) => response.json())
          .then((data) => {
            localStorage.clear(); // Je supprime tout élément du local storage
            document.location.href = "confirmation.html?id=" + data.orderId; // Je redirige sur la page confirmation.html et ajoute à l'url le numéro de commande
          });
      } else {
        alert("Veuillez revérifier les informations saisie dans le formulaire");
      }
    }
  });
}
orderButton();
